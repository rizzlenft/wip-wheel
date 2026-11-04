/**
 * Daily claim eligibility — single fail-closed contract.
 * See design/daily-claim-audit.md.
 *
 * Order: wallet shape → PlayerIdentityData present → !isGuest → Catalyst hasConnectedWeb3.
 * Never trust client-reported wallet; callers must pass context.from.
 */
import { engine, PlayerIdentityData } from '@dcl/sdk/ecs'
import { isWalletAddress } from '../shared/dailyCatalog'

const CATALYST_PROFILE = 'https://peer.decentraland.org/lambdas/profile/'

export type ClaimantDenyReason = 'not_wallet' | 'identity_missing' | 'is_guest' | 'no_web3'

export type ClaimantResult =
  | { ok: true; wallet: string }
  | { ok: false; reason: ClaimantDenyReason; message: string }

const GUEST_MSG = 'Connect a wallet to claim daily prizes. Guests can watch but cannot win wearables.'

function peerIdentity(address: string): { found: true; isGuest: boolean } | { found: false } {
  const a = address.toLowerCase()
  for (const [, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
    if ((identity.address || '').toLowerCase() === a) {
      return { found: true, isGuest: Boolean(identity.isGuest) }
    }
  }
  return { found: false }
}

async function walletHasConnectedWeb3(address: string): Promise<boolean> {
  try {
    const res = await fetch(`${CATALYST_PROFILE}${address}`)
    if (!res.ok) return false
    const json = (await res.json()) as { avatars?: Array<{ hasConnectedWeb3?: boolean }> }
    const row = json?.avatars?.[0]
    if (!row) return false
    return Boolean(row.hasConnectedWeb3)
  } catch {
    return false
  }
}

/** Fail-closed eligibility for daily claim / status. */
export async function assertDailyClaimant(address: string): Promise<ClaimantResult> {
  const wallet = (address || '').toLowerCase()

  if (!isWalletAddress(wallet)) {
    console.log(`[SERVER] claimant deny not_wallet ${wallet || '(empty)'}`)
    return { ok: false, reason: 'not_wallet', message: GUEST_MSG }
  }

  const id = peerIdentity(wallet)
  if (!id.found) {
    console.log(`[SERVER] claimant deny identity_missing ${wallet}`)
    return { ok: false, reason: 'identity_missing', message: GUEST_MSG }
  }
  if (id.isGuest) {
    console.log(`[SERVER] claimant deny is_guest ${wallet}`)
    return { ok: false, reason: 'is_guest', message: GUEST_MSG }
  }

  const web3 = await walletHasConnectedWeb3(wallet)
  if (!web3) {
    console.log(`[SERVER] claimant deny no_web3 ${wallet}`)
    return { ok: false, reason: 'no_web3', message: GUEST_MSG }
  }

  return { ok: true, wallet }
}

/** True if error string is an eligibility deny (not already_claimed / wheel_busy). */
export function isClaimantDenyReason(error: string): boolean {
  return (
    error === 'not_wallet' ||
    error === 'identity_missing' ||
    error === 'is_guest' ||
    error === 'no_web3' ||
    error === 'guest_not_allowed'
  )
}
