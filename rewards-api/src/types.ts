export type PrizeType = 'none' | 'shoutout' | 'marketplace_credits' | 'wearable' | 'bonus_spin' | 'crypto'

/** Which payout rail this prize uses (docs + filtering). */
export type PrizeRail = 'none' | 'social' | 'wearable' | 'credits' | 'crypto'

export type PrizeDef = {
  id: string
  label: string
  type: PrizeType
  rail?: PrizeRail
  weight: number
  evUsd: number
  /** Index into the 8-slice show wheel (0 = 12 o'clock, clockwise). */
  wheelIndex: number
  dailyMax: number
  /** null = unlimited stock for this type */
  inventory: number | null
  credits?: number
  chain?: 'polygon' | 'ethereum'
  collection?: string
  /** Crypto rail: token symbol e.g. MANA, USDC */
  token?: string
  /** Crypto rail: human amount as string to avoid float bugs ("10", "5.5") */
  tokenAmount?: string
  flavor: string
}

export type ClaimStatus = 'pending_fulfillment' | 'fulfilled' | 'none_needed' | 'void'

export type ClaimRecord = {
  claimId: string
  wallet: string
  displayName: string
  utcDay: string
  mode: 'daily' | 'show'
  prizeId: string
  label: string
  type: PrizeType
  rail: PrizeRail | null
  wheelIndex: number
  credits: number
  /** Collection contract when type is wearable (optional). */
  collection: string | null
  chain: 'polygon' | 'ethereum' | null
  token: string | null
  tokenAmount: string | null
  /** Snapshot of prize treasury at claim time. */
  treasuryAddress: string | null
  /** One-line ops instruction generated at claim time. */
  actionHint: string
  status: ClaimStatus
  createdAt: string
  fulfilledAt: string | null
  fulfillmentNote: string | null
  idempotencyKey: string
}

export type DailySpinResponse = {
  ok: true
  claimId: string
  prizeId: string
  label: string
  type: PrizeType
  wheelIndex: number
  flavor: string
  status: ClaimStatus
  alreadyClaimed?: false
}

export type DailyAlreadyClaimedResponse = {
  ok: false
  error: 'already_claimed'
  claimId: string
  label: string
  prizeId: string
  wheelIndex: number
}

export type DailyErrorResponse = {
  ok: false
  error: 'guest_not_allowed' | 'unauthorized' | 'budget_exhausted' | 'bad_request' | 'server_error'
  message: string
}
