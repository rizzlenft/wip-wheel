import {
  Animator,
  AudioSource,
  Billboard,
  BillboardMode,
  ColliderLayer,
  engine,
  GltfContainer,
  Material,
  MeshRenderer,
  TextShape,
  Transform
} from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion } from '@dcl/sdk/math'
import { DAILY_PRIZES } from './prizes'
import { facingSpinZ } from './facing'
import { bindUse, physicsOnly, setHoverShown, setHoverText } from './interact'
import { DAILY_CABINET, DAILY_PAD, DAILY_PLAQUE_Y, DAILY_REACH } from './layout'
import {
  GLOW,
  LOOK,
  makeClickVolume,
  makeLogo,
  makeText,
  paintSolid,
  setSign,
  spotlightDown
} from './look'
type EntityRef = ReturnType<typeof engine.addEntity>

const CABINET_SRC = 'assets/Models/daily-pedestal.glb'
const FACE_PLAYER = Quaternion.fromEulerDegrees(0, 180, 0)
/** Kept for state setters. The readable lines live on the HUD, not on the cabinet. */
const LINE = { kicker: 0.055, prize: 0.07, winner: 0.048 } as const

function say(
  entity: EntityRef | null,
  value: string,
  color: Color4,
  size: number
) {
  setSign(entity, value, color)
  if (entity && TextShape.has(entity)) TextShape.getMutable(entity).fontSize = size
}

type Reel = {
  elapsed: number
  duration: number
  winner: string
  label: string
}

let panel: EntityRef | null = null
let kicker: EntityRef | null = null
let prizeSign: EntityRef | null = null
let winnerSign: EntityRef | null = null
let dailyButton: EntityRef | null = null
/** Gold disc — pulse while someone owns the daily spin (Meetup “who’s spinning”). */
let goldDisc: EntityRef | null = null
let lastDailyNonce = 0
let reel: Reel | null = null
let landedUntil = 0
let pulse = 0
let onSpin: (() => void) | null = null
/** True while the physical wheel is spinning for a daily claim. */
let watchingWheel = false
/** After claimer celebration, settle to ALREADY CLAIMED — never back to WIN A WEARABLE. */
let settleClaimedAfterLand = false
let settleClaimLabel = ''

export function setupDailyWall(startSpin: () => void) {
  onSpin = startSpin
  const cabinet = buildCabinet()
  buildSign(cabinet)
  buildPodium(cabinet)
  buildDailyWheel(cabinet)
  // Stage/Floor must stay physics-only or the gold pad ray dies (same bug as show pads).
  physicsOnly('Stage')
  physicsOnly('Floor')
  // One hover on the gold HIT; sign stays clickable but silent (no second chip).
  bindUse(dailyButton, 'Spin the daily', fire, DAILY_REACH.click, false, 10, true, DAILY_REACH.proximity)
  bindUse(panel, 'Spin the daily', fire, DAILY_REACH.click, false, 10, false, DAILY_REACH.proximity)
  // Do not advertise WIN A WEARABLE until dailyStatus returns (14 Oct honesty).
  showDailyPendingEligibility()
  engine.addSystem(dailyReelSystem)
}

/** Short jumbotron reel (errors / already-claimed / legacy). */
export function playDailyReel(nonce: number, _prizeIndex: number, winner: string, prizeLabel: string) {
  if (nonce <= lastDailyNonce) return
  lastDailyNonce = nonce
  watchingWheel = false
  reel = { elapsed: 0, duration: 2.2, winner, label: prizeLabel }
  say(kicker, 'SPINNING', LOOK.gold, LINE.kicker)
  say(winnerSign, winner.toUpperCase(), LOOK.cream, LINE.winner)
  if (dailyButton) AudioSource.playSound(dailyButton, 'assets/Audio/lever-sound.mp3')
}

/** Daily uses the physical wheel — hold the sign until landDailyPrize. */
export function beginDailyWatch(nonce: number, winner: string) {
  if (nonce < lastDailyNonce) return
  lastDailyNonce = nonce
  reel = null
  landedUntil = 0
  watchingWheel = true
  // Calm directionals — but name the owner loud (15 Oct Meetup ghosts).
  say(kicker, 'ON THE WHEEL', LOOK.gold, LINE.kicker)
  say(prizeSign, 'DAILY', LOOK.gold, LINE.prize)
  say(winnerSign, winner.toUpperCase(), LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 1.6)
  if (goldDisc) paintSolid(goldDisc, LOOK.gold, GLOW.gold, 3.2)
  if (dailyButton) AudioSource.playSound(dailyButton, 'assets/Audio/lever-sound.mp3')
}

