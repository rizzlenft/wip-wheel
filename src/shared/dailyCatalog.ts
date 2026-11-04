/**
 * Active daily prize table (mirrors rewards-api/catalog with weight > 0).
 * Embedded here because the Multiplayer Server has no filesystem catalog.
 * Credits/crypto stay at weight 0 until enabled.
 */
export type DailyCatalogPrize = {
  id: string
  label: string
  type: 'none' | 'wearable' | 'marketplace_credits' | 'crypto' | 'bonus_spin' | 'shoutout'
  weight: number
  wheelIndex: number
  dailyMax: number
  /** null = unlimited */
  inventory: number | null
  credits?: number
  flavor: string
}

export const DAILY_CATALOG: DailyCatalogPrize[] = [
  /**
   * wheelIndex aligns with legacy PRIZES[] slice indices for daily cabinet mapping only.
   * Show wheel uses livePrizes.ts — not this index on WheelDisc.
   * All daily misses land on slice 7 (TRY AGAIN) — never 1/3 (SHOUTOUT / FREE SPIN).
   * Wearable uses slice 5 (face + PRIZES label: WEARABLE).
   */
  {
    id: 'try-again',
    label: 'TRY AGAIN',
    type: 'none',
    weight: 35,
    wheelIndex: 7,
    dailyMax: 9999,
    inventory: null,
    flavor: 'Come back tomorrow.'
  },
  {
    id: 'try-again-b',
    label: 'TRY AGAIN',
    type: 'none',
    weight: 15,
    wheelIndex: 7,
    dailyMax: 9999,
    inventory: null,
    flavor: 'Miss slice.'
  },
  {
    id: 'try-again-c',
    label: 'TRY AGAIN',
    type: 'none',
    weight: 10,
    wheelIndex: 7,
    dailyMax: 9999,
    inventory: null,
    flavor: 'Miss slice.'
  },
  {
    id: 'wearable',
    label: 'WEARABLE',
    type: 'wearable',
    weight: 40,
    wheelIndex: 5,
    // Cap awards per UTC day across the room (raise via EnvVar DAILY_WEARABLE_MAX).
    dailyMax: 6,
    // Seed only — server overwrites from hot-wallet lambdas on wake + before spins.
    // 14 Oct hot held ~77 NFTs; do not treat this number as live stock.
    inventory: 80,
    flavor: 'One DCL wearable from the prize treasury.'
  },
  {
    id: 'credits-5',
    label: '5 CREDITS',
    type: 'marketplace_credits',
    weight: 0,
    wheelIndex: 0,
    dailyMax: 10,
    inventory: 40,
    credits: 5,
    flavor: 'Reserved until Marketplace Credits process is defined.'
  }
]

/** Operating prize hot wallet (signs payouts via EnvVar FULFILLER_PRIVATE_KEY). */
export const PRIZE_TREASURY = '0xd9618C06458e98a831F503194cC8b62fB0384d45'

/** Bay deposit / staging wallet — sweep wearables to PRIZE_TREASURY as needed. */
export const PRIZE_STAGING = '0x351764F8Ef0A80953F80885Fa0f7a7c5F097fC29'

export function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}

export function isWalletAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}
