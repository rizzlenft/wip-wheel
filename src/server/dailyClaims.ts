import { EnvVar, Storage } from '@dcl/sdk/server'
import { DAILY_CATALOG, PRIZE_TREASURY, utcDay, type DailyCatalogPrize } from '../shared/dailyCatalog'

export type DailyClaim = {
  claimId: string
  wallet: string
  displayName: string
  utcDay: string
  prizeId: string
  label: string
  prizeType: string
  wheelIndex: number
  status: 'pending_fulfillment' | 'none_needed' | 'fulfilled'
  actionHint: string
  createdAt: string
  txHash?: string
  fulfilledUrn?: string
}

type InventoryMap = Record<string, number>

const PENDING_KEY = 'pendingFulfillment'
const INVENTORY_KEY = 'dailyInventory'
const DAY_WINS_KEY = 'dailyWinsByPrize'
const TREASURY_WEARABLES_URL = `https://peer.decentraland.org/lambdas/users/${PRIZE_TREASURY}/wearables?pageNum=1&pageSize=1000`

/** In-memory working copy; flushed on each claim (checkpoint). */
let inventory: InventoryMap | null = null
let pending: DailyClaim[] = []
let dayWins: Record<string, Record<string, number>> = {}
let loaded = false
/** Last successful on-chain wearable count sync (ms). Re-sync so stocking mid-session counts. */
let lastChainSyncAt = 0
const CHAIN_SYNC_MIN_MS = 60_000
/** EnvVar DAILY_WEARABLE_MAX — live raise/lower without republish (demo uncap). */
let wearableDailyMaxOverride: number | null = null

/**
 * Same-process day lock. Preview Scene Storage is often empty/404 between boots;
 * without this map, every gold click can mint a new claim in one Hub Preview session.
 * Live World: Storage remains source of truth across sessions; this still blocks races.
 */
const claimsByWalletDay = new Map<string, DailyClaim>()
/** Prevents double-entry while two dailySpin handlers await Storage. */
const claimInFlight = new Set<string>()

function playerDayKey(day: string): string {
  return `dailyClaim:${day}`
}

function walletDayKey(wallet: string, day: string): string {
  return `${wallet.toLowerCase()}:${day}`
}

async function refreshWearableDailyMaxOverride(): Promise<void> {
  try {
    const raw = ((await EnvVar.get('DAILY_WEARABLE_MAX')) || '').trim()
    const n = parseInt(raw, 10)
    wearableDailyMaxOverride = Number.isFinite(n) && n > 0 ? n : null
    if (wearableDailyMaxOverride != null) {
      console.log(`[SERVER] DAILY_WEARABLE_MAX override=${wearableDailyMaxOverride}`)
    }
  } catch {
    wearableDailyMaxOverride = null
  }
}

function effectiveDailyMax(prize: DailyCatalogPrize): number {
  if (prize.id === 'wearable' && wearableDailyMaxOverride != null) return wearableDailyMaxOverride
  return prize.dailyMax
}

async function ensureLoaded() {
  if (loaded) return
  const invRaw = await Storage.get<string>(INVENTORY_KEY)
  if (invRaw) {
    try {
      inventory = JSON.parse(invRaw) as InventoryMap
    } catch {
      inventory = null
    }
  }
  if (!inventory) {
    inventory = {}
    for (const p of DAILY_CATALOG) {
      if (p.inventory !== null) inventory[p.id] = p.inventory
    }
  }
  const pendRaw = await Storage.get<string>(PENDING_KEY)
  if (pendRaw) {
    try {
      pending = JSON.parse(pendRaw) as DailyClaim[]
    } catch {
      pending = []
    }
  }
  const winsRaw = await Storage.get<string>(DAY_WINS_KEY)
  if (winsRaw) {
    try {
      dayWins = JSON.parse(winsRaw) as Record<string, Record<string, number>>
    } catch {
      dayWins = {}
    }
  }
  loaded = true
  await refreshWearableDailyMaxOverride()
  await maybeSyncWearableInventory(true)
}