export function landDailyPrize(winner: string, label: string) {
  watchingWheel = false
  reel = null
  landedUntil = 3.8
  settleClaimedAfterLand = true
  settleClaimLabel = label
  const miss = label.toUpperCase().includes('TRY AGAIN') || label.toUpperCase().includes('ALREADY')
  say(kicker, miss ? 'NO PRIZE' : 'YOU WON', LOOK.mint, LINE.kicker)
  say(prizeSign, label, LOOK.mint, LINE.prize)
  say(winnerSign, miss ? 'COME BACK TOMORROW' : 'CHECK YOUR WALLET', LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, miss ? GLOW.gold : GLOW.mint, 1.8)
  if (goldDisc) paintSolid(goldDisc, LOOK.gold, GLOW.gold, 2.2)
  if (dailyButton) AudioSource.playSound(dailyButton, winClip(label))
}

/** Static state when this wallet already took today's spin (no reel). */
export function showDailyAlreadyClaimed(label: string, winner?: string, walletHint?: string) {
  watchingWheel = false
  reel = null
  landedUntil = 0
  settleClaimedAfterLand = false
  // Habit is done. Thursday stays on the sign so "come back" has a when.
  void label
  void walletHint
  say(kicker, 'DONE TODAY', LOOK.gold, LINE.kicker)
  say(prizeSign, 'COME BACK TOMORROW', LOOK.cream, LINE.prize)
  say(winnerSign, 'SHOW IS THU 3 PM ET', LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 0.55)
  if (goldDisc) paintSolid(goldDisc, LOOK.gold, GLOW.gold, 2.2)
  setHoverText(dailyButton, 'Come back tomorrow')
  setHoverText(panel, 'Come back tomorrow')
  setDailyCue('BACK TOMORROW')
}

/** Before dailyStatus — do not promise WIN A WEARABLE to guests or already-claimed wallets. */
export function showDailyPendingEligibility() {
  watchingWheel = false
  reel = null
  landedUntil = 0
  settleClaimedAfterLand = false
  say(kicker, 'DAILY', LOOK.cream, LINE.kicker)
  say(prizeSign, 'CHECKING…', LOOK.gold, LINE.prize)
  say(winnerSign, '', LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 0.35)
}

/**
 * Late-join / room memory — last daily result without LOOK LEFT or YOU WON.
 * Must not feel like this player just claimed (13 Oct enter-replay bug).
 */
export function showDailyRoomLast(winner: string, label: string) {
  watchingWheel = false
  reel = null
  landedUntil = 0
  if (!label) {
    setIdle()
    return
  }
  say(kicker, 'LAST DAILY', LOOK.gold, LINE.kicker)
  say(prizeSign, label, LOOK.cream, LINE.prize)
  say(winnerSign, (winner || '').toUpperCase(), LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 0.55)
  if (goldDisc) paintSolid(goldDisc, LOOK.gold, GLOW.gold, 2.2)
}

export function showDailyNeedsWallet() {
  watchingWheel = false
  reel = null
  landedUntil = 0
  settleClaimedAfterLand = false
  say(kicker, 'WALLET', LOOK.gold, LINE.kicker)
  say(prizeSign, 'CONNECT TO SPIN', LOOK.cream, LINE.prize)
  // Guests can watch; wearables only go to a real wallet (14 Oct).
  say(winnerSign, 'GUESTS CAN WATCH', LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 0.55)
  setHoverText(dailyButton, 'Connect a wallet to spin')
  setHoverText(panel, 'Connect a wallet to spin')
}

/** Server cold-start — not a claim. Do not reuse the already-claimed layout. */
export function showDailyServerWaking() {
  showDailyWait('SERVER WAKING UP', 'TRY AGAIN IN A MOMENT')
}

/** Visible feedback when a daily click is heard but cannot start yet. */
export function showDailyWait(line: string, sub = '') {
  watchingWheel = false
  reel = null
  landedUntil = 0
  say(kicker, 'WAIT', LOOK.gold, LINE.kicker)
  say(prizeSign, line, LOOK.cream, LINE.prize)
  say(winnerSign, sub, LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 0.55)
}

