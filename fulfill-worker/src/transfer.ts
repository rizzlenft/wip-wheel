import { createWalletClient, http, parseAbi, type Hash } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ERC721_ABI = parseAbi([
  'function safeTransferFrom(address from, address to, uint256 tokenId)'
])

export type FulfillRequest = {
  claimId: string
  wallet: string
  label?: string
  prizeType?: string
}

export type ClaimLedgerEntry = {
  claimId: string
  wallet: string
  urn: string
  name: string
  txHash: string
  at: string
}

function dataDir(): string {
  const dir = process.env.DATA_DIR || join(process.cwd(), 'data')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function ledgerPath(): string {
  return join(dataDir(), 'fulfilled-claims.json')
}

function loadLedger(): ClaimLedgerEntry[] {
  const p = ledgerPath()
  if (!existsSync(p)) return []
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as ClaimLedgerEntry[]
  } catch {
    return []
  }
}

function saveLedger(rows: ClaimLedgerEntry[]) {
  writeFileSync(ledgerPath(), JSON.stringify(rows, null, 2))
}

function parseUrn(urn: string): { contract: `0x${string}`; tokenId: bigint } {
  // urn:decentraland:matic:collections-v2:<contract>:<itemId>:<tokenId>
  const parts = urn.split(':')
  if (parts.length < 7 || !parts[4]?.startsWith('0x')) {
    throw new Error(`unrecognized wearable urn: ${urn}`)
  }
  const contract = parts[4] as `0x${string}`
  const tokenId = BigInt(parts[parts.length - 1])
  return { contract, tokenId }
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

let chainLock: Promise<void> = Promise.resolve()

function withChainLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chainLock.then(fn, fn)
  chainLock = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

export async function fulfillWearable(req: FulfillRequest): Promise<{
  ok: true
  txHash: string
  urn: string
  name: string
  alreadyDone?: boolean
}> {
  const pk = process.env.FULFILLER_PRIVATE_KEY
  const treasury = (process.env.PRIZE_TREASURY || '0xd9618C06458e98a831F503194cC8b62fB0384d45') as `0x${string}`
  const rpc = process.env.POLYGON_RPC_URL || 'https://polygon-bor-rpc.publicnode.com'

  if (!pk?.startsWith('0x')) throw new Error('FULFILLER_PRIVATE_KEY missing')
  if (!/^0x[a-fA-F0-9]{40}$/.test(req.wallet)) throw new Error('invalid wallet')
  if (!req.claimId) throw new Error('claimId required')

  return withChainLock(async () => {
    const ledger = loadLedger()
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

    const account = privateKeyToAccount(pk as `0x${string}`)
    if (account.address.toLowerCase() !== treasury.toLowerCase()) {
      throw new Error(`key ${account.address} != treasury ${treasury}`)
    }

    const usedUrns = new Set(ledger.map((r) => r.urn))
    const tokens = await listTreasuryUrns(treasury)
    const pick = tokens.find((t) => !usedUrns.has(t.urn))
    if (!pick) throw new Error('no unsent wearables left in treasury')

    const { contract, tokenId } = parseUrn(pick.urn)
    const walletClient = createWalletClient({
      account,
      chain: polygon,
      transport: http(rpc)
    })

    const hash: Hash = await walletClient.writeContract({
      address: contract,
      abi: ERC721_ABI,
      functionName: 'safeTransferFrom',
      args: [treasury, req.wallet.toLowerCase() as `0x${string}`, tokenId]
    })

    const entry: ClaimLedgerEntry = {
      claimId: req.claimId,
      wallet: req.wallet.toLowerCase(),
      urn: pick.urn,
      name: pick.name,
      txHash: hash,
      at: new Date().toISOString()
    }
    ledger.push(entry)
    saveLedger(ledger)

    return { ok: true as const, txHash: hash, urn: pick.urn, name: pick.name }
  })
}
