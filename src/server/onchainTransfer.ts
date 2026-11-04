/**
 * In-server Polygon wearable transfer (DCL Multiplayer Server only).
 * Uses micro-eth-signer (~10KB core) + fetch RPC — no viem.
 * Key from EnvVar FULFILLER_PRIVATE_KEY.
 *
 * Hammurabi isolates often lack Web Crypto. noble-curves CT scalar blinding
 * still calls crypto.getRandomValues during ECDSA sign — without a polyfill
 * every transfer throws and wins sit in pendingFulfillment (Bay demo 8 Oct).
 */
import { EnvVar, Storage } from '@dcl/sdk/server'
import { addr, Transaction, weigwei } from 'micro-eth-signer'
import { PRIZE_TREASURY } from '../shared/dailyCatalog'

const LEDGER_KEY = 'fulfilledClaimsLedger'
const DEFAULT_RPC = 'https://polygon-bor-rpc.publicnode.com'
const POLYGON_CHAIN_ID = 137n

export type OnchainFulfillRequest = {
  claimId: string
  wallet: string
}

type LedgerEntry = {
  claimId: string
  wallet: string
  urn: string
  name: string
  txHash: string
  at: string
}

let chainLock: Promise<void> = Promise.resolve()
let cryptoRngReady = false

/**
 * Ensure globalThis.crypto.getRandomValues exists before micro-eth-signer signs.
 * Entropy here only feeds noble CT blinding / optional hedged sig noise — not keygen.
 */
export function ensureCryptoRng(): void {
  if (cryptoRngReady) return
  const g = globalThis as typeof globalThis & { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }
  if (typeof g.crypto?.getRandomValues === 'function') {
    cryptoRngReady = true
    return
  }

  let counter = 0
  const getRandomValues = (arr: Uint8Array): Uint8Array => {
    let state =
      (BigInt(Date.now()) << 20n) ^ (BigInt(++counter) << 8n) ^ BigInt((Math.random() * 0xffffffff) >>> 0)
    if (state === 0n) state = 0xdeadbeefn
    for (let i = 0; i < arr.length; i++) {
      state ^= state >> 12n
      state ^= state << 25n
      state ^= state >> 27n
      arr[i] = Number((state * 0x2545f4914f6cdd1dn >> 32n) & 0xffn)
    }
    return arr
  }

  try {
    if (g.crypto && typeof g.crypto === 'object') {
      g.crypto.getRandomValues = getRandomValues
    } else {
      Object.defineProperty(g, 'crypto', {
        value: { getRandomValues },
        configurable: true,
        writable: true
      })
    }
  } catch {
    ;(g as { crypto: { getRandomValues: typeof getRandomValues } }).crypto = { getRandomValues }
  }
  cryptoRngReady = true
}

function withChainLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chainLock.then(fn, fn)
  chainLock = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

function pad32(hexOrAddr: string): string {
  return hexOrAddr.replace(/^0x/i, '').toLowerCase().padStart(64, '0')
}

/** ERC-721 safeTransferFrom(address,address,uint256) selector 0x42842e0e */
function encodeSafeTransferFrom(from: string, to: string, tokenId: bigint): string {
  return '0x42842e0e' + pad32(from) + pad32(to) + pad32('0x' + tokenId.toString(16))
}

function parseUrn(urn: string): { contract: string; tokenId: bigint } {
  const parts = urn.split(':')
  if (parts.length < 7 || !parts[4]?.startsWith('0x')) {
    throw new Error(`unrecognized wearable urn: ${urn}`)
  }
  return { contract: parts[4], tokenId: BigInt(parts[parts.length - 1]) }
}

async function rpc(rpcUrl: string, method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
  const body = (await res.json()) as { result?: unknown; error?: { message?: string } }
  if (body.error) throw new Error(body.error.message || 'RPC error')
  return body.result
}

async function loadLedger(): Promise<LedgerEntry[]> {
  const raw = await Storage.get<string>(LEDGER_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as LedgerEntry[]
  } catch {
    return []
  }
}

async function saveLedger(rows: LedgerEntry[]): Promise<void> {
  const ok = await Storage.set(LEDGER_KEY, JSON.stringify(rows))
  if (!ok) console.error('[SERVER] failed to persist fulfilledClaimsLedger')
}

