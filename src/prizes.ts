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
 * Slice 0 starts at 12 o'clock and runs clockwise.
 * Labels must match assets/Images/wheel-face.png.
 * Thursday live show uses these values. Daily drop-ins scale them down.
 */
export const PRIZES: Prize[] = [
  { id: 'wip-50', label: '50 $WIP', flavor: 'A starter stack of $WIP for showing up.', wip: 50, nft: 0 },
  { id: 'shoutout', label: 'SHOUTOUT', flavor: 'Host reads your name out to the room.', wip: 0, nft: 0 },
  { id: 'wip-100', label: '100 $WIP', flavor: 'A solid $WIP hit for the guest spin.', wip: 100, nft: 0 },
  { id: 'free-spin', label: 'FREE SPIN', flavor: 'The guest gets one more go.', wip: 0, nft: 0 },
  { id: 'wip-250', label: '250 $WIP', flavor: 'A heavy $WIP slice.', wip: 250, nft: 0 },
  { id: 'nft-drop', label: 'NFT DROP', flavor: 'Placeholder for a wearable or guest NFT.', wip: 0, nft: 1 },
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
      return { id: slice.id, label: 'THURSDAY NFT', flavor: 'NFT drops load when the guest is on the pad.', wip: 0, nft: 0 }
    case 'try-again':
      return { id: slice.id, label: slice.label, flavor: 'Daily miss. Come back tomorrow for another drop.', wip: 0, nft: 0 }
    default:
      return slice
  }
}

/** Daily chance table. Not the Wheel of Fortune slices. */
export type DailyPrize = {
  id: string
  label: string
  flavor: string
  weight: number
}

export const DAILY_PRIZES: DailyPrize[] = [
  { id: 'd5', label: '5 $WIP', flavor: 'A small daily hit.', weight: 28 },
  { id: 'd10', label: '10 $WIP', flavor: 'A solid daily hit.', weight: 22 },
  { id: 'd25', label: '25 $WIP', flavor: 'Best common daily.', weight: 14 },
  { id: 'shoutout', label: 'SHOUTOUT', flavor: 'We shout you out in the room.', weight: 12 },
  { id: 'bonus', label: 'BONUS SPIN', flavor: 'Take another daily spin.', weight: 10 },
  { id: 'd50', label: '50 $WIP', flavor: 'Daily max. Jackpot stays on Thursday.', weight: 6 },
  { id: 'try-again', label: 'TRY AGAIN', flavor: 'Come back tomorrow.', weight: 8 }
]

export const DAILY_TABLE = ['5 $WIP', '10 $WIP', '25 $WIP', 'SHOUTOUT', 'BONUS SPIN', '50 $WIP']

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
