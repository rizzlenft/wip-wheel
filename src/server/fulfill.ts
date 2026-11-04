/**
 * Wearable fulfillment:
 * 1) In-server Polygon transfer via EnvVar FULFILLER_PRIVATE_KEY (DCL-only — preferred)
 * 2) Optional FULFILL_URL webhook fallback (external worker)
 *
 * onchainTransfer is dynamic-imported only when fulfilling — keep client path lean.
 */
import { EnvVar, Storage } from '@dcl/sdk/server'
import type { DailyClaim } from './dailyClaims'
import { listPendingWearables, markClaimFulfilled } from './dailyClaims'

const RETRY_INTERVAL_SEC = 45
const LAST_ERROR_KEY = 'lastFulfillError'
let retryAcc = 0
let fulfillInFlight = false

type FulfillOk = { ok: true; txHash: string; urn: string; name?: string }
type FulfillErr = { ok: false; error: string }

async function recordFulfillError(claimId: string, error: string): Promise<void> {
  try {
    await Storage.set(
      LAST_ERROR_KEY,
      JSON.stringify({ claimId, error: error.slice(0, 300), at: new Date().toISOString() })
    )
  } catch {
    /* ignore */
  }
}

export async function requestWearableFulfillment(claim: DailyClaim): Promise<void> {
  if (claim.prizeType !== 'wearable' || claim.status !== 'pending_fulfillment') return
  try {
    const result = await fulfillClaim(claim)
    if (result.ok) {
      await markClaimFulfilled(claim.claimId, result.txHash, result.urn)
      console.log(`[SERVER] fulfilled ${claim.claimId} tx=${result.txHash}`)
    } else {
      console.error(`[SERVER] fulfill failed ${claim.claimId}: ${result.error}`)
      await recordFulfillError(claim.claimId, result.error)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[SERVER] fulfill error ${claim.claimId}`, err)
    await recordFulfillError(claim.claimId, msg)
  }
}

/** While the world has players, retry any stuck pending wearable rows. */
export function fulfillRetryTick(dt: number): void {
  retryAcc += dt
  if (retryAcc < RETRY_INTERVAL_SEC) return
  retryAcc = 0
  if (fulfillInFlight) return
  fulfillInFlight = true
  void retryPendingWearables().finally(() => {
    fulfillInFlight = false
  })
}

async function retryPendingWearables(): Promise<void> {
  const rows = await listPendingWearables()
  if (rows.length === 0) return
  console.log(`[SERVER] retrying ${rows.length} pending wearable claim(s)`)
  for (const claim of rows) {
    await requestWearableFulfillment(claim)
  }
}

async function fulfillClaim(claim: DailyClaim): Promise<FulfillOk | FulfillErr> {
  const onchain = await tryOnchain(claim)
  if (onchain) return onchain
  return callFulfillWorker(claim)
}

async function tryOnchain(claim: DailyClaim): Promise<FulfillOk | FulfillErr | null> {
  try {
    const { hasFulfillerKey, fulfillWearableOnchain } = await import('./onchainTransfer')
    if (!(await hasFulfillerKey())) return null
    const result = await fulfillWearableOnchain({ claimId: claim.claimId, wallet: claim.wallet })
    return { ok: true, txHash: result.txHash, urn: result.urn, name: result.name }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('FULFILLER_PRIVATE_KEY missing')) return null
    return { ok: false, error: msg.slice(0, 200) }
  }
}

async function callFulfillWorker(claim: DailyClaim): Promise<FulfillOk | FulfillErr> {
  const url = ((await EnvVar.get('FULFILL_URL')) || '').trim()
  const secret = ((await EnvVar.get('FULFILL_SECRET')) || '').trim()
  if (!url) {
    return { ok: false, error: 'no FULFILLER_PRIVATE_KEY and no FULFILL_URL (pending queue only)' }
  }
  if (!secret) {
    return { ok: false, error: 'FULFILL_SECRET not set' }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${secret}`
    },
    body: JSON.stringify({
      claimId: claim.claimId,
      wallet: claim.wallet,
      label: claim.label,
      prizeType: claim.prizeType,
      utcDay: claim.utcDay,
      createdAt: claim.createdAt
    })
  })

  const text = await res.text()
  let body: Record<string, unknown> = {}
  try {
    body = JSON.parse(text) as Record<string, unknown>
  } catch {
    body = { raw: text }
  }

  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}: ${String(body.error || text).slice(0, 200)}` }
  }
  if (!body.ok || typeof body.txHash !== 'string' || typeof body.urn !== 'string') {
    return { ok: false, error: `bad worker response: ${text.slice(0, 200)}` }
  }
  return {
    ok: true,
    txHash: body.txHash,
    urn: body.urn,
    name: typeof body.name === 'string' ? body.name : undefined
  }
}

export async function logFulfillConfig(): Promise<void> {
  try {
    const { hasFulfillerKey } = await import('./onchainTransfer')
    if (await hasFulfillerKey()) {
      console.log('[SERVER] wearable autopilot ON (in-server EnvVar FULFILLER_PRIVATE_KEY)')
      return
    }
  } catch {
    /* ignore */
  }
  const url = ((await EnvVar.get('FULFILL_URL')) || '').trim()
  if (url) {
    console.log(`[SERVER] wearable autopilot ON (webhook ${url})`)
    return
  }
  console.log('[SERVER] wearable autopilot OFF — set FULFILLER_PRIVATE_KEY (preferred) or FULFILL_URL')
}
