import {
  AssetLoad,
  AudioSource,
  Billboard,
  ColliderLayer,
  engine,
  EngineInfo,
  Material,
  MeshCollider,
  PointerEvents,
  pointerEventsSystem,
  PlayerIdentityData,
  TextShape,
  Transform
} from '@dcl/sdk/ecs'
import { Color3, Color4 } from '@dcl/sdk/math'
import { isStateSyncronized, syncEntity } from '@dcl/sdk/network'
import { getPlayer } from '@dcl/sdk/players'
import { triggerEmote } from '~system/RestrictedActions'
import { DAILY_PRIZES, MIN_TURNS, payoutFor, pickDailyPrize, PRIZES, SLICE_DEGREES } from './prizes'
import { facingSpinZ } from './facing'
import { alreadyGuessed, countHits, isSolved, normalizeLetter, WEEKLY_PUZZLE } from './puzzle'
import { refreshBoard, setBankSign, setupBoard } from './board'
import { lastSpinLine, setCrowdLine, setShowStats, setupShowWall, syncShowBoard } from './countdown'
import { isDailyReeling, playDailyReel, setupDailyWall } from './dailyWall'
import { pushLastSpin } from './history'
import { bindUse } from './interact'
import { ShowState } from './state'
import { setupStage } from './studio'
import { clockParts } from './week'

enum SyncIds {
  ShowState = 1
}

const WHEEL_TEX = 'assets/Images/wheel-face.png'
const RING_TEX = 'assets/Images/wheel-ring.png'
const BANNER_TEX = 'assets/Images/banner.png'
const SPIN_SECONDS = 4.2
const AUDIO = {
  click: 'assets/Audio/button-sound.mp3',
  spin: 'assets/Audio/lever-sound.mp3',
  win: 'assets/Audio/wingame.mp3',
  miss: 'assets/Audio/gameover.mp3',
  jackpot: 'assets/Audio/fireworkexplode.mp3'
}

type EntityRef = ReturnType<typeof engine.addEntity>

type SpinAnim = {
  elapsed: number
  duration: number
  startAngle: number
  endAngle: number
  prizeIndex: number
  winner: string
}

let wheelRoot: EntityRef | null = null
let resultSign: EntityRef | null = null
let spinButton: EntityRef | null = null
let wheelDisc: EntityRef | null = null
let wheelHit: EntityRef | null = null
let stateEntity: EntityRef | null = null
let lastSeenNonce = 0
let lastSeenDailyNonce = 0
let currentAngle = 0
let anim: SpinAnim | null = null
let crowdTimer = 0
let lastCrowdCount = -1
let snappedFromNetwork = false
let roundResetIn = 0

export function setupGame() {
  wheelRoot = engine.getEntityOrNullByName('WheelRoot')
  resultSign = engine.getEntityOrNullByName('ResultText')
  spinButton = engine.getEntityOrNullByName('SpinButton')
  wheelDisc = engine.getEntityOrNullByName('WheelDisc')
  wheelHit = engine.getEntityOrNullByName('WheelHit')

  preloadAudio()

  stateEntity = engine.addEntity()
  ShowState.create(stateEntity, {
    spinNonce: 0,
    prizeIndex: 0,
    spinning: false,
    lastWinner: '',
    lastPrize: '',
    guessed: '',
    canGuess: false,
    roundWip: 0,
    roundNfts: 0,
    liveSpin: false,
    lastSpins: '',
    dailyNonce: 0,
    dailyIndex: 0,
    dailyWinner: '',
    dailyPrize: '',
    dailySpinning: false
  })
  syncEntity(stateEntity, [ShowState.componentId], SyncIds.ShowState)

  muteWheelClick()
  paintShowTextures()
  setupBoard()
  setupShowWall()
  setupDailyWall(() => requestDailySpin())
  setupStage()
  bindShowClicks()
  styleResultSign()
  setShowStats('', 'CLICK THE PINK PAD', 'BANK  0 $WIP', '')
  faceCameraY('SpinLabel')
  faceCameraY('HostLabel')
  faceCameraY('Seat1Label')
  faceCameraY('Seat2Label')
  faceCameraY('Seat3Label')
  faceCameraY('AudienceLabel')

  engine.addSystem(syncSpinSystem)
  engine.addSystem(spinSystem)
  engine.addSystem(crowdSystem)
  engine.addSystem(puzzleWatchSystem)
  engine.addSystem(roundResetSystem)
}

