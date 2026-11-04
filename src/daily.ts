import { getPlayer } from '@dcl/sdk/players'

/** Demo publish: podium stays live so reviewers can retry. Flip on only if we need a real lock. */
export const DAILY_ONCE_PER_DAY = false

const claimedDayByUser = new Map<string, string>()

export function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}

export function localUserId(): string {
  const player = getPlayer()
  if (!player) return 'local'
  return player.userId || player.name || 'local'
}

export function hasDailyClaim(now = Date.now()): boolean {
  if (!DAILY_ONCE_PER_DAY) return false
  return claimedDayByUser.get(localUserId()) === utcDay(now)
}

export function markDailyClaim(now = Date.now()): void {
  claimedDayByUser.set(localUserId(), utcDay(now))
}

export function msUntilNextUtcDay(now = Date.now()): number {
  const date = new Date(now)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1) - now
}
