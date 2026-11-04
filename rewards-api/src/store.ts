import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ClaimRecord, PrizeDef } from './types.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
/** Set on Railway/Render to a mounted volume so claims survive redeploys. */
const dataDir = process.env.DATA_DIR ? process.env.DATA_DIR : join(root, 'data')
const claimsPath = join(dataDir, 'claims.json')
const inventoryPath = join(dataDir, 'inventory.json')
const catalogPath = join(root, 'catalog', 'daily-prizes.json')
const treasuryPath = join(root, 'catalog', 'treasury.json')

export type TreasuryInfo = {
  chain: string
  label: string
  address: string
  notes: string[]
  accepts: string[]
}

export function loadTreasury(): TreasuryInfo {
  return JSON.parse(readFileSync(treasuryPath, 'utf8')) as TreasuryInfo
}

export function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}

function ensureDataDir() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
}

function atomicWrite(path: string, value: unknown) {
  ensureDataDir()
  const tmp = `${path}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8')
  renameSync(tmp, path)
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

export function loadCatalog(): PrizeDef[] {
  return JSON.parse(readFileSync(catalogPath, 'utf8')) as PrizeDef[]
}

type InventoryState = Record<string, number>

function loadInventory(catalog: PrizeDef[]): InventoryState {
  const stored = readJson<InventoryState>(inventoryPath, {})
  const next: InventoryState = { ...stored }
  for (const prize of catalog) {
    if (prize.inventory === null) continue
    if (typeof next[prize.id] !== 'number') next[prize.id] = prize.inventory
  }
  return next
}

function saveInventory(state: InventoryState) {
  atomicWrite(inventoryPath, state)
}

export function loadClaims(): ClaimRecord[] {
  return readJson<ClaimRecord[]>(claimsPath, [])
}

function saveClaims(claims: ClaimRecord[]) {
  atomicWrite(claimsPath, claims)
}

export function findClaimByIdempotency(key: string): ClaimRecord | undefined {
  return loadClaims().find((c) => c.idempotencyKey === key)
}

export function findDailyClaim(wallet: string, day: string): ClaimRecord | undefined {
  const w = wallet.toLowerCase()
  return loadClaims().find((c) => c.mode === 'daily' && c.wallet === w && c.utcDay === day)
}

export function countDailyWins(prizeId: string, day: string): number {
  return loadClaims().filter((c) => c.mode === 'daily' && c.prizeId === prizeId && c.utcDay === day).length
}

/**
 * Weighted roll over prizes that still have stock and are under dailyMax.
 * Mutates inventory only when a finite stock prize is chosen.
 */
export function rollDailyPrize(catalog: PrizeDef[], day: string): PrizeDef | null {
  const inventory = loadInventory(catalog)
  const eligible: PrizeDef[] = []
  for (const prize of catalog) {
    if (prize.weight <= 0) continue
    if (countDailyWins(prize.id, day) >= prize.dailyMax) continue
    if (prize.inventory !== null) {
      const left = inventory[prize.id] ?? 0
      if (left <= 0) continue
    }
    eligible.push(prize)
  }
  if (eligible.length === 0) return null

  let total = 0
  for (const p of eligible) total += p.weight
  let roll = Math.random() * total
  let chosen = eligible[0]
  for (const p of eligible) {
    roll -= p.weight
    if (roll <= 0) {
      chosen = p
      break
    }
  }

  if (chosen.inventory !== null) {
    inventory[chosen.id] = (inventory[chosen.id] ?? 0) - 1
    saveInventory(inventory)
  }
  return chosen
}

export function insertClaim(record: ClaimRecord): ClaimRecord {
  const claims = loadClaims()
  claims.push(record)
  saveClaims(claims)
  return record
}

export function listPendingClaims(): ClaimRecord[] {
  return loadClaims().filter((c) => c.status === 'pending_fulfillment')
}

export function markClaimFulfilled(claimId: string, note: string): ClaimRecord | null {
  const claims = loadClaims()
  const idx = claims.findIndex((c) => c.claimId === claimId)
  if (idx < 0) return null
  claims[idx] = {
    ...claims[idx],
    status: 'fulfilled',
    fulfilledAt: new Date().toISOString(),
    fulfillmentNote: note
  }
  saveClaims(claims)
  return claims[idx]
}

export function inventorySnapshot(): InventoryState {
  return loadInventory(loadCatalog())
}