function paintShowTextures() {
  paintPbr(wheelDisc, WHEEL_TEX, true)
  paintPbr(engine.getEntityOrNullByName('WheelFrame'), RING_TEX, true)
  paintPbr(engine.getEntityOrNullByName('Banner'), BANNER_TEX, false)
}

function paintPbr(entity: EntityRef | null, src: string, alpha: boolean) {
  if (!entity) return
  const texture = Material.Texture.Common({ src })
  Material.setPbrMaterial(entity, {
    texture,
    emissiveTexture: texture,
    emissiveColor: Color3.create(1, 1, 1),
    emissiveIntensity: 0.55,
    metallic: 0,
    roughness: 1,
    albedoColor: Color4.create(1, 1, 1, 1),
    transparencyMode: alpha ? 1 : 0,
    alphaTest: alpha ? 0.5 : 1,
    castShadows: false
  })
}

function faceCameraY(name: string) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity) return
  Billboard.createOrReplace(entity, { billboardMode: 2 })
}

function preloadAudio() {
  const loader = engine.addEntity()
  AssetLoad.create(loader, {
    assets: [AUDIO.click, AUDIO.spin, AUDIO.win, AUDIO.miss, AUDIO.jackpot, WHEEL_TEX, RING_TEX, BANNER_TEX]
  })
  if (spinButton) {
    AudioSource.create(spinButton, { audioClipUrl: AUDIO.click, playing: false, volume: 0.9 })
  }
  if (wheelRoot) {
    AudioSource.create(wheelRoot, { audioClipUrl: AUDIO.spin, playing: false, volume: 0.85 })
  }
}

function muteWheelClick() {
  if (!wheelHit) return
  pointerEventsSystem.removeOnPointerDown(wheelHit)
  if (PointerEvents.has(wheelHit)) PointerEvents.deleteFrom(wheelHit)
  MeshCollider.setBox(wheelHit, ColliderLayer.CL_PHYSICS)
}

function bindShowClicks() {
  bindUse(spinButton, 'Play Wheel of Fortune', () => requestShowSpin(), 5)
}

function bindSpinTarget(entity: EntityRef | null, hoverText: string) {
  bindUse(entity, hoverText, () => requestShowSpin())
}

function setHover(entity: EntityRef | null, hoverText: string) {
  if (!entity) return
  pointerEventsSystem.removeOnPointerDown(entity)
  bindSpinTarget(entity, hoverText)
}

function playerName(): string {
  const player = getPlayer()
  if (!player || player.isGuest) return 'Guest'
  return player.name || 'Builder'
}

function paintShowBoard(play: string, bank: string) {
  if (!stateEntity || !ShowState.has(stateEntity)) {
    setShowStats('', play, bank, '')
    return
  }
  const state = ShowState.get(stateEntity)
  setShowStats(state.guessed, play, bank, state.lastSpins)
}

function sceneIsHidden(): boolean {
  return EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden === true
}

function requestShowSpin() {
  if (!stateEntity || anim) return
  const state = ShowState.getMutable(stateEntity)
  if (state.spinning || state.canGuess) return
  if (isSolved(WEEKLY_PUZZLE.answer, state.guessed)) return

  const prizeIndex = Math.floor(Math.random() * PRIZES.length)
  const winner = playerName()
  const payout = payoutFor(prizeIndex, true)
  state.prizeIndex = prizeIndex
  state.spinNonce += 1
  state.spinning = true
  state.liveSpin = true
  state.lastWinner = winner
  state.lastPrize = payout.label
  state.lastSpins = pushLastSpin(state.lastSpins, winner, payout.label)

  if (spinButton) AudioSource.playSound(spinButton, AUDIO.click)
  applySpin(state.spinNonce, prizeIndex, winner, true)
}

