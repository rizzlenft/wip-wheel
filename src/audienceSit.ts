/**
 * Audience sit — port of Creator Hub smart_items Seat.ts (classic_bench).
 * Additive V1. Does not touch claim / show spin / letter pad.
 *
 * Official contract:
 * https://github.com/decentraland/creator-hub/blob/main/packages/asset-packs/packs/smart_items/assets/classic_bench/Seat.ts
 *
 * Click target: one POINTER volume the size of the visible four-seat row.
 * Sit spots are the four cushion centers (local +X), feet at y 0, same contract
 * as Seat.ts. The row's own `_collider` blocks walking. The old plank does not.
 */

import { Name, Transform, engine } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { movePlayerTo, triggerEmote } from '~system/RestrictedActions'
import { bindUse, setHoverText } from './interact'
import { BOARD, benchYawTowardBoard, HOUSE, SIT_SPOT } from './layout'
import { makeClickVolume } from './look'

const SITTING_EMOTES = ['sittingChair1', 'sittingChair2'] as const
const ARRIVE_TIMEOUT_SECONDS = 3
/** Below wheel/daily (priority 10) so audience never steals spin proximity. */
const SEAT_PRIORITY = 1

type BenchId = (typeof HOUSE)[number]['bench']

type Spot = {
  entity: ReturnType<typeof engine.addEntity>
  bench: BenchId
}

const spots: Spot[] = []
const seatHits = new Map<BenchId, ReturnType<typeof engine.addEntity>>()

let sittingOn: Spot | null = null
let seated = false
let arriveTimer = 0
let sitSystemInstalled = false

export function setupAudienceSit() {
  spots.length = 0
  sittingOn = null
  seated = false

  for (const seat of HOUSE) {
    if (!engine.getEntityOrNullByName(seat.bench)) {
      console.log(`[WIP] sit: missing ${seat.bench}`)
      continue
    }
    const yawDeg = benchYawTowardBoard(seat.x, seat.z)
    const hit = makeClickVolume(
      { x: seat.x, y: SIT_SPOT.hitY, z: seat.z },
      SIT_SPOT.hit,
      Quaternion.fromEulerDegrees(0, yawDeg, 0)
    )
    seatHits.set(seat.bench, hit)
    bindUse(hit, 'Sit', () => onBenchClick(seat.bench), SIT_SPOT.reach, false, SEAT_PRIORITY, true, SIT_SPOT.reach)
    SIT_SPOT.cushions.forEach((along, index) => addSpot(seat, along, index + 1))
  }

  if (!sitSystemInstalled) {
    sitSystemInstalled = true
    engine.addSystem(sitSystem)
  }
  console.log(`[WIP] sit: Seat.ts port — ${spots.length} spots, HIT volumes, walk >${SIT_SPOT.standUpDistance}m`)
}

function addSpot(seat: (typeof HOUSE)[number], along: number, index: number) {
  const rad = (benchYawTowardBoard(seat.x, seat.z) * Math.PI) / 180
  // Row length is local +X. Look is local +Z (toward the board). Feet at y 0.
  const rightX = Math.cos(rad)
  const rightZ = -Math.sin(rad)
  const lookX = Math.sin(rad)
  const lookZ = Math.cos(rad)
  const x = seat.x + rightX * along + lookX * SIT_SPOT.panZ
  const z = seat.z + rightZ * along + lookZ * SIT_SPOT.panZ
  const entity = engine.addEntity()
  Transform.create(entity, { position: Vector3.create(x, 0, z) })
  Name.create(entity, { value: `Sit Spot ${seat.bench} ${index}` })
  spots.push({ entity, bench: seat.bench })
}

function onBenchClick(bench: BenchId) {
  const player = Transform.getOrNull(engine.PlayerEntity)
  if (!player) return

  const target = nearestFreeSpot(bench, player.position)
  if (!target) {
    setBenchHover(bench, 'Seat is taken')
    return
  }

  const position = Transform.get(target.entity).position
  const look = Vector3.create(BOARD.x, position.y + 1.6, BOARD.z)
  void movePlayerTo({
    newRelativePosition: { x: position.x, y: position.y, z: position.z },
    avatarTarget: look,
    cameraTarget: look
  })

  const emote = SITTING_EMOTES[Math.floor(Math.random() * SITTING_EMOTES.length)]
  void triggerEmote({ predefinedEmote: emote })

  sittingOn = target
  seated = false
  arriveTimer = ARRIVE_TIMEOUT_SECONDS
  console.log(`[WIP] sit: ${emote} @ (${position.x.toFixed(2)},${position.y.toFixed(2)},${position.z.toFixed(2)})`)
}

function sitSystem(dt: number) {
  if (!sittingOn) return
  const player = Transform.getOrNull(engine.PlayerEntity)
  if (!player) return

  const spotPos = Transform.get(sittingOn.entity).position
  const distance = Vector3.distance(player.position, spotPos)

  if (!seated) {
    if (distance <= SIT_SPOT.standUpDistance) {
      seated = true
      return
    }
    arriveTimer -= dt
    if (arriveTimer <= 0) {
      console.log('[WIP] sit: arrive timeout — freeing spot')
      clearClaim()
    }
    return
  }

  if (distance > SIT_SPOT.standUpDistance) {
    console.log('[WIP] sit: walked away — stand')
    clearClaim()
  }
}

function clearClaim() {
  sittingOn = null
  seated = false
  for (const seat of HOUSE) setBenchHover(seat.bench, 'Sit')
}

function nearestFreeSpot(bench: BenchId, from: { x: number; y: number; z: number }): Spot | null {
  let nearest: Spot | null = null
  let nearestDistance = Infinity
  for (const spot of spots) {
    if (spot.bench !== bench) continue
    const distance = Vector3.distance(from, Transform.get(spot.entity).position)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = spot
    }
  }
  return nearest
}

function setBenchHover(bench: BenchId, text: string) {
  setHoverText(seatHits.get(bench) ?? null, text)
}
