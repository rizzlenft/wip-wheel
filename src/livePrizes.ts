/**
 * Four-slice show wheel (practice + live). Fifth $WIP slice is V2.
 * Labels must match assets/Images/wheel-face-live-4.png.
 */
export type LivePrize = {
  id: string
  label: string
}

export const LIVE_PRIZE_COUNT = 4

export const LIVE_PRIZES: LivePrize[] = [
  { id: 'letter', label: 'LETTER' },
  { id: 'wearable', label: 'WEARABLE' },
  { id: 'lose-turn', label: 'LOSE TURN' },
  { id: 'bankrupt', label: 'BANKRUPT' }
]

export function liveSliceDegrees(): number {
  return 360 / LIVE_PRIZE_COUNT
}

export function pickLivePrizeIndex(): number {
  return Math.floor(Math.random() * LIVE_PRIZE_COUNT)
}

export function livePrizeByIndex(index: number): LivePrize {
  const n = LIVE_PRIZES.length
  const wrapped = ((index % n) + n) % n
  return LIVE_PRIZES[wrapped]
}

/** Show wheel (practice + live) — letter and wearable open the pad. */
export function showWheelOpensLetterPad(prizeIndex: number): boolean {
  const id = livePrizeByIndex(prizeIndex).id
  return id === 'letter' || id === 'wearable'
}