function requestDailySpin() {
  if (!stateEntity || isDailyReeling()) return
  const state = ShowState.getMutable(stateEntity)
  const prize = pickDailyPrize()
  const winner = playerName()
  const index = DAILY_PRIZES.indexOf(prize)
  state.dailyIndex = index < 0 ? 0 : index
  state.dailyNonce += 1
  state.dailyWinner = winner
  state.dailyPrize = prize.label
  state.dailySpinning = true
  lastSeenDailyNonce = state.dailyNonce
  playDailyReel(state.dailyNonce, state.dailyIndex, winner, prize.label)
}

function applySpin(nonce: number, prizeIndex: number, winner: string, playStartSound: boolean) {
  if (nonce <= lastSeenNonce) return
  lastSeenNonce = nonce

  const currentMod = ((currentAngle % 360) + 360) % 360
  const targetMod = (prizeIndex + 0.5) * SLICE_DEGREES
  let delta = targetMod - currentMod
  if (delta < 0) delta += 360

  anim = {
    elapsed: 0,
    duration: SPIN_SECONDS,
    startAngle: currentAngle,
    endAngle: currentAngle + MIN_TURNS * 360 + delta,
    prizeIndex,
    winner
  }
  setResultText('SPINNING  ·  WATCH THE WHEEL')
  const bank =
    stateEntity && ShowState.has(stateEntity)
      ? bankLine(ShowState.get(stateEntity).roundWip, ShowState.get(stateEntity).roundNfts, false)
      : 'BANK  0 $WIP'
  paintShowBoard('SPINNING  ·  WATCH THE WHEEL', bank)
  setHover(spinButton, 'Wheel is spinning')
  if (playStartSound && wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.spin)
}

function snapToPrize(prizeIndex: number) {
  currentAngle = (prizeIndex + 0.5) * SLICE_DEGREES
  setWheelAngle(currentAngle)
}

function easeOutCubic(t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t
  return 1 - Math.pow(1 - clamped, 3)
}

function setWheelAngle(degrees: number) {
  if (!wheelRoot || !Transform.has(wheelRoot)) return
  Transform.getMutable(wheelRoot).rotation = facingSpinZ(degrees)
}

function styleResultSign() {
  if (!resultSign) return
  if (Transform.has(resultSign)) {
    Transform.getMutable(resultSign).scale = { x: 0.01, y: 0.01, z: 0.01 }
  }
}

function setResultText(value: string) {
  if (!resultSign || !TextShape.has(resultSign)) return
  TextShape.getMutable(resultSign).text = value
}

function celebrate(prizeId: string, live: boolean) {
  if (sceneIsHidden()) return
  if (prizeId === 'try-again') {
    if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.miss)
    return
  }
  if (live && (prizeId === 'jackpot' || prizeId === 'nft-drop')) {
    if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.jackpot)
    void triggerEmote({ predefinedEmote: 'clap' })
    return
  }
  if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.win)
  void triggerEmote({ predefinedEmote: prizeId === 'shoutout' ? 'wave' : 'clap' })
}

function finishSpin(prizeIndex: number, winner: string) {
  const live = liveSpinFlag()
  const prize = payoutFor(prizeIndex, live)
  if (stateEntity && ShowState.has(stateEntity)) {
    const state = ShowState.getMutable(stateEntity)
    state.spinning = false
    state.lastWinner = winner
    state.lastPrize = prize.label
    state.canGuess = prize.id !== 'try-again'
    if (isSolved(WEEKLY_PUZZLE.answer, state.guessed)) {
      state.canGuess = false
    }
  }
  if (prize.id === 'try-again') {
    const bank = stateEntity && ShowState.has(stateEntity) ? bankLine(ShowState.get(stateEntity).roundWip, ShowState.get(stateEntity).roundNfts, false) : 'BANK  0 $WIP'
    setResultText(`${winner.toUpperCase()}  ·  TRY AGAIN`)
    paintShowBoard(`${winner.toUpperCase()}  ·  TRY AGAIN`, bank)
    setHover(spinButton, spinHover())
    celebrate(prize.id, live)
    return
  }
  setResultText(`${winner.toUpperCase()}  ·  ${prizeLine(prize)}  ·  CALL A LETTER`)
  const bank =
    stateEntity && ShowState.has(stateEntity)
      ? bankLine(ShowState.get(stateEntity).roundWip, ShowState.get(stateEntity).roundNfts, false)
      : 'BANK  0 $WIP'
  paintShowBoard(`${winner.toUpperCase()}  ·  CALL A LETTER`, bank)
  setHover(spinButton, 'Call a letter')
  celebrate(prize.id, live)
}

