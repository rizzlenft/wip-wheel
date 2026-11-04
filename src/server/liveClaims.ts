import type { DailyClaim } from './dailyClaims'
import { requestWearableFulfillment } from './fulfill'

let seq = 0

export function buildLiveWearableClaim(wallet: string, displayName: string): DailyClaim {
  seq += 1
  const claimId = `live-${Date.now()}-${seq}`
  return {
    claimId,
    wallet: wallet.toLowerCase(),
    displayName: displayName.slice(0, 48) || 'Player',
    utcDay: 'live',
    prizeId: 'wearable',
    label: 'WEARABLE',
    prizeType: 'wearable',
    wheelIndex: 0,
    status: 'pending_fulfillment',
    actionHint: 'live_round_solve',
    createdAt: new Date().toISOString()
  }
}

export function fulfillLiveWearable(wallet: string, displayName: string): void {
  const claim = buildLiveWearableClaim(wallet, displayName)
  void requestWearableFulfillment(claim)
}
