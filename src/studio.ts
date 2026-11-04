import {
  Billboard,
  ColliderLayer,
  engine,
  Entity,
  GltfContainer,
  MeshCollider,
  MeshRenderer,
  Name,
  TextShape,
  Transform
} from '@dcl/sdk/ecs'
import { Color4, Quaternion } from '@dcl/sdk/math'
import { setupAudienceSit } from './audienceSit'
import {
  AUDIENCE,
  benchYawTowardBoard,
  HOUSE,
  SPEAKER,
  CONTESTANTS,
  SHOW_PAD,
  SHOW_PODIUM,
  SHOW_STAND,
  STUDIO_SHELL,
  WHEEL,
  WHEEL_RAKE_DEG,
  WHEEL_SCALE
} from './layout'
import { physicsOnly } from './interact'
import {
  fontSizeForMeters,
  GLOW,
  LOOK,
  hideNamed,
  makeClickVolume,
  makeText,
  moveNamed,
  paintMatte,
  paintSolid,
  setNamedText,
  setSign
} from './look'

type EntityRef = ReturnType<typeof engine.addEntity>

let showHit: EntityRef | null = null

/** Re-block the Hub composite as a game-show floor: wheel, 3 contestant pads, audience seats. */
export function setupStage() {
  hideNamed('HostPad')
  hideNamed('HostLabel')
  hideNamed('Seat1')
  hideNamed('Seat1Label')
  physicsOnly('HostPad')
  physicsOnly('Seat1')

  placeWheel()
  placeContestants()
  placeAudience()
  placeCatalogDress()
  placeStudioShell()
}

export function showHitVolume() {
  return showHit
}

let wheelPitch: Entity | null = null

function placeWheel() {
  const { x, y, z } = WHEEL
  const pitch = ensureWheelPitch(x, y, z)
  // Disc spins on WheelRoot (local Z). Frame + pointer ride the rake and do not spin.
  parentLocal(pitch, 'WheelRoot', { x: 0, y: 0, z: 0 })
  parentLocal(pitch, 'WheelFrame', { x: 0, y: 0, z: 0.02 })
  parentLocal(pitch, 'Pointer', { x: 0, y: 2.12, z: 0.04 })
  parentLocal(pitch, 'PointerCap', { x: 0, y: 1.92, z: 0.06 })
  // Upright pedestal under the hub. The face stays pointer-only (no floor).
  moveNamed('WheelStand', { x, y: 0.34, z }, { x: 0.42, y: 0.46, z: 0.42 })
  moveNamed('StandBase', { x, y: 0.05, z }, { x: 1.5, y: 0.08, z: 1.5 })
  console.log(`[WIP] wheel rake ${WHEEL_RAKE_DEG}° scale ${WHEEL_SCALE}; spin stays WheelRoot local Z`)
  physicsOnly('WheelStand')
  physicsOnly('StandBase')
  // No spot on the disc. 11000 cd plus an emissive copy of the face clipped every slice to white.
  glow('WheelStand', LOOK.navy, GLOW.magenta, 0.55)
  glow('StandBase', LOOK.gold, GLOW.gold, 1.4)
}

function ensureWheelPitch(x: number, y: number, z: number): Entity {
  if (!wheelPitch) {
    wheelPitch = engine.addEntity()
    Name.create(wheelPitch, { value: 'WheelPitch' })
    Transform.create(wheelPitch)
  }
  const transform = Transform.getMutable(wheelPitch)
  transform.position = { x, y, z }
  transform.rotation = Quaternion.fromEulerDegrees(WHEEL_RAKE_DEG, 0, 0)
  transform.scale = { x: WHEEL_SCALE, y: WHEEL_SCALE, z: WHEEL_SCALE }
  return wheelPitch
}

function parentLocal(parent: Entity, name: string, position: { x: number; y: number; z: number }) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity || !Transform.has(entity)) return
  const transform = Transform.getMutable(entity)
  transform.parent = parent
  transform.position = position
}

function placeYawed(
  name: string,
  position: { x: number; y: number; z: number },
  scale: { x: number; y: number; z: number },
  rotation: Quaternion
) {
  const entity = moveNamed(name, position, scale)
  if (!entity || !Transform.has(entity)) return
  Transform.getMutable(entity).rotation = rotation
}

function placeContestants() {
  hideNamed('PodiumBase')
  hideNamed('SpinGlow')
  // Cubes were the placeholders. Names live on the podium face, not at head height.
  hideNamed('SpinButton')
  hideNamed('SpinLabel')
  hideNamed('Seat2')
  hideNamed('Seat2Label')
  hideNamed('Seat3')
  hideNamed('Seat3Label')

  // The podium GLBs were 8,616 triangles each. The stand zone stays. A label marks pad 1.
  placeShowMark(SHOW_PAD.x, SHOW_PAD.z)

  const stand = SHOW_STAND.volume
  showHit = makeClickVolume(
    { x: stand.x, y: stand.y, z: stand.z },
    { x: stand.w, y: stand.h, z: stand.d }
  )
}