export function guessLetter(raw: string) {
  if (!stateEntity || anim) return
  const letter = normalizeLetter(raw)
  if (!letter) return
  const state = ShowState.getMutable(stateEntity)
  if (!state.canGuess || alreadyGuessed(state.guessed, letter)) return

  state.guessed = state.guessed + letter
  state.canGuess = false
  const hits = countHits(WEEKLY_PUZZLE.answer, letter)
  refreshBoard(state.guessed)

  if (hits > 0) {
    const prize = payoutFor(state.prizeIndex, state.liveSpin)
    state.roundWip += prize.wip * hits
    if (prize.nft > 0) state.roundNfts += prize.nft
    setBankSign(state.roundWip, state.roundNfts, false)
  }

  if (isSolved(WEEKLY_PUZZLE.answer, state.guessed)) {
    setBankSign(state.roundWip, state.roundNfts, true)
    setResultText(`SOLVED  ·  BANKED ${state.roundWip} $WIP`)
    paintShowBoard(`SOLVED  ·  ${state.lastWinner.toUpperCase()}`, bankLine(state.roundWip, state.roundNfts, true))
    setHover(spinButton, 'Round complete')
    if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.jackpot)
    void triggerEmote({ predefinedEmote: 'clap' })
    roundResetIn = 6
    return
  }

  if (hits > 0) {
    setResultText(`${hits} ${letter}${hits === 1 ? '' : 'S'}  ·  SPIN AGAIN`)
    paintShowBoard(`${hits} ${letter}${hits === 1 ? '' : 'S'}  ·  SPIN AGAIN`, bankLine(state.roundWip, state.roundNfts, false))
    if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.win)
  } else {
    setResultText(`NO ${letter}  ·  SPIN AGAIN`)
    paintShowBoard(`NO ${letter}  ·  SPIN AGAIN`, bankLine(state.roundWip, state.roundNfts, false))
    if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.miss)
  }
  setHover(spinButton, spinHover())
}

function puzzleWatchSystem() {
  if (!stateEntity || !ShowState.has(stateEntity)) return
  const state = ShowState.get(stateEntity)
  refreshBoard(state.guessed)
  setBankSign(state.roundWip, state.roundNfts, isSolved(WEEKLY_PUZZLE.answer, state.guessed))
  syncShowBoard(state.guessed, state.lastSpins)
}

function roundResetSystem(dt: number) {
  if (roundResetIn <= 0) return
  roundResetIn -= dt
  if (roundResetIn > 0) return
  if (!stateEntity || !ShowState.has(stateEntity)) return
  const state = ShowState.getMutable(stateEntity)
  state.guessed = ''
  state.canGuess = false
  state.roundWip = 0
  state.roundNfts = 0
  state.lastPrize = ''
  refreshBoard('')
  setBankSign(0, 0, false)
  setResultText('NEW ROUND  ·  SPIN TO START')
  paintShowBoard('SPIN THE SHOW WHEEL', 'BANK  0 $WIP')
  setHover(spinButton, spinHover())
}

function syncSpinSystem() {
  if (!stateEntity) return
  const state = ShowState.getOrNull(stateEntity)
  if (!state) return
  if (state.dailyNonce > lastSeenDailyNonce) {
    lastSeenDailyNonce = state.dailyNonce
    playDailyReel(state.dailyNonce, state.dailyIndex, state.dailyWinner || 'Guest', state.dailyPrize)
  }
  if (state.spinNonce > lastSeenNonce) {
    applySpin(state.spinNonce, state.prizeIndex, state.lastWinner || 'Guest', true)
    return
  }
  if (!snappedFromNetwork && isStateSyncronized() && state.spinNonce > 0 && !state.spinning && !anim) {
    snappedFromNetwork = true
    lastSeenNonce = state.spinNonce
    snapToPrize(state.prizeIndex)
    if (state.lastPrize) {
      setResultText(`LAST SPIN  ·  ${(state.lastWinner || 'Guest').toUpperCase()}  ·  ${state.lastPrize}`)
      paintShowBoard(lastSpinLine(state.lastSpins, `${(state.lastWinner || 'Guest').toUpperCase()}  ·  ${state.lastPrize}`), bankLine(state.roundWip, state.roundNfts, false))
    }
  }
}