export function isDailyReeling(): boolean {
  return reel !== null || landedUntil > 0 || watchingWheel
}

/** Gate new spins — do NOT include watchingWheel (set as click feedback before send). */
export function isDailySpinBusy(): boolean {
  return reel !== null || landedUntil > 0
}

/** True while the shared wheel is reserved for a daily claim. */
export function isDailyWatching(): boolean {
  return watchingWheel
}

/** Mutate proximity/hover only — never re-bindUse (double-fire rule). */
export function setDailyHover(hoverText: string, shown = true) {
  setHoverText(dailyButton, hoverText)
  setHoverText(panel, hoverText)
  setHoverShown(dailyButton, shown)
  setHoverShown(panel, shown)
}

/** Feet on the floor. Yaw 180 puts local +Z toward spawn. The stone collider blocks walking. */
function buildCabinet(): EntityRef {
  const { x, z } = DAILY_PAD
  const cabinet = engine.addEntity()
  Transform.create(cabinet, {
    position: { x, y: DAILY_CABINET.originY, z },
    rotation: FACE_PLAYER,
    scale: { x: DAILY_CABINET.scale, y: DAILY_CABINET.scale, z: DAILY_CABINET.scale }
  })
  // Physics only. A pointer hit on the stone would swallow the spin volume.
  // The disc has no collider, so the recess is not a pit.
  // Stone material is albedo only. Glow stays on the rune, which is the small accent.
  GltfContainer.create(cabinet, {
    src: CABINET_SRC,
    visibleMeshesCollisionMask: 0,
    invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
  })
  return cabinet
}

function mount(entity: EntityRef, parent: EntityRef, position: { x: number; y: number; z: number }) {
  const transform = Transform.getMutable(entity)
  transform.parent = parent
  transform.position = position
  transform.rotation = FACE_PLAYER
}

/**
 * Logo on the cap, toward spawn. The red pointer hangs under the plaque.
 * daily-pointer.glb rest mesh Y is 0.138–0.540. ArmatureAction lifts the bone by at most 0.175.
 */
let dailyCue: EntityRef | null = null

function buildSign(cabinet: EntityRef) {
  panel = null
  // Badge on the cap. Divided by the parent scale so it stays about 0.24 m.
  const logo = makeLogo({ x: 0, y: 0, z: 0 }, 0.24 / DAILY_CABINET.scale)
  mount(logo, cabinet, { x: 0, y: 2.35, z: 1.32 })
  buildDailyMarker()
}

function buildDailyMarker() {
  const x = DAILY_PAD.x
  const z = DAILY_PAD.z
  // Plaque stays at the signed-off height. The pedestal is a different mesh.
  const signY = DAILY_PLAQUE_Y
  const signBottom = signY - 0.525
  const altarTop = DAILY_CABINET.originY + DAILY_CABINET.rimY * DAILY_CABINET.scale

  // daily-pointer.glb. Tip is the mesh minimum. The clip only moves the arrow up.
  const arrowScale = 1.65
  const tipY = 0.1379
  const topAtPeak = 0.5398 + 0.1748
  const aboveCabinet = 0.22
  const arrowY = altarTop + aboveCabinet - arrowScale * tipY
  const arrowTop = arrowY + arrowScale * topAtPeak
  if (arrowTop > signBottom - 0.12) {
    console.log('[WIP] daily arrow would meet the sign', arrowTop.toFixed(2), signBottom.toFixed(2))
  }

  const arrow = engine.addEntity()
  Transform.create(arrow, {
    position: { x, y: arrowY, z },
    scale: { x: arrowScale, y: arrowScale, z: arrowScale }
  })
  GltfContainer.create(arrow, {
    src: 'assets/Models/daily-pointer.glb',
    visibleMeshesCollisionMask: 0,
    invisibleMeshesCollisionMask: 0
  })
  Animator.create(arrow, {
    states: [{ clip: 'ArmatureAction', playing: true, loop: true }]
  })
  const face = engine.addEntity()
  Transform.create(face, { position: { x, y: signY, z } })
  Billboard.create(face, { billboardMode: BillboardMode.BM_Y })

  const rim = engine.addEntity()
  Transform.create(rim, {
    parent: face,
    position: { x: 0, y: 0, z: 0.04 },
    scale: { x: 2.35, y: 1.05, z: 0.04 }
  })
  MeshRenderer.setBox(rim)
  paintSolid(rim, LOOK.gold, GLOW.gold, 0.55)

  const board = engine.addEntity()
  Transform.create(board, {
    parent: face,
    position: { x: 0, y: 0, z: 0.01 },
    scale: { x: 2.12, y: 0.82, z: 0.04 }
  })
  MeshRenderer.setBox(board)
  paintSolid(board, LOOK.navy, GLOW.ink, 0.15)

  dailyCue = makeText({ x: 0, y: 0, z: 0 }, 0.95, LOOK.cream, {
    serif: true,
    width: 2.0,
    height: 0.7
  })
  const cue = Transform.getMutable(dailyCue)
  cue.parent = face
  cue.position = { x: 0, y: 0, z: -0.04 }
  setSign(dailyCue, 'DAILY SPIN')
}