function placeShowMark(x: number, z: number) {
  const label = makeText(
    { x, y: 1.15, z: z - SHOW_PODIUM.halfZ * SHOW_PODIUM.scale },
    fontSizeForMeters(0.32),
    LOOK.cream,
    { width: 1.6, height: 0.45 }
  )
  setSign(label, 'PAD 1', LOOK.cream)
}

function placeAudience() {
  const seat = { x: 4.2, y: 0.28, z: 0.9 }
  const back = { x: 4.2, y: 0.7, z: 0.12 }
  for (const spot of HOUSE) {
    const yawDeg = benchYawTowardBoard(spot.x, spot.z)
    const yaw = Quaternion.fromEulerDegrees(0, yawDeg, 0)
    const rad = (yawDeg * Math.PI) / 180
    // +Z axis after this yaw. Backrest is behind the sitter, away from the board.
    const lookX = Math.sin(rad)
    const lookZ = Math.cos(rad)
    placeYawed(spot.bench, { x: spot.x, y: 0.38, z: spot.z }, seat, yaw)
    placeYawed(
      spot.back,
      { x: spot.x - lookX * 0.55, y: 0.85, z: spot.z - lookZ * 0.55 },
      back,
      yaw
    )
  }
  hideNamed('AudienceRiserL')
  hideNamed('AudienceRiserR')
  hideNamed('AudienceNeonL')
  hideNamed('AudienceNeonR')
  // Sit CTA on the house row — meters from AUDIENCE.label* (Hub sync map).
  // Do not Y-billboard (game.ts); house-facing reads as set dressing, not HUD over the wheel.
  moveNamed('AudienceLabel', { x: AUDIENCE.labelX, y: AUDIENCE.labelY, z: AUDIENCE.labelZ })
  setNamedText('AudienceLabel', 'SIT · WATCH THE SHOW', LOOK.gold)
  const audienceLabel = engine.getEntityOrNullByName('AudienceLabel')
  if (audienceLabel && TextShape.has(audienceLabel)) {
    const text = TextShape.getMutable(audienceLabel)
    text.fontSize = 1.45
    text.font = 1
    text.outlineWidth = 0.1
    text.width = 10
    text.height = 0.5
  }
  if (audienceLabel && Billboard.has(audienceLabel)) Billboard.deleteFrom(audienceLabel)

  physicsOnly('AudienceRiserL')
  physicsOnly('AudienceRiserR')

  // The cream planks are gone, collider included. The seat row's own collider blocks walking.
  for (const spot of HOUSE) {
    stripBench(spot.bench)
    stripBench(spot.back)
  }

  setupAudienceSit()
}

const AUDIENCE_ROW = 'assets/Models/audience-row.glb'
const TOWER_SPEAKER = 'assets/Models/tower-speaker.glb'

/**
 * Temporary dress only. The sci-fi rows keep Sit working until a studio bench
 * exists on the shared atlas. The speakers cost no texture. Everything else
 * from the catalog pass was removed: each extra file was another image, and
 * four parcels only allow 23.
 */
function placeCatalogDress() {
  for (const spot of HOUSE) {
    placeModel(
      `AudienceRow ${spot.bench}`,
      AUDIENCE_ROW,
      { x: spot.x, y: 0, z: spot.z },
      Quaternion.fromEulerDegrees(0, benchYawTowardBoard(spot.x, spot.z), 0),
      { x: 1, y: 1, z: 1 },
      true
    )
  }

  for (const [index, stack] of SPEAKER.entries()) {
    placeModel(
      index === 0 ? 'SpeakerL' : 'SpeakerR',
      TOWER_SPEAKER,
      { x: stack.x, y: 0, z: stack.z },
      Quaternion.fromEulerDegrees(0, stack.yaw, 0),
      { x: 1, y: 1, z: 1 },
      false,
      true
    )
  }
}

function placeModel(
  name: string,
  src: string,
  position: { x: number; y: number; z: number },
  rotation: Quaternion,
  scale: { x: number; y: number; z: number },
  blockWalking = false,
  solidMesh = false
) {
  const entity = engine.addEntity()
  Name.create(entity, { value: name })
  Transform.create(entity, { position, rotation, scale })
  // Pointer stays on the Sit volume and pad 1. Physics never uses both masks.
  GltfContainer.create(entity, {
    src,
    visibleMeshesCollisionMask: solidMesh ? ColliderLayer.CL_PHYSICS : 0,
    invisibleMeshesCollisionMask: blockWalking ? ColliderLayer.CL_PHYSICS : 0
  })
}

/** Lifted so a side wall still reads under the noon sky. LOOK.navy is for the letter well. */
const SHELL_NAVY = Color4.create(0.2, 0.14, 0.34, 1)
const SHELL_GOLD = Color4.create(0.72, 0.5, 0.16, 1)
const SHELL_MAGENTA = Color4.create(0.52, 0.16, 0.32, 1)

