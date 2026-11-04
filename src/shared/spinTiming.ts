/**
 * Client tween and server busy-flag timers must agree.
 * Mismatch (daily client 5.6s vs server 4.2s) left dailySpinning false while
 * the disc was still moving — and the reverse window after land.
 */
export const SHOW_SPIN_SECONDS = 4.2
/** Longer so the stage-left wheel reads from the gold pad (stage-right). */
export const DAILY_SPIN_SECONDS = 6.5
/** Extra full rotations vs show — motion must read across the set. */
export const DAILY_EXTRA_TURNS = 2
