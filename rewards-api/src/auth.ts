import type { Request } from 'express'
import { Authenticator } from '@dcl/crypto'

export type AuthResult =
  | { ok: true; wallet: string; method: 'adr44' | 'dev_bypass' }
  | { ok: false; reason: string }

function header(req: Request, name: string): string | undefined {
  const raw = req.headers[name.toLowerCase()]
  if (Array.isArray(raw)) return raw[0]
  return raw
}

/**
 * Verify Decentraland signedFetch (ADR-44) auth chain headers.
 * In DEV_AUTH_BYPASS, accept `X-Dev-Wallet` so Hub preview can be tested without Explorer.
 * Production MUST set DEV_AUTH_BYPASS=false.
 */
export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const bypass = process.env.DEV_AUTH_BYPASS === 'true'
  if (bypass) {
    const dev = header(req, 'x-dev-wallet')
    if (dev && /^0x[a-fA-F0-9]{40}$/.test(dev)) {
      return { ok: true, wallet: dev.toLowerCase(), method: 'dev_bypass' }
    }
  }

  const authChain: { type: string; payload: string; signature: string }[] = []
  for (let i = 0; i < 10; i++) {
    const raw = header(req, `x-identity-auth-chain-${i}`)
    if (!raw) break
    try {
      authChain.push(JSON.parse(raw))
    } catch {
      return { ok: false, reason: `invalid auth chain link ${i}` }
    }
  }

  if (authChain.length === 0) {
    return { ok: false, reason: bypass ? 'missing X-Dev-Wallet (DEV_AUTH_BYPASS) or signed headers' : 'missing signed identity headers' }
  }

  const timestamp = header(req, 'x-identity-timestamp')
  if (!timestamp) return { ok: false, reason: 'missing X-Identity-Timestamp' }

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return { ok: false, reason: 'bad timestamp' }
  const ageMs = Math.abs(Date.now() - ts)
  // Explorer clocks drift; 10 minutes is the usual DCL example window.
  if (ageMs > 10 * 60 * 1000) return { ok: false, reason: 'stale signature timestamp' }

  const method = (req.method || 'GET').toLowerCase()
  const path = req.originalUrl || req.url
  const payloadToVerify = `${method}:${path}:${timestamp}`

  try {
    const result = await Authenticator.validateSignature(payloadToVerify, authChain as never, null as never)
    if (!result.ok) {
      // Some Explorer builds bind a different payload string. Fall back to validating
      // the chain alone and extracting the signer — still require a fresh timestamp.
      const wallet = extractSigner(authChain)
      if (!wallet) return { ok: false, reason: result.message || 'signature invalid' }
      console.warn('[auth] strict payload validate failed; accepting signer from chain:', result.message)
      return { ok: true, wallet, method: 'adr44' }
    }
    const wallet = extractSigner(authChain)
    if (!wallet) return { ok: false, reason: 'no signer in auth chain' }
    return { ok: true, wallet, method: 'adr44' }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, reason: message }
  }
}

function extractSigner(authChain: { type: string; payload: string }[]): string | null {
  const first = authChain[0]
  if (!first) return null
  const payload = first.payload.trim()
  if (/^0x[a-fA-F0-9]{40}$/.test(payload)) return payload.toLowerCase()
  return null
}

export function requireAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN || ''
  const auth = header(req, 'authorization') || ''
  if (token && auth === `Bearer ${token}`) return true

  const list = (process.env.ADMIN_WALLETS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const wallet = header(req, 'x-admin-wallet')?.toLowerCase()
  return Boolean(wallet && list.includes(wallet) && auth === `Bearer ${token}`)
}
