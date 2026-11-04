import { livePrizeByIndex } from '../livePrizes'
import { seatedName } from './practiceScore'

export type LiveBank = {
  wearablePending: boolean
  solveLocked: boolean
}

const MAX_SEATS = 3

let seats: string[] = []
let banks = new Map<string, LiveBank>()
let activeSeat = 0
let liveEndsAt = 0
let locked = new Set<string>()

export function resetLiveRound(now: number, maxSec: number): void {
  seats = []
  banks.clear()
  locked.clear()
  activeSeat = 0
  liveEndsAt = now + maxSec * 1000
}

export function liveDeadline(): number {
  return liveEndsAt
}

export function seatsCsv(): string {
  return seats.join(',')
}

export function rosterSize(): number {
  return seats.length
}

export function activeSeatIndex(): number {
  return activeSeat
}

export function activeWallet(): string {
  return seats[activeSeat] || ''
}

export function isOnRoster(wallet: string): boolean {
  const w = wallet.toLowerCase()
  return seats.some((s) => s === w)
}

export function tryJoinRoster(wallet: string): { ok: true; seat: number } | { ok: false; reason: string } {
  const w = wallet.toLowerCase()
  if (isOnRoster(w)) return { ok: true, seat: seats.indexOf(w) }
  if (seats.length >= MAX_SEATS) return { ok: false, reason: 'roster_full' }
  seats.push(w)
  banks.set(w, { wearablePending: false, solveLocked: false })
  if (seats.length === 1) activeSeat = 0
  console.log(`[SERVER] live seat ${seats.length} ${seatedName(w) || w}`)
  return { ok: true, seat: seats.length - 1 }
}

export function isSolveLocked(wallet: string): boolean {
  return locked.has(wallet.toLowerCase())
}

export function lockedCsv(): string {
  return [...locked].join(',')
}

export function bankFor(wallet: string): LiveBank {
  const w = wallet.toLowerCase()
  let bank = banks.get(w)
  if (!bank) {
    bank = { wearablePending: false, solveLocked: false }
    banks.set(w, bank)
  }
  return bank
}

export function syncActiveBankToShow(roundNfts: { roundNfts: number }): void {
  const w = activeWallet()
  if (!w) {
    roundNfts.roundNfts = 0
    return
  }
  roundNfts.roundNfts = bankFor(w).wearablePending ? 1 : 0
}

export function applyLiveLand(prizeIndex: number): 'letter' | 'wearable' | 'lose-turn' | 'bankrupt' {
  const prize = livePrizeByIndex(prizeIndex)
  const w = activeWallet()
  if (!w) return 'letter'
  const bank = bankFor(w)
  switch (prize.id) {
    case 'wearable':
      bank.wearablePending = true
      return 'wearable'
    case 'bankrupt':
      bank.wearablePending = false
      advanceTurn()
      return 'bankrupt'
    case 'lose-turn':
      advanceTurn()
      return 'lose-turn'
    default:
      return 'letter'
  }
}

export function advanceTurn(): void {
  if (seats.length === 0) return
  activeSeat = (activeSeat + 1) % seats.length
}

export function handleLiveWrongSolve(wallet: string): void {
  const bank = bankFor(wallet)
  bank.wearablePending = false
  bank.solveLocked = true
  locked.add(wallet.toLowerCase())
}

export function clearLiveRound(): void {
  seats = []
  banks.clear()
  locked.clear()
  activeSeat = 0
  liveEndsAt = 0
}

export function assertActivePlayer(wallet: string): boolean {
  return wallet.toLowerCase() === activeWallet()
}

/** Any roster member may solve for their own bank; active player is the default spinner. */
export function mayAttemptSolve(wallet: string): boolean {
  const w = wallet.toLowerCase()
  if (!isOnRoster(w)) return false
  if (isSolveLocked(w)) return false
  return true
}

export function solverWearablePending(wallet: string): boolean {
  return bankFor(wallet).wearablePending
}

export function clearWearablePending(wallet: string): void {
  bankFor(wallet).wearablePending = false
}