function pendingWearableCount(): number {
  let n = 0
  for (const c of pending) {
    if (c.prizeType === 'wearable' && c.status === 'pending_fulfillment') n += 1
  }
  return n
}

/**
 * On-chain NFT count minus pending = promises we can still make.
 * Catalog `inventory` is a seed only — lambdas on PRIZE_TREASURY are source of truth
 * (14 Oct: hot held ~77 while catalog seed still said 30).
 */
async function syncWearableInventoryFromChain(): Promise<void> {
  if (!inventory) return
  try {
    const res = await fetch(TREASURY_WEARABLES_URL)
    if (!res.ok) {
      console.error('[SERVER] treasury inventory sync HTTP', res.status)
      return
    }
    const data = (await res.json()) as { elements?: { amount?: number }[] }
    let onChain = 0
    for (const el of data.elements || []) onChain += el.amount ?? 0
    if (onChain <= 0) return
    const pendingN = pendingWearableCount()
    const available = Math.max(0, onChain - pendingN)
    inventory.wearable = available
    await Storage.set(INVENTORY_KEY, JSON.stringify(inventory))
    lastChainSyncAt = Date.now()
    console.log(
      `[SERVER] wearable inventory synced: onChain=${onChain} pending=${pendingN} available=${available}`
    )
  } catch (err) {
    console.error('[SERVER] treasury inventory sync failed', err)
  }
}

/** Re-read hot wallet when stocking mid-session (once-per-boot sync left rolls stuck low). */
async function maybeSyncWearableInventory(force = false): Promise<void> {
  if (!force && Date.now() - lastChainSyncAt < CHAIN_SYNC_MIN_MS) return
  await syncWearableInventoryFromChain()
}

function countDayWins(prizeId: string, day: string): number {
  return dayWins[day]?.[prizeId] || 0
}

function rollPrize(day: string): DailyCatalogPrize | null {
  if (!inventory) return null
  const eligible: DailyCatalogPrize[] = []
  for (const prize of DAILY_CATALOG) {
    if (prize.weight <= 0) continue
    if (countDayWins(prize.id, day) >= effectiveDailyMax(prize)) continue
    if (prize.inventory !== null && (inventory[prize.id] ?? 0) <= 0) continue
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
  }
  if (!dayWins[day]) dayWins[day] = {}
  dayWins[day][chosen.id] = (dayWins[day][chosen.id] || 0) + 1
  return chosen
}

function actionHint(prize: DailyCatalogPrize, wallet: string): string {
  if (prize.type === 'wearable') {
    return `Transfer 1 DCL wearable from ${PRIZE_TREASURY} → ${wallet}`
  }
  if (prize.type === 'marketplace_credits') {
    return `Apply ${prize.credits || 0} Marketplace Credits to ${wallet}`
  }
  if (prize.type === 'crypto') {
    return `Send crypto prize to ${wallet}`
  }
  return 'No transfer needed'
}

function claimStatus(type: string): DailyClaim['status'] {
  if (type === 'none' || type === 'bonus_spin') return 'none_needed'
  return 'pending_fulfillment'
}

