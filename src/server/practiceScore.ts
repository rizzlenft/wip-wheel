/**
 * Weekly practice-solve counts.
 *
 * Same shape as Decentraland's leaderboard sample (scene 90,-9):
 * a Map in memory, one JSON blob in scene Storage, wallet from the
 * verified message. Written once per solve, never per letter.
 * The wall that renders this is a later slice. The count has to
 * survive a restart before that wall exists.
 */
import { AvatarBase, engine, PlayerIdentityData } from '@dcl/sdk/ecs'
import { Storage } from '@dcl/sdk/server'
import { isWalletAddress } from '../shared/dailyCatalog'

const STORAGE_KEY = 'practiceSolves'

type Record = { name: string; score: number }

let week = ''
const scores = new Map<string, Record>()
let loaded = false

export async function loadPracticeScores(): Promise<void> {
  if (loaded) return
  loaded = true
  try {
    const raw = await Storage.get<string>(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as { week?: string; entries?: [string, Record][] }
    if (!saved || saved.week !== isoWeek() || !saved.entries) return
    week = saved.week
    for (const [address, record] of saved.entries) scores.set(address, record)
    console.log(`[SERVER] practice scores restored ${scores.size} for ${week}`)
  } catch (e) {
    console.log('[SERVER] practice scores did not load', e)
  }
}

/**
 * Guests play and get 0. A connected wallet gets the new weekly total.
 * Call only after loadPracticeScores. The save itself is the checkpoint.
 */
export function notePracticeSolve(address: string): number {
  if (!loaded) return 0
  const wallet = (address || '').toLowerCase()
  if (!isWalletAddress(wallet) || isGuest(wallet)) return 0

  const id = isoWeek()
  if (week !== id) {
    week = id
    scores.clear()
  }

  const record = scores.get(wallet) ?? { name: seatedName(wallet) || shortAddress(wallet), score: 0 }
  record.score += 1
  const seen = seatedName(wallet)
  if (seen) record.name = seen
  scores.set(wallet, record)
  void persistPracticeScores()
  return record.score
}

async function persistPracticeScores(): Promise<void> {
  const ok = await Storage.set(
    STORAGE_KEY,
    JSON.stringify({ week, entries: [...scores.entries()] })
  )
  if (!ok) console.log('[SERVER] practice score did not persist')
}

export function seatedName(address: string): string {
  const wallet = (address || '').toLowerCase()
  for (const [entity, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
    if ((identity.address || '').toLowerCase() !== wallet) continue
    const avatar = AvatarBase.getOrNull(entity)
    if (avatar && avatar.name) return avatar.name.slice(0, 48)
    break
  }
  return ''
}

function isGuest(wallet: string): boolean {
  for (const [, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
    if ((identity.address || '').toLowerCase() !== wallet) continue
    return Boolean(identity.isGuest)
  }
  return true
}

function shortAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function practiceScoreSnapshot(): Map<string, Record> {
  return new Map(scores)
}

function isoWeek(now = new Date()): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}
