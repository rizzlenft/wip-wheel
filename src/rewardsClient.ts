import { executeTask } from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/players'
import { signedFetch } from '~system/SignedFetch'
import { REWARDS_API_BASE_URL, REWARDS_API_ENABLED, REWARDS_DEV_WALLET } from './rewardsConfig'

export type DailySpinOk = {
  ok: true
  claimId: string
  prizeId: string
  label: string
  type: string
  wheelIndex: number
  flavor: string
  status: string
}

export type DailySpinErr = {
  ok: false
  error: string
  message?: string
  claimId?: string
  label?: string
  prizeId?: string
  wheelIndex?: number
}

export type DailySpinResult = DailySpinOk | DailySpinErr

export type DailyStatusOk = {
  ok: true
  wallet: string
  utcDay: string
  claimed: boolean
  claim: null | {
    claimId: string
    prizeId: string
    label: string
    wheelIndex: number
    status: string
  }
}

export function rewardsApiLive(): boolean {
  return REWARDS_API_ENABLED && REWARDS_API_BASE_URL.length > 0
}

export function playerCanClaimRewards(): { ok: true; wallet: string; name: string } | { ok: false; reason: string } {
  const player = getPlayer()
  if (!player) return { ok: false, reason: 'Player not ready yet.' }
  if (player.isGuest) return { ok: false, reason: 'Connect a wallet to claim daily prizes.' }
  const wallet = (player.userId || '').toLowerCase()
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return { ok: false, reason: 'Connect a wallet to claim daily prizes.' }
  }
  return { ok: true, wallet, name: player.name || 'Player' }
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra || {})
  }
  if (REWARDS_DEV_WALLET) {
    headers['X-Dev-Wallet'] = REWARDS_DEV_WALLET
  }
  return headers
}

/**
 * Ask the rewards API for today's spin. Resolves on the server; scene only animates.
 * Uses signedFetch so the API can verify ADR-44 headers in production.
 */
export function requestDailySpinFromApi(idempotencyKey: string): Promise<DailySpinResult> {
  return new Promise((resolve) => {
    executeTask(async () => {
      try {
        const identity = playerCanClaimRewards()
        if (!identity.ok) {
          resolve({ ok: false, error: 'guest_not_allowed', message: identity.reason })
          return
        }

        const response = await signedFetch({
          url: `${REWARDS_API_BASE_URL}/v1/daily/spin`,
          init: {
            method: 'POST',
            headers: authHeaders({ 'Idempotency-Key': idempotencyKey }),
            body: JSON.stringify({ displayName: identity.name, idempotencyKey })
          }
        })

        let parsed: DailySpinResult
        try {
          parsed = JSON.parse(response.body) as DailySpinResult
        } catch {
          resolve({ ok: false, error: 'server_error', message: `Bad JSON (${response.status})` })
          return
        }

        if (response.status === 409 && parsed && parsed.ok === false) {
          resolve(parsed)
          return
        }
        if (!response.ok && parsed && parsed.ok === false) {
          resolve(parsed)
          return
        }
        if (!response.ok) {
          resolve({ ok: false, error: 'server_error', message: `HTTP ${response.status}` })
          return
        }
        resolve(parsed)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        resolve({ ok: false, error: 'server_error', message })
      }
    })
  })
}

/** Has this wallet already claimed today? Used on join so the daily sign tells the truth. */
export function fetchDailyStatusFromApi(): Promise<DailyStatusOk | DailySpinErr> {
  return new Promise((resolve) => {
    executeTask(async () => {
      try {
        const identity = playerCanClaimRewards()
        if (!identity.ok) {
          resolve({ ok: false, error: 'guest_not_allowed', message: identity.reason })
          return
        }

        const response = await signedFetch({
          url: `${REWARDS_API_BASE_URL}/v1/daily/status`,
          init: {
            method: 'GET',
            headers: authHeaders()
          }
        })

        let parsed: DailyStatusOk | DailySpinErr
        try {
          parsed = JSON.parse(response.body) as DailyStatusOk | DailySpinErr
        } catch {
          resolve({ ok: false, error: 'server_error', message: `Bad JSON (${response.status})` })
          return
        }

        if (!response.ok) {
          if (parsed && 'ok' in parsed && parsed.ok === false) {
            resolve(parsed)
            return
          }
          resolve({ ok: false, error: 'server_error', message: `HTTP ${response.status}` })
          return
        }
        resolve(parsed as DailyStatusOk)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        resolve({ ok: false, error: 'server_error', message })
      }
    })
  })
}
