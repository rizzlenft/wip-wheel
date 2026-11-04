export type Prize = {
  id: string
  label: string
  flavor: string
  wip: number
  nft: number
}

export type Payout = Prize & {
  sliceLabel: string
}

/**
 * Legacy eight-entry table — used for gold daily cabinet tween math (`DAILY_SLICE_DEG`),
 * not show-wheel spins. Show authority: `src/livePrizes.ts` + `wheel-face-live-4.png`.
 * See design/show-wheel.md.
 */
export const PRIZES: Prize[] = [
  { id: 'wip-50', label: '50 $WIP', flavor: 'A starter stack of $WIP for showing up.', wip: 50, nft: 0 },
  { id: 'shoutout', label: 'SHOUTOUT', flavor: 'Host reads your name out to the room.', wip: 0, nft: 0 },
  { id: 'wip-100', label: '100 $WIP', flavor: 'A solid $WIP hit for the guest spin.', wip: 100, nft: 0 },
  { id: 'free-spin', label: 'FREE SPIN', flavor: 'The guest gets one more go.', wip: 0, nft: 0 },
  { id: 'wip-250', label: '250 $WIP', flavor: 'A heavy $WIP slice.', wip: 250, nft: 0 },
  { id: 'nft-drop', label: 'WEARABLE', flavor: 'A DCL wearable from the prize treasury.', wip: 0, nft: 1 },
  { id: 'jackpot', label: 'JACKPOT', flavor: 'The weekly house prize. Loaded by the host or guest speaker.', wip: 1000, nft: 0 },
  { id: 'try-again', label: 'TRY AGAIN', flavor: 'The miss. Come back next Thursday.', wip: 0, nft: 0 }
]

export const SLICE_DEGREES = 360 / PRIZES.length

export function prizeByIndex(index: number): Prize {
  const wrapped = ((index % PRIZES.length) + PRIZES.length) % PRIZES.length
  return PRIZES[wrapped]
}

export function payoutFor(index: number, liveShow: boolean): Payout {
  const slice = prizeByIndex(index)
  if (liveShow) return { ...slice, sliceLabel: slice.label }
  return { ...dailyFrom(slice), sliceLabel: slice.label }
}

function dailyFrom(slice: Prize): Prize {
  switch (slice.id) {
    case 'wip-50':
      return { id: slice.id, label: '5 $WIP', flavor: 'Daily drop. The 50 is a Thursday slice.', wip: 5, nft: 0 }
    case 'wip-100':
      return { id: slice.id, label: '10 $WIP', flavor: 'Daily drop. Save the heavy stack for the live show.', wip: 10, nft: 0 }
    case 'wip-250':
      return { id: slice.id, label: '25 $WIP', flavor: 'Daily drop. Big $WIP stays on Thursday.', wip: 25, nft: 0 }
    case 'jackpot':
      return { id: slice.id, label: 'DAILY 50', flavor: 'Jackpot stays on the live Thursday show.', wip: 50, nft: 0 }
    case 'nft-drop':
      return { id: slice.id, label: 'WEARABLE', flavor: 'Daily wearable from the prize treasury.', wip: 0, nft: 1 }
    case 'try-again':
      return { id: slice.id, label: slice.label, flavor: 'Daily miss. Come back tomorrow for another drop.', wip: 0, nft: 0 }
    default:
      return slice
  }
}

/** Daily chance table used only when rewards API is OFF (local preview). */
export type DailyPrize = {
  id: string
  label: string
  flavor: string
  weight: number
  /** Must match rewards-api catalog wheelIndex for the same outcome. */
  wheelIndex: number
}

/** Local preview table — wheelIndex must stay aligned with shared/dailyCatalog + wheel-face.png. */
export const DAILY_PRIZES: DailyPrize[] = [
  { id: 'try-again', label: 'TRY AGAIN', flavor: 'Come back tomorrow.', weight: 35, wheelIndex: 7 },
  { id: 'try-again-b', label: 'TRY AGAIN', flavor: 'Come back tomorrow.', weight: 15, wheelIndex: 7 },
  { id: 'try-again-c', label: 'TRY AGAIN', flavor: 'Come back tomorrow.', weight: 10, wheelIndex: 7 },
  { id: 'wearable', label: 'WEARABLE', flavor: 'One DCL wearable from the prize treasury.', weight: 40, wheelIndex: 5 }
]

export const DAILY_TABLE = ['TRY AGAIN', 'WEARABLE']

export function pickDailyPrize(): DailyPrize {
  let total = 0
  for (let i = 0; i < DAILY_PRIZES.length; i++) total += DAILY_PRIZES[i].weight
  let roll = Math.random() * total
  for (let i = 0; i < DAILY_PRIZES.length; i++) {
    roll -= DAILY_PRIZES[i].weight
    if (roll <= 0) return DAILY_PRIZES[i]
  }
  return DAILY_PRIZES[0]
}

export function dailyPrizeByIndex(index: number): DailyPrize {
  const wrapped = ((index % DAILY_PRIZES.length) + DAILY_PRIZES.length) % DAILY_PRIZES.length
  return DAILY_PRIZES[wrapped]
}

/** Extra full turns so the wheel always feels like a show spin. */
export const MIN_TURNS = 5