function newClaimId(): string {
  return `c-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

export async function getPlayerDailyClaim(wallet: string): Promise<DailyClaim | null> {
  await ensureLoaded()
  const day = utcDay()
  const key = walletDayKey(wallet, day)
  const mem = claimsByWalletDay.get(key)
  if (mem) return mem

  const raw = await Storage.player.get<string>(wallet.toLowerCase(), playerDayKey(day))
  if (!raw) return null
  try {
    const claim = JSON.parse(raw) as DailyClaim
    claimsByWalletDay.set(key, claim)
    return claim
  } catch {
    return null
  }
}

export type SpinOutcome =
  | { ok: true; claim: DailyClaim }
  | { ok: false; error: string; message: string; claim?: DailyClaim }

export async function performDailySpin(wallet: string, displayName: string): Promise<SpinOutcome> {
  await ensureLoaded()
  // Pick up wearables swept to hot after the World process woke (Meetup stocking).
  await maybeSyncWearableInventory(false)
  const day = utcDay()
  const w = wallet.toLowerCase()
  const key = walletDayKey(w, day)

  const memHit = claimsByWalletDay.get(key)
  if (memHit) {
    return {
      ok: false,
      error: 'already_claimed',
      message: 'Already claimed today.',
      claim: memHit
    }
  }
  if (claimInFlight.has(key)) {
    return {
      ok: false,
      error: 'wheel_busy',
      message: 'Wheel is busy — try again after it lands.'
    }
  }

  claimInFlight.add(key)
  try {
    const existing = await getPlayerDailyClaim(w)
    if (existing) {
      return {
        ok: false,
        error: 'already_claimed',
        message: 'Already claimed today.',
        claim: existing
      }
    }

    const prize = rollPrize(day)
    if (!prize) {
      return { ok: false, error: 'budget_exhausted', message: 'Daily prize pool is empty. Try tomorrow.' }
    }

    const claim: DailyClaim = {
      claimId: newClaimId(),
      wallet: w,
      displayName: displayName.slice(0, 48) || 'Player',
      utcDay: day,
      prizeId: prize.id,
      label: prize.label,
      prizeType: prize.type,
      wheelIndex: prize.wheelIndex,
      status: claimStatus(prize.type),
      actionHint: actionHint(prize, w),
      createdAt: new Date().toISOString()
    }

    // Memory first so a second handler cannot roll another prize while Storage awaits.
    claimsByWalletDay.set(key, claim)

    const savedPlayer = await Storage.player.set(w, playerDayKey(day), JSON.stringify(claim))
    if (!savedPlayer) {
      console.error('[SERVER] failed to persist player daily claim — keeping in-process lock')
      // Keep memory claim: preview Storage often fails; still one spin per process/day.
    }

    if (claim.status === 'pending_fulfillment') {
      pending.push(claim)
      const savedPending = await Storage.set(PENDING_KEY, JSON.stringify(pending))
      if (!savedPending) {
        console.error('[SERVER] failed to persist pending fulfillment')
        pending.pop()
        // Do not delete memory claim — day lock still holds. Ops can fulfill from logs.
      }
    }

    const savedInv = await Storage.set(INVENTORY_KEY, JSON.stringify(inventory))
    if (!savedInv) console.error('[SERVER] failed to persist inventory')
    const savedWins = await Storage.set(DAY_WINS_KEY, JSON.stringify(dayWins))
    if (!savedWins) console.error('[SERVER] failed to persist day wins')

    console.log(`[SERVER] daily claim ${claim.claimId} ${claim.wallet} ${claim.label}`)
    return { ok: true, claim }
  } finally {
    claimInFlight.delete(key)
  }
}

export async function listPendingWearables(): Promise<DailyClaim[]> {
  await ensureLoaded()
  return pending.filter((c) => c.prizeType === 'wearable' && c.status === 'pending_fulfillment')
}

export async function markClaimFulfilled(claimId: string, txHash: string, urn: string): Promise<boolean> {
  await ensureLoaded()
  const idx = pending.findIndex((c) => c.claimId === claimId)
  if (idx < 0) return false
  const claim = pending[idx]
  claim.status = 'fulfilled'
  claim.txHash = txHash
  claim.fulfilledUrn = urn
  // Drop fulfilled rows from the live ops queue (ledger stays on the worker + player claim).
  pending.splice(idx, 1)
  const saved = await Storage.set(PENDING_KEY, JSON.stringify(pending))
  if (!saved) {
    console.error('[SERVER] failed to persist pending after fulfill')
    return false
  }

  const day = claim.utcDay
  const raw = await Storage.player.get<string>(claim.wallet, playerDayKey(day))
  if (raw) {
    try {
      const playerClaim = JSON.parse(raw) as DailyClaim
      if (playerClaim.claimId === claimId) {
        playerClaim.status = 'fulfilled'
        playerClaim.txHash = txHash
        playerClaim.fulfilledUrn = urn
        await Storage.player.set(claim.wallet, playerDayKey(day), JSON.stringify(playerClaim))
      }
    } catch {
      /* ignore */
    }
  }
  return true
}