function setDailyCue(value: string) {
  setSign(dailyCue, value)
}

/**
 * Gold disc south of the sign. Copy lives on the DAILY SPIN panel.
 */
let dailySpinRoot: EntityRef | null = null

/** Disc lies in the measured hole. +90 X is face-up, same as the show wheel. Spin stays local Z. */
function buildDailyWheel(cabinet: EntityRef) {
  const pitch = engine.addEntity()
  Transform.create(pitch, {
    parent: cabinet,
    position: DAILY_CABINET.hole,
    rotation: Quaternion.fromEulerDegrees(90, 0, 0)
  })
  dailySpinRoot = engine.addEntity()
  Transform.create(dailySpinRoot, { parent: pitch })
  const face = engine.addEntity()
  const disc = DAILY_CABINET.holeDiameter * 0.97
  Transform.create(face, {
    parent: dailySpinRoot,
    scale: { x: disc, y: disc, z: 1 }
  })
  MeshRenderer.setPlane(face)
  // Daily catalog only. Corners are transparent; alpha cutout keeps the square from drawing.
  const texture = Material.Texture.Common({ src: 'assets/Images/daily-face.png' })
  Material.setPbrMaterial(face, {
    texture,
    emissiveColor: Color3.create(0, 0, 0),
    emissiveIntensity: 0,
    metallic: 0,
    roughness: 1,
    specularIntensity: 0,
    albedoColor: Color4.create(1, 1, 1, 1),
    transparencyMode: 1,
    alphaTest: 0.35,
    castShadows: false
  })
  buildLandArrow(cabinet)
}

/**
 * Fixed marker on the player side of the hole. The disc spins under it.
 * 0° puts WEARABLE on this edge; 180° puts TRY AGAIN here.
 * Tip is the cylinder's -Y, and +90° X aims that tip at the center.
 */
function buildLandArrow(cabinet: EntityRef) {
  const radius = (DAILY_CABINET.holeDiameter * 0.97) / 2
  // Local size, because the pedestal scale would otherwise shrink the tick.
  const length = 0.11 / DAILY_CABINET.scale
  const thick = 0.04 / DAILY_CABINET.scale
  const arrow = engine.addEntity()
  Transform.create(arrow, {
    parent: cabinet,
    position: {
      x: DAILY_CABINET.hole.x,
      y: DAILY_CABINET.hole.y + 0.06,
      z: DAILY_CABINET.hole.z + radius + length / 2 - 0.01
    },
    rotation: Quaternion.fromEulerDegrees(90, 0, 0),
    scale: { x: thick, y: length, z: thick }
  })
  MeshRenderer.setCylinder(arrow, 0, 1)
  paintSolid(arrow, LOOK.gold, GLOW.gold, 1.4)
}

export function spinDailyWheel(degrees: number) {
  if (!dailySpinRoot || !Transform.has(dailySpinRoot)) return
  Transform.getMutable(dailySpinRoot).rotation = facingSpinZ(degrees)
}

function buildPodium(cabinet: EntityRef) {
  const { x, z } = DAILY_PAD
  goldDisc = null
  // Includes the lid, so a click on the wheel still hits. Inset in XZ so it stays off BenchR.
  dailyButton = makeClickVolume({ x: 0, y: 0, z: 0 }, { x: 2.6, y: 3.1, z: 2.74 })
  const button = Transform.getMutable(dailyButton)
  button.parent = cabinet
  button.position = { x: 0, y: 1.5, z: 0 }
  spotlightDown(x, z, 6.5, GLOW.gold)
  AudioSource.create(dailyButton, { audioClipUrl: 'assets/Audio/button-sound.mp3', playing: false, volume: 0.9 })
}