function spinSystem(dt: number) {
  if (!anim) return
  // Keep spinning even if the local player opened the map, so the shared
  // result stays aligned for everyone in the room.
  anim.elapsed += dt
  const t = easeOutCubic(anim.elapsed / anim.duration)
  currentAngle = anim.startAngle + (anim.endAngle - anim.startAngle) * t
  setWheelAngle(currentAngle)

  if (anim.elapsed >= anim.duration) {
    currentAngle = anim.endAngle
    setWheelAngle(currentAngle)
    const done = anim
    anim = null
    finishSpin(done.prizeIndex, done.winner)
  }
}

function crowdSystem(dt: number) {
  crowdTimer += dt
  if (crowdTimer < 0.5) return
  crowdTimer = 0
  let count = 0
  for (const [_entity] of engine.getEntitiesWith(PlayerIdentityData)) {
    count += 1
  }
  if (count === lastCrowdCount) return
  lastCrowdCount = count
  setCrowdLine(count)
}

export type HudCopy = {
  live: boolean
  status: string
}

export function hudCopy(): HudCopy {
  const clock = clockParts()
  if (anim) {
    return { live: clock.live, status: 'SHOW  ·  SPINNING' }
  }
  if (!stateEntity || !ShowState.has(stateEntity)) {
    return { live: clock.live, status: clock.live ? 'LIVE SHOW  ·  SPIN THE PINK PAD' : 'DAILY GOLD PAD  ·  SHOW PINK PAD' }
  }
  const state = ShowState.get(stateEntity)
  if (isSolved(WEEKLY_PUZZLE.answer, state.guessed) && roundResetIn > 0) {
    return { live: clock.live, status: bankLine(state.roundWip, state.roundNfts, true) }
  }
  if (state.canGuess) {
    return { live: clock.live, status: `CALL A LETTER  ·  ${state.lastPrize}` }
  }
  if (state.lastPrize) {
    return { live: clock.live, status: `${state.lastPrize}  ·  ${bankLine(state.roundWip, state.roundNfts, false)}` }
  }
  return {
    live: clock.live,
    status: clock.live ? 'LIVE SHOW  ·  SPIN THE PINK PAD' : 'GOLD PAD DAILY  ·  PINK PAD THE SHOW'
  }
}

function spinHover(): string {
  return 'Spin Wheel of Fortune'
}

function liveSpinFlag(): boolean {
  if (stateEntity && ShowState.has(stateEntity)) return ShowState.get(stateEntity).liveSpin
  return true
}

function prizeLine(prize: ReturnType<typeof payoutFor>): string {
  if (prize.label === prize.sliceLabel) return prize.label
  return `${prize.sliceLabel}  ·  ${prize.label}`
}

function bankLine(wip: number, nfts: number, solved: boolean) {
  const nftBit = nfts > 0 ? `  ·  ${nfts} NFT` : ''
  return solved ? `BANKED  ${wip} $WIP${nftBit}` : `BANK  ${wip} $WIP${nftBit}`
}

export function puzzleHud(): { canGuess: boolean; guessed: string; solved: boolean; bank: string; lastPrize: string } {
  if (!stateEntity || !ShowState.has(stateEntity)) {
    return { canGuess: false, guessed: '', solved: false, bank: bankLine(0, 0, false), lastPrize: '' }
  }
  const state = ShowState.get(stateEntity)
  const solved = isSolved(WEEKLY_PUZZLE.answer, state.guessed)
  return {
    canGuess: state.canGuess && !anim,
    guessed: state.guessed,
    solved,
    bank: bankLine(state.roundWip, state.roundNfts, solved && roundResetIn > 0),
    lastPrize: state.lastPrize
  }
}