async function listTreasuryUrns(treasury: string): Promise<{ urn: string; name: string }[]> {
  const url = `https://peer.decentraland.org/lambdas/users/${treasury}/wearables?pageNum=1&pageSize=1000`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Lambdas API ${res.status}`)
  const data = (await res.json()) as {
    elements?: { name?: string; individualData?: { id: string }[] }[]
  }
  const out: { urn: string; name: string }[] = []
  for (const el of data.elements || []) {
    for (const ind of el.individualData || []) {
      out.push({ urn: ind.id, name: el.name || 'wearable' })
    }
  }
  return out
}

export async function hasFulfillerKey(): Promise<boolean> {
  const pk = ((await EnvVar.get('FULFILLER_PRIVATE_KEY')) || '').trim()
  return pk.startsWith('0x') && pk.length >= 66
}

export async function fulfillWearableOnchain(req: OnchainFulfillRequest): Promise<{
  ok: true
  txHash: string
  urn: string
  name: string
  alreadyDone?: boolean
}> {
  ensureCryptoRng()

  const pk = ((await EnvVar.get('FULFILLER_PRIVATE_KEY')) || '').trim()
  const treasury = ((await EnvVar.get('PRIZE_TREASURY')) || PRIZE_TREASURY).trim()
  const rpcUrl = ((await EnvVar.get('POLYGON_RPC_URL')) || DEFAULT_RPC).trim() || DEFAULT_RPC

  if (!pk.startsWith('0x') || pk.length < 66) throw new Error('FULFILLER_PRIVATE_KEY missing')
  if (!/^0x[a-fA-F0-9]{40}$/.test(req.wallet)) throw new Error('invalid wallet')
  if (!req.claimId) throw new Error('claimId required')

  return withChainLock(async () => {
    const ledger = await loadLedger()
    const prior = ledger.find((r) => r.claimId === req.claimId)
    if (prior) {
      return {
        ok: true as const,
        txHash: prior.txHash,
        urn: prior.urn,
        name: prior.name,
        alreadyDone: true
      }
    }

    const fromAddr = addr.fromPrivateKey(pk)
    if (fromAddr.toLowerCase() !== treasury.toLowerCase()) {
      throw new Error(`key ${fromAddr} != treasury ${treasury}`)
    }

    const usedUrns = new Set(ledger.map((r) => r.urn))
    const tokens = await listTreasuryUrns(treasury)
    const pick = tokens.find((t) => !usedUrns.has(t.urn))
    if (!pick) throw new Error('no unsent wearables left in treasury')

    const { contract, tokenId } = parseUrn(pick.urn)
    const to = req.wallet.toLowerCase()
    const data = encodeSafeTransferFrom(treasury, to, tokenId)

    const nonceHex = (await rpc(rpcUrl, 'eth_getTransactionCount', [fromAddr, 'pending'])) as string
    const nonce = BigInt(nonceHex)

    let maxPriority = weigwei.decode('30')
    let maxFee = weigwei.decode('80')
    try {
      const tip = (await rpc(rpcUrl, 'eth_maxPriorityFeePerGas', [])) as string
      if (tip) maxPriority = BigInt(tip)
      const gasPrice = (await rpc(rpcUrl, 'eth_gasPrice', [])) as string
      if (gasPrice) {
        const gp = BigInt(gasPrice)
        maxFee = gp * 2n > maxPriority * 2n ? gp * 2n : maxPriority * 2n
      }
    } catch {
      /* keep defaults */
    }

    let gasLimit = 120000n
    try {
      const est = (await rpc(rpcUrl, 'eth_estimateGas', [
        { from: fromAddr, to: contract, data, value: '0x0' }
      ])) as string
      if (est) gasLimit = (BigInt(est) * 12n) / 10n
    } catch {
      /* keep default */
    }

    const tx = Transaction.prepare({
      to: contract,
      value: 0n,
      data,
      nonce,
      maxFeePerGas: maxFee,
      maxPriorityFeePerGas: maxPriority,
      gasLimit,
      chainId: POLYGON_CHAIN_ID
    })
    // false = RFC6979 only (no hedged noise); CT blinding still needs ensureCryptoRng()
    const signed = tx.signBy(pk, false)
    const raw = signed.toHex()
    const txHash = (await rpc(rpcUrl, 'eth_sendRawTransaction', [raw])) as string
    if (!txHash || !txHash.startsWith('0x')) throw new Error(`bad tx hash: ${txHash}`)

    const entry: LedgerEntry = {
      claimId: req.claimId,
      wallet: to,
      urn: pick.urn,
      name: pick.name,
      txHash,
      at: new Date().toISOString()
    }
    ledger.push(entry)
    await saveLedger(ledger)

    console.log(`[SERVER] onchain transfer ${req.claimId} → ${to} ${pick.name} ${txHash}`)
    return { ok: true as const, txHash, urn: pick.urn, name: pick.name }
  })
}