function fire() {
  // Do not set watchingWheel before onSpin — that made requestDailySpin think
  // we were already busy and show STILL SPINNING without ever sending (7 Oct).
  if (onSpin) onSpin()
}

/** Click heard — calm spinning copy while the server answers / wheel turns. */
export function showDailyLookingAtWheel() {
  watchingWheel = true
  reel = null
  landedUntil = 0
  say(kicker, 'ON THE WHEEL', LOOK.gold, LINE.kicker)
  say(prizeSign, 'DAILY', LOOK.gold, LINE.prize)
  say(winnerSign, '', LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 1.4)
  if (goldDisc) paintSolid(goldDisc, LOOK.gold, GLOW.gold, 3.0)
  if (dailyButton) AudioSource.playSound(dailyButton, 'assets/Audio/button-sound.mp3')
}

/** Eligible wallet, not yet claimed today — only after dailyStatus says so. */
export function showDailyEligible() {
  watchingWheel = false
  reel = null
  landedUntil = 0
  settleClaimedAfterLand = false
  say(kicker, 'NOW', LOOK.gold, LINE.kicker)
  say(prizeSign, 'WIN A WEARABLE', LOOK.gold, LINE.prize)
  say(winnerSign, 'SHOW IS THU 3 PM ET', LOOK.cream, LINE.winner)
  if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 0.35)
  if (goldDisc) paintSolid(goldDisc, LOOK.gold, GLOW.gold, 2.2)
  setHoverText(dailyButton, 'Spin the daily')
  setHoverText(panel, 'Spin the daily')
  setDailyCue('DAILY SPIN')
}

function setIdle() {
  showDailyEligible()
}

function dailyReelSystem(dt: number) {
  if (!prizeSign) return

  if (watchingWheel) {
    pulse += dt
    const hot = 1.4 + Math.sin(pulse * 10) * 1.0
    if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 0.8 + Math.sin(pulse * 10) * 0.6)
    // Hot gold disc = “someone is on daily” even when their avatar is invisible.
    if (goldDisc) paintSolid(goldDisc, LOOK.gold, GLOW.gold, hot)
    return
  }

  if (reel) {
    pulse += dt
    reel.elapsed += dt
    const tick = DAILY_PRIZES[Math.floor(reel.elapsed * 14) % DAILY_PRIZES.length]
    say(prizeSign, tick.label, LOOK.gold, LINE.prize)
    if (panel) paintSolid(panel, LOOK.ink, GLOW.gold, 0.8 + Math.sin(reel.elapsed * 18) * 0.7)
    if (reel.elapsed >= reel.duration) {
      const done = reel
      reel = null
      landedUntil = 3.8
      say(kicker, 'YOU WON', LOOK.mint, LINE.kicker)
      say(prizeSign, done.label, LOOK.mint, LINE.prize)
      say(winnerSign, done.winner.toUpperCase(), LOOK.cream, LINE.winner)
      if (panel) paintSolid(panel, LOOK.ink, GLOW.mint, 1.8)
      if (dailyButton) AudioSource.playSound(dailyButton, winClip(done.label))
    }
    return
  }

  if (landedUntil > 0) {
    pulse += dt
    landedUntil -= dt
    const on = Math.floor(pulse * 4) % 2 === 0
    if (panel) paintSolid(panel, LOOK.ink, on ? GLOW.mint : GLOW.gold, on ? 1.9 : 0.8)
    if (TextShape.has(prizeSign)) {
      TextShape.getMutable(prizeSign).textColor = on ? LOOK.mint : LOOK.cream
    }
    if (landedUntil <= 0) {
      // Claimer celebration must not reset to WIN A WEARABLE while day-locked (14 Oct).
      if (settleClaimedAfterLand) {
        showDailyAlreadyClaimed(settleClaimLabel || 'ALREADY CLAIMED')
      } else {
        setIdle()
      }
    }
  }
}

function winClip(label: string) {
  if (label === 'TRY AGAIN') return 'assets/Audio/gameover.mp3'
  return 'assets/Audio/wingame.mp3'
}
