/** Server-synced live round phase (ShowState.roundPhase). */
export const RoundPhase = {
  PRACTICE: 0,
  LIVE: 1,
  RESOLVING: 2
} as const

export type RoundPhaseValue = (typeof RoundPhase)[keyof typeof RoundPhase]

export function isLivePhase(phase: number): boolean {
  return phase === RoundPhase.LIVE
}

export function isPracticePhase(phase: number): boolean {
  return phase === RoundPhase.PRACTICE
}