/**
 * Cyc, truss, floor ring, three chairs. Code, not the composite: Hub overwrites that file.
 * No new light. No pointer collider, so Sit and pad 1 keep the ray.
 */
function placeStudioShell() {
  const shell = STUDIO_SHELL
  placeWing('StudioCycL', shell.wingX)
  placeWing('StudioCycR', 32 - shell.wingX)
  placePost('StudioTrussL', shell.postX)
  placePost('StudioTrussR', 32 - shell.postX)
  matteBox(
    'StudioTrussTop',
    { x: 16, y: shell.trussTop.y, z: shell.trussTop.z },
    { x: shell.trussTop.w, y: shell.trussTop.h, z: shell.trussTop.d },
    SHELL_GOLD,
    false
  )
  matteBox(
    'StudioTrussRail',
    { x: 16, y: shell.rail.y, z: shell.rail.z },
    { x: shell.rail.w, y: shell.rail.h, z: shell.rail.d },
    SHELL_MAGENTA,
    false
  )
  placeFloorRing()
  CONTESTANTS.forEach((pad, index) => placeChair(index + 1, pad.x, pad.z))
}

function placeWing(name: string, x: number) {
  const wing = STUDIO_SHELL.wing
  matteBox(name, { x, y: wing.y, z: wing.z }, { x: wing.w, y: wing.h, z: wing.d }, SHELL_NAVY, true)
}

function placePost(name: string, x: number) {
  const post = STUDIO_SHELL.post
  matteBox(name, { x, y: post.y, z: post.z }, { x: post.t, y: post.h, z: post.t }, SHELL_GOLD, false)
}

/** Marks outside the wheel. No collider, so the walk onto the disc is not a curb. */
function placeFloorRing() {
  const ring = STUDIO_SHELL.ring
  for (let i = 0; i < ring.segments; i++) {
    const angle = (i / ring.segments) * Math.PI * 2
    const yaw = (angle * 180) / Math.PI
    matteBox(
      `StudioRing${i}`,
      {
        x: WHEEL.x + ring.radius * Math.sin(angle),
        y: ring.y,
        z: WHEEL.z + ring.radius * Math.cos(angle)
      },
      { x: ring.length, y: ring.height, z: ring.width },
      SHELL_GOLD,
      false,
      Quaternion.fromEulerDegrees(0, yaw, 0)
    )
  }
}

/** Back toward the board. The stand pocket in front of pad 1 stays open. */
function placeChair(index: number, x: number, z: number) {
  const chair = STUDIO_SHELL.chair
  const root = engine.addEntity()
  Name.create(root, { value: `StudioChair${index}` })
  Transform.create(root, { position: { x, y: 0, z } })
  matteBox(
    `StudioChair${index}Base`,
    { x: 0, y: 0.38, z: chair.seatZ },
    { x: 0.62, y: 0.38, z: 0.5 },
    SHELL_NAVY,
    true,
    undefined,
    root
  )
  matteBox(
    `StudioChair${index}Seat`,
    { x: 0, y: 0.62, z: chair.seatZ },
    { x: 0.72, y: 0.1, z: 0.58 },
    SHELL_NAVY,
    true,
    undefined,
    root
  )
  matteBox(
    `StudioChair${index}Back`,
    { x: 0, y: 1.05, z: chair.backZ },
    { x: 0.72, y: 0.78, z: 0.1 },
    SHELL_NAVY,
    true,
    undefined,
    root
  )
  matteBox(
    `StudioChair${index}Lip`,
    { x: 0, y: 0.68, z: chair.seatZ - 0.3 },
    { x: 0.74, y: 0.05, z: 0.06 },
    SHELL_GOLD,
    false,
    undefined,
    root
  )
}

function matteBox(
  name: string,
  position: { x: number; y: number; z: number },
  scale: { x: number; y: number; z: number },
  albedo: Color4,
  blockWalking: boolean,
  rotation: Quaternion = Quaternion.Identity(),
  parent?: EntityRef
) {
  const entity = engine.addEntity()
  Name.create(entity, { value: name })
  Transform.create(entity, { position, scale, rotation, parent })
  MeshRenderer.setBox(entity)
  paintMatte(entity, albedo)
  if (blockWalking) MeshCollider.setBox(entity, ColliderLayer.CL_PHYSICS)
}

function stripBench(name: string) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity) return
  if (MeshRenderer.has(entity)) MeshRenderer.deleteFrom(entity)
  if (MeshCollider.has(entity)) MeshCollider.deleteFrom(entity)
}

function glow(name: string, albedo: typeof LOOK.magenta, emissive: typeof GLOW.magenta, intensity: number) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity) return
  paintSolid(entity, albedo, emissive, intensity)
}
