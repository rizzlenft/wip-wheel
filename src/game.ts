import {
  AssetLoad,
  AudioSource,
  Billboard,
  engine,
  EngineInfo,
  Material,
  PlayerIdentityData,
  Transform
} from '@dcl/sdk/ecs'
import { Color3, Color4 } from '@dcl/sdk/math'
import { isStateSyncronized } from '@dcl/sdk/network'
import { getPlayer } from '@dcl/sdk/players'
import { triggerEmote } from '~system/RestrictedActions'
import { MIN_TURNS, PRIZES } from './prizes'
import { livePrizeByIndex, liveSliceDegrees } from './livePrizes'
import { isLivePhase, RoundPhase } from './livePhase'
import { facingSpinZ, normalizeSpinDegrees } from './facing'
import { alreadyGuessed, isSolved, normalizeLetter, puzzleAt } from './puzzle'
import { refreshBoard, setBankSign, setupBoard, showPuzzle } from './board'
import { lastSpinLine, setCrowdLine, setPlayerOne, setPlayerTwo, setPlayerThree, setShowStats, setupShowWall, syncShowBoard } from './countdown'
import {
  isDailySpinBusy,
  isDailyWatching,
  beginDailyWatch,
  landDailyPrize,
  setDailyHover,
  showDailyLookingAtWheel,
  showDailyRoomLast,
  setupDailyWall,
  spinDailyWheel,
  showDailyAlreadyClaimed,
  showDailyEligible,
  showDailyNeedsWallet,
  showDailyServerWaking,
  showDailyWait
} from './dailyWall'
import { bindUse, muteCollider, setHoverText, wipePointer } from './interact'
import { SHOW_STAND } from './layout'
import { hideNamed, LOGO_TEX } from './look'
import { isWalletAddress } from './shared/dailyCatalog'
import { room } from './shared/messages'
import { ServerHeartbeat } from './shared/schemas'
import { DAILY_EXTRA_TURNS, DAILY_SPIN_SECONDS, SHOW_SPIN_SECONDS } from './shared/spinTiming'
import { ShowState } from './state'
import { logFloorHealth } from './floorHealth'
import { beginDailyCam, cancelDailyCam, endDailyCam, isDailyCamOn, setupDailyCam } from './dailyCam'
import { beginShowCamBeat, cancelShowCamBeat, endShowCamBeat, setupShowCam } from './showCam'
import { beginBoardCam, endBoardCam, setupBoardCam } from './boardCam'
import { setupLeaderboardWall } from './leaderboardWall'
import { setupLiveJoin } from './liveJoin'
import { setupStage, showHitVolume } from './studio'
import { clockParts, formatRoundLeft, isShowPlayable } from './week'

const WHEEL_TEX_SHOW = 'assets/Images/wheel-face-live-4.png'
const RING_TEX = 'assets/Images/wheel-ring.png'
const HEARTBEAT_STALE_MS = 6000
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
  mode: 'show' | 'daily'
  dailyLabel: string
}

let wheelRoot: EntityRef | null = null
let spinButton: EntityRef | null = null
let hoverSyncAcc = 0
let wheelDisc: EntityRef | null = null
let wheelHit: EntityRef | null = null
let stateEntity: EntityRef | null = null
let lastSeenNonce = 0
let lastSeenDailyNonce = 0
/** Show wheel only. A daily tween must not write this — WheelRoot would jump on the next show spin. */
let showAngle = 0
let anim: SpinAnim | null = null
let crowdTimer = 0
let lastCrowdCount = -1
const DAILY_SLICE_DEG = 360 / PRIZES.length

function showSliceDegrees(): number {
  if (stateEntity && ShowState.has(stateEntity)) {
    const n = ShowState.get(stateEntity).wheelSlices
    if (n > 0) return 360 / n
  }
  return liveSliceDegrees()
}
/** First ShowState contact — adopt dailyNonce without replaying LOOK LEFT / YOU WON. */
let dailySyncedFromNetwork = false
let roundResetIn = 0
let dailyDoneHere = false
let dailyRequestInFlight = false
/**
 * Only the wallet that sent dailySpin may land YOU WON / lock the day locally.
 * Spectators follow the shared tween but must not get YOU WON or dailyDoneHere
 * (14 Oct mobile guest saw room WEARABLE + already claimed).
 */
let claimerOwnsThisDailyLand = false
/** Claimer's last daily result, shown on the HUD until the next spin. */
let lastDailyHud = ''
/** How long the post-spin line stays in the top bar. */
let dailyHudLeft = 0
let lastHeartbeatValue = 0
let lastHeartbeatSeenAt = 0
let snappedFromNetwork = false
let lastRoundPhase = -1
let statusAsked = false
let pendingShowSpin = false
let pendingDailySpin = false
/** Client-side: show letter pad as soon as a show spin lands (before canGuess sync). */
let localNeedsLetter = false
/** True after we have observed server canGuess=true this round — only then clear on close. */
let sawServerCanGuess = false
/** Scene Storage HOST_WALLETS — server confirms via hostStatus. */
let hostOperatorAllowed = false
let hostStatusPending = false
let hostStatusAcked = false
let hostStatusWallet = ''
/** Top HUD toast after host START/END LIVE (scoreboard alone is easy to miss). */
let hostFlashLine = ''
let hostFlashLeft = 0

export function setupGame() {
  wheelRoot = engine.getEntityOrNullByName('WheelRoot')
  spinButton = engine.getEntityOrNullByName('SpinButton')
  wheelDisc = engine.getEntityOrNullByName('WheelDisc')
  wheelHit = engine.getEntityOrNullByName('WheelHit')

  preloadAudio()
  muteWheelClick()
  paintShowWheelFace()
  setupBoard()
  setupShowWall()
  setupDailyWall(() => requestDailySpin())
  setupStage()
  setupShowCam()
  setupBoardCam()
  setupDailyCam()
  setupLeaderboardWall()
  setupLiveJoin(() => stateEntity !== null)
  bindShowClicks()
  // Hub ResultText is dead chrome (audit F8) — hide; scoreboard owns play lines.
  hideNamed('ResultText')
  setShowStats('', 'SPIN TO START', 'BANK  0 $WIP', '')
  setPlayerOne('PLAYER 1', 0, 0, '')
  faceCameraY('SpinLabel')
  faceCameraY('HostLabel')
  faceCameraY('Seat1Label')
  faceCameraY('Seat2Label')
  faceCameraY('Seat3Label')
  // AudienceLabel stays house-facing (AUDIENCE_FACING / Hub) — Y-billboard put SIT text in the wheel FOV.
  bindRoomHandlers()
  logFloorHealth()

  engine.addSystem(findStateSystem)
  engine.addSystem(heartbeatWatchSystem)
  engine.addSystem(syncSpinSystem)
  engine.addSystem(spinSystem)
  engine.addSystem(crowdSystem)
  engine.addSystem(puzzleWatchSystem)
  engine.addSystem(roundResetUiSystem)
  engine.addSystem(pendingActionSystem)
  engine.addSystem(stationHoverSystem)
  engine.addSystem(dailyHudSystem)
  engine.addSystem(hostFlashSystem)
  engine.addSystem(hostStatusSystem)
}

function bindRoomHandlers() {
  room.onMessage('dailyStatusResult', (data) => {
    if (isClaimantDeny(data.error)) {
      dailyDoneHere = false
      showDailyNeedsWallet()
      return
    }
    if (data.claimed) {
      dailyDoneHere = true
      showDailyAlreadyClaimed(data.label || 'ALREADY CLAIMED', playerName(), playerWallet() || undefined)
      return
    }
    // Eligible wallet, not claimed — only now advertise WIN A WEARABLE.
    dailyDoneHere = false
    showDailyEligible()
  })

  room.onMessage('takeLiveSeatResult', (data) => {
    if (!data.ok) {
      if (data.error === 'roster_full') {
        showShowBusy('LIVE ROSTER FULL', 'THREE PLAYERS · WATCH THIS ROUND')
      } else if (data.error === 'not_live') {
        showShowBusy('NOT LIVE YET', 'HOST START LIVE · OR WAIT FOR CLOCK')
      } else if (isClaimantDeny(data.error)) {
        showDailyNeedsWallet()
      }
      return
    }
    showShowBusy(`SEAT ${data.seat + 1}  ·  LIVE`, 'SPIN WHEN IT IS YOUR TURN')
  })

  room.onMessage('hostStatusResult', (data) => {
    hostStatusPending = false
    hostStatusAcked = true
    hostOperatorAllowed = !!data.allowed
  })

  room.onMessage('hostLiveResult', (data) => {
    if (data.ok) {
      if (data.action === 'open') {
        bumpHostFlash('HOST LIVE OPEN  ·  JOIN ON PADS 1–3')
        showShowBusy('HOST LIVE OPEN', 'JOIN ON PADS · SPIN ON PAD 1')
      } else {
        bumpHostFlash('HOST ENDED  ·  PRACTICE SHOW AGAIN')
        showShowBusy('HOST ENDED LIVE', 'PRACTICE AGAIN')
      }
      return
    }
    const err = data.error || ''
    if (err === 'not_host' || err === 'need_wallet' || err === 'guest') return
    if (err === 'already_live') {
      showShowBusy('ALREADY LIVE', 'USE END LIVE OR WAIT')
      return
    }
    if (err === 'not_live') {
      showShowBusy('NOT IN LIVE', 'START LIVE FIRST')
      return
    }
    if (err === 'wheel_busy' || err === 'puzzle_solved' || err === 'busy') {
      showShowBusy('HOST LIVE', 'WAIT FOR WHEEL / PUZZLE TO SETTLE')
      return
    }
  })

  room.onMessage('dailySpinResult', (data) => {
    dailyRequestInFlight = false
    if (!data.ok) {
      if (data.error === 'already_claimed') {
        dailyDoneHere = true
        showDailyAlreadyClaimed(data.label || 'ALREADY CLAIMED', playerName(), playerWallet() || undefined)
        return
      }
      if (isClaimantDeny(data.error)) {
        dailyDoneHere = false
        claimerOwnsThisDailyLand = false
        showDailyNeedsWallet()
        return
      }
      if (data.error === 'storage_failed') {
        // Server may still hold an in-process claim — keep local lock; user can refresh status.
        dailyDoneHere = true
        showDailyAlreadyClaimed(data.message || 'CLAIM SAVED — COME BACK IF UNSURE', playerName())
        return
      }
      if (data.error === 'wheel_busy') {
        // Did not consume the day — allow retry after the shared wheel frees.
        dailyDoneHere = false
        showDailyWait('WHEEL BUSY', 'TRY AGAIN AFTER IT LANDS')
        return
      }
      if (data.error === 'budget_exhausted') {
        dailyDoneHere = true
        showDailyAlreadyClaimed(data.message || 'POOL EMPTY', playerName())
        return
      }
      // Unknown reject — do not sticky-lock; allow retry (14 Oct guest sticky ALREADY CLAIMED).
      dailyDoneHere = false
      claimerOwnsThisDailyLand = false
      showDailyWait('TRY AGAIN', data.message || 'SPIN DID NOT COMPLETE')
      return
    }
    dailyDoneHere = true
    // Claimer: start the shared wheel from the room ACK. Spectators still follow
    // ShowState.dailyNonce. Same nonce dedupes so CRDT arrival does not double-spin.
    kickDailyWheelFromAck(data.dailyNonce, data.wheelIndex, data.label)
  })
}

/** Server eligibility denies from assertDailyClaimant — never treat as day lock. */
function isClaimantDeny(error: string | undefined): boolean {
  if (!error) return false
  return (
    error === 'guest_not_allowed' ||
    error === 'not_wallet' ||
    error === 'identity_missing' ||
    error === 'is_guest' ||
    error === 'no_web3'
  )
}

/** Start daily tween when the claim ACK arrives (does not wait on CRDT). */
function kickDailyWheelFromAck(nonce: number, wheelIndex: number, label: string) {
  if (!nonce || nonce <= lastSeenDailyNonce) return
  // Claimer ACK can beat first ShowState sync — still a live claim, not a late-join replay.
  dailySyncedFromNetwork = true
  lastSeenDailyNonce = nonce
  claimerOwnsThisDailyLand = true
  beginDailyWatch(nonce, playerName())
  startWheelAnim(wheelIndex, playerName(), true, 'daily', label || 'PRIZE')
}

function findStateSystem() {
  if (stateEntity && ShowState.has(stateEntity)) return
  for (const [entity] of engine.getEntitiesWith(ShowState)) {
    stateEntity = entity
    return
  }
}

function serverAlive(): boolean {
  return lastHeartbeatSeenAt > 0 && Date.now() - lastHeartbeatSeenAt < HEARTBEAT_STALE_MS
}

function heartbeatWatchSystem() {
  for (const [_entity, beat] of engine.getEntitiesWith(ServerHeartbeat)) {
    if (beat.serverHeartbeatAt !== lastHeartbeatValue) {
      lastHeartbeatValue = beat.serverHeartbeatAt
      lastHeartbeatSeenAt = Date.now()
    }
  }
  if (!statusAsked && isStateSyncronized() && serverAlive()) {
    statusAsked = true
    refreshDailyEligibility()
  }
}

function pendingActionSystem() {
  if (!isStateSyncronized() || !serverAlive()) return
  if (pendingShowSpin) {
    pendingShowSpin = false
    sendShowSpin()
  }
  if (pendingDailySpin) {
    pendingDailySpin = false
    sendDailySpin()
  }
}

function paintShowWheelFace() {
  paintWheelDiscTexture(WHEEL_TEX_SHOW)
  paintPbr(engine.getEntityOrNullByName('WheelFrame'), RING_TEX, true)
  dressPointer()
}

/** Hub composite may pin albedo + emissive to an old PNG — update both on WheelDisc or slices look stuck. */
function paintWheelDiscTexture(src: string) {
  if (!wheelDisc) wheelDisc = engine.getEntityOrNullByName('WheelDisc')
  if (!wheelDisc) return
  const tex = Material.Texture.Common({ src })
  Material.setPbrMaterial(wheelDisc, {
    texture: tex,
    emissiveTexture: tex,
    albedoColor: Color4.create(1, 1, 1, 1),
    emissiveColor: Color3.create(1, 1, 1),
    emissiveIntensity: 0.55,
    metallic: 0,
    roughness: 1,
    specularIntensity: 0,
    transparencyMode: 1,
    alphaTest: 0.35,
    castShadows: false
  })
}

function paintPbr(entity: EntityRef | null, src: string, alpha: boolean) {
  if (!entity) return
  const texture = Material.Texture.Common({ src })
  Material.setPbrMaterial(entity, {
    texture,
    albedoColor: Color4.create(1, 1, 1, 1),
    emissiveColor: Color3.create(0, 0, 0),
    emissiveIntensity: 0,
    metallic: 0,
    roughness: 1,
    specularIntensity: 0,
    transparencyMode: alpha ? 1 : 0,
    alphaTest: alpha ? 0.35 : 1,
    castShadows: false
  })
}

/** Gold pointer + magenta tip — static materials only (no per-frame cost). */
function dressPointer() {
  const pointer = engine.getEntityOrNullByName('Pointer')
  const cap = engine.getEntityOrNullByName('PointerCap')
  if (pointer) {
    Material.setPbrMaterial(pointer, {
      albedoColor: Color4.create(1, 0.82, 0.28, 1),
      emissiveColor: Color3.create(0, 0, 0),
      emissiveIntensity: 0,
      metallic: 0,
      roughness: 1,
      specularIntensity: 0,
      castShadows: false
    })
  }
  if (cap) {
    Material.setPbrMaterial(cap, {
      albedoColor: Color4.create(1, 0.35, 0.65, 1),
      emissiveColor: Color3.create(0, 0, 0),
      emissiveIntensity: 0,
      metallic: 0,
      roughness: 1,
      specularIntensity: 0,
      castShadows: false
    })
  }
}

function faceCameraY(name: string) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity) return
  Billboard.createOrReplace(entity, { billboardMode: 2 })
}

function preloadAudio() {
  const loader = engine.addEntity()
  AssetLoad.create(loader, {
    assets: [AUDIO.click, AUDIO.spin, AUDIO.win, AUDIO.miss, AUDIO.jackpot, WHEEL_TEX_SHOW, RING_TEX, LOGO_TEX]
  })
}

function muteWheelClick() {
  wipePointer(wheelHit)
  muteCollider('WheelHit')
  muteCollider('WheelFrame')
  muteCollider('Pointer')
  muteCollider('PointerCap')
  muteCollider('WheelDisc')
  muteCollider('WheelHub')
  // WheelHit is parented to WheelRoot (spins with the face). Collider-only in Hub,
  // but shrink it anyway so a stray MeshRenderer can never paint a black diamond.
  hideNamed('WheelHit')
}

function bindShowClicks() {
  // Podium 1 only, and only from beside or behind it. The big wheel is not a button.
  bindUse(
    showHitVolume(),
    spinHover(),
    () => requestShowSpin(),
    SHOW_STAND.reach,
    false,
    10,
    true,
    SHOW_STAND.reach
  )
}

function setHover(_entity: EntityRef | null, hoverText: string) {
  // Only podium 1 shows the prompt.
  setHoverText(showHitVolume(), hoverText)
}

function playerName(): string {
  const player = getPlayer()
  if (!player || player.isGuest) return 'Guest'
  return player.name || 'Builder'
}

function playerWallet(): string | null {
  const player = getPlayer()
  // Guests get ephemeral 0x ids — never treat them as claim wallets (14 Oct mobile).
  if (!player || player.isGuest) return null
  if (PlayerIdentityData.has(engine.PlayerEntity)) {
    const identity = PlayerIdentityData.get(engine.PlayerEntity)
    if (identity.isGuest) return null
  }
  const id = (player.userId || '').toLowerCase()
  if (!isWalletAddress(id)) return null
  return id
}

function syncLivePods(state: ReturnType<typeof ShowState.get>) {
  if (!isLivePhase(state.roundPhase)) {
    setPlayerTwo('OPEN', 0, 'LIVE')
    setPlayerThree('OPEN', 0, 'LIVE')
    return
  }
  const wallets = (state.liveSeats || '').split(',').filter(Boolean)
  const active = state.activeSeat
  const short = (w: string) => (w.length < 10 ? w : `${w.slice(0, 6)}…`)
  for (let i = 0; i < 3; i++) {
    const w = wallets[i]
    const onTurn = i === active
    const name = w ? short(w) : 'OPEN'
    const nfts = onTurn && state.roundNfts > 0 ? 1 : 0
    const prize = onTurn ? state.lastPrize : '—'
    const wip = onTurn ? state.roundWip : 0
    if (i === 0) setPlayerOne(name, wip, nfts, prize)
    else if (i === 1) setPlayerTwo(name, nfts, prize)
    else setPlayerThree(name, nfts, prize)
  }
}

function paintShowBoard(play: string, bank: string) {
  if (!stateEntity || !ShowState.has(stateEntity)) {
    setShowStats('', play, bank, '')
    setPlayerOne('PLAYER 1', 0, 0, '')
    return
  }
  const state = ShowState.get(stateEntity)
  setShowStats(state.guessed, play, bank, state.lastSpins)
  setPlayerOne(state.lastWinner || 'PLAYER 1', state.roundWip, state.roundNfts, state.lastPrize)
}

function sceneIsHidden(): boolean {
  return EngineInfo.getOrNull(engine.RootEntity)?.sceneHidden === true
}

function requestShowSpin() {
  if (anim) {
    showShowBusy('WHEEL IS SPINNING', 'WAIT FOR IT TO LAND')
    return
  }
  if (isDailyWatching()) {
    showShowBusy('DAILY SPIN IN PROGRESS', 'WAIT FOR THE WHEEL')
    return
  }
  // Do NOT gate on landedUntil — that is daily-sign celebration only.
  // After the tween ends the shared wheel is free; gating here left hover saying
  // "Spin the show" while clicks still no-op'd for ~3.8s.
  if (!isStateSyncronized() || !serverAlive()) {
    pendingShowSpin = true
    showShowBusy('SERVER WAKING UP', 'TRY AGAIN IN A MOMENT')
    return
  }
  sendShowSpin()
}

function sendShowSpin() {
  if (!stateEntity || !ShowState.has(stateEntity)) return
  if (anim || isDailyWatching()) {
    showShowBusy(
      isDailyWatching() ? 'DAILY SPIN IN PROGRESS' : 'WHEEL IS SPINNING',
      'WAIT FOR THE WHEEL'
    )
    return
  }
  const state = ShowState.get(stateEntity)
  if (state.dailySpinning) {
    showShowBusy('DAILY SPIN IN PROGRESS', 'WAIT FOR THE WHEEL')
    return
  }
  if (state.spinning) {
    showShowBusy('WHEEL IS SPINNING', 'WAIT FOR IT TO LAND')
    return
  }
  if (state.canGuess) {
    // By design (mutex audit): one letter per show land before the next spin.
    // Not a dead wheel — pad at bottom must get a tap first.
    showShowBusy('LETTER PAD OPEN', 'TAP A LETTER  ·  THEN SPIN')
    setHover(spinButton, 'Call a letter')
    return
  }
  if (isSolved(liveAnswer(), state.guessed)) {
    showShowBusy('PUZZLE SOLVED', 'WAIT FOR NEW ROUND')
    return
  }
  if (isLivePhase(state.roundPhase) && !playerWallet()) {
    showShowBusy('LIVE ROUND', 'CONNECT WALLET TO PLAY')
    return
  }
  const liveGate = liveSpinGate(state)
  if (liveGate) {
    showShowBusy(liveGate.line, liveGate.sub)
    return
  }
  if (spinButton) AudioSource.playSound(spinButton, AUDIO.click)
  if (isLivePhase(state.roundPhase)) {
    room.send('takeLiveSeat', { displayName: playerName() })
  }
  room.send('showSpin', { displayName: playerName() })
}

/**
 * Never silent-fail a show click. Hover is the mobile UI (MASTER).
 * Scoreboard play line is the visible 3D strip — ResultText is hidden (audit F8).
 */
function showShowBusy(line: string, sub: string) {
  setHover(spinButton, 'Wait — wheel busy')
  const bank =
    stateEntity && ShowState.has(stateEntity)
      ? bankLine(ShowState.get(stateEntity).roundWip, ShowState.get(stateEntity).roundNfts, false)
      : 'BANK  0 $WIP'
  paintShowBoard(sub ? `${line}  ·  ${sub}` : line, bank)
  syncStationHovers()
}

function refreshDailyEligibility() {
  const wallet = playerWallet()
  if (!wallet) {
    showDailyNeedsWallet()
    return
  }
  if (!isStateSyncronized() || !serverAlive()) return
  room.send('dailyStatus', {})
}

function requestDailySpin() {
  if (isDailySpinBusy() || dailyRequestInFlight) {
    showDailyWait('STILL SPINNING', 'WAIT FOR THE WHEEL')
    return
  }
  if (anim) {
    showDailyWait('WHEEL BUSY', 'TRY DAILY AFTER IT LANDS')
    return
  }
  if (stateEntity && ShowState.has(stateEntity)) {
    const state = ShowState.get(stateEntity)
    if (state.spinning || state.dailySpinning) {
      showDailyWait('SHOW WHEEL BUSY', 'TRY DAILY AFTER IT LANDS')
      return
    }
  }

  const wallet = playerWallet()
  if (!wallet) {
    // Prefer wallet copy over a sticky ALREADY CLAIMED from a prior spectator/guest bug.
    showDailyNeedsWallet()
    return
  }
  if (dailyDoneHere) {
    showDailyAlreadyClaimed('ALREADY CLAIMED')
    return
  }
  if (!isStateSyncronized() || !serverAlive()) {
    pendingDailySpin = true
    showDailyServerWaking()
    return
  }
  sendDailySpin()
}

function sendDailySpin() {
  if (dailyRequestInFlight || dailyDoneHere) return
  if (!playerWallet()) {
    showDailyNeedsWallet()
    return
  }
  dailyRequestInFlight = true
  // Do NOT set dailyDoneHere until ACK — optimistic lock stuck guests on reject / spectator
  // paths and made "already claimed" stick after a fake YOU WON (14 Oct mobile).
  showDailyLookingAtWheel()
  room.send('dailySpin', { displayName: playerName() })
}

function applySpin(nonce: number, prizeIndex: number, winner: string, playStartSound: boolean) {
  if (nonce <= lastSeenNonce) return
  // Shared WheelRoot — never let a show CRDT clobber an in-flight daily tween.
  // Overwriting mode to 'show' made gold-pad lands call finishSpin → $WIP / letter pad.
  if (anim?.mode === 'daily' || isDailyWatching()) {
    lastSeenNonce = nonce
    return
  }
  lastSeenNonce = nonce
  startWheelAnim(prizeIndex, winner, playStartSound, 'show', '')
}

function startWheelAnim(
  prizeIndex: number,
  winner: string,
  playStartSound: boolean,
  mode: 'show' | 'daily',
  dailyLabel: string
) {
  // Show must never clobber an in-flight daily. Daily claim may replace a show tween.
  if (anim && anim.mode !== mode && mode === 'show') return

  // Daily disc starts at 0 in show-degree space and remaps onto its own face.
  // Show continues from the angle actually on WheelRoot.
  const from = mode === 'daily' ? 0 : showAngle
  const currentMod = ((from % 360) + 360) % 360
  const targetMod = (prizeIndex + 0.5) * (mode === 'daily' ? DAILY_SLICE_DEG : showSliceDegrees())
  let delta = targetMod - currentMod
  if (delta < 0) delta += 360

  const duration = mode === 'daily' ? DAILY_SPIN_SECONDS : SHOW_SPIN_SECONDS
  const turns = mode === 'daily' ? MIN_TURNS + DAILY_EXTRA_TURNS : MIN_TURNS
  // Daily owns the cabinet disc and its own camera. Show owns WheelRoot and SHOW_CAM.
  if (mode === 'daily') {
    cancelShowCamBeat()
    beginDailyCam()
  } else {
    cancelDailyCam()
    endBoardCam()
  }
  anim = {
    elapsed: 0,
    duration,
    startAngle: from,
    endAngle: from + turns * 360 + delta,
    prizeIndex,
    winner,
    mode,
    dailyLabel
  }
  setHover(spinButton, 'Wheel is spinning')
  // Daily feedback owns the gold-column sign (beginDailyWatch). Do not overwrite the
  // show scoreboard with LOOK AT THE WHEEL — that made two stations scream at once (F9).
  if (mode === 'show') {
    const who = (winner || 'Guest').toUpperCase()
    const headline = `${who.length > 16 ? `${who.slice(0, 15)}…` : who}  ON THE WHEEL`
    const bank =
      stateEntity && ShowState.has(stateEntity)
        ? bankLine(ShowState.get(stateEntity).roundWip, ShowState.get(stateEntity).roundNfts, false)
        : 'BANK  0 $WIP'
    paintShowBoard(headline, bank)
    // Spectator beat — show only; InputModifier freeze while the wheel slows.
    beginShowCamBeat()
  }
  if (playStartSound && wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.spin)
  if (playStartSound && spinButton) AudioSource.playSound(spinButton, AUDIO.click)
}

function snapToPrize(prizeIndex: number) {
  showAngle = (prizeIndex + 0.5) * showSliceDegrees()
  setWheelAngle(showAngle, 'show', prizeIndex)
}

function easeOutCubic(t: number): number {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t
  return 1 - Math.pow(1 - clamped, 3)
}

/**
 * Daily cabinet disc (separate mesh). Remaps show-style degrees using legacy 8-slice
 * daily catalog indices — not the 4-slice show wheel face on WheelRoot.
 */
function dailyDiscDegrees(showDegrees: number, prizeIndex: number): number {
  const showLand = (prizeIndex + 0.5) * DAILY_SLICE_DEG
  const dailyLand = prizeIndex === 5 ? 0 : 180
  return showDegrees - showLand + dailyLand
}

function setWheelAngle(degrees: number, mode?: 'show' | 'daily', prizeIndex?: number) {
  if (mode === 'daily') {
    spinDailyWheel(dailyDiscDegrees(degrees, prizeIndex ?? 7))
    return
  }
  if (!wheelRoot || !Transform.has(wheelRoot)) return
  Transform.getMutable(wheelRoot).rotation = facingSpinZ(degrees)
}

/** No-op — ResultText is hidden (F8). Call sites kept so scoreboard/HUD stay the real UX. */
function setResultText(_value: string) {}

function celebrate(prizeId: string) {
  if (sceneIsHidden()) return
  if (prizeId === 'try-again' || prizeId === 'lose-turn' || prizeId === 'bankrupt') {
    if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.miss)
    return
  }
  if (prizeId === 'wearable') {
    if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.win)
    void triggerEmote({ predefinedEmote: 'clap' })
    return
  }
  if (wheelRoot) AudioSource.playSound(wheelRoot, AUDIO.win)
  void triggerEmote({ predefinedEmote: 'clap' })
}

/** Local UI only — ShowState is owned by the Multiplayer Server. */
function finishSpin(prizeIndex: number, winner: string) {
  endShowCamBeat()
  const state = stateEntity && ShowState.has(stateEntity) ? ShowState.get(stateEntity) : null
  const lp = livePrizeByIndex(prizeIndex)
  const bank =
    state ? bankLine(state.roundWip, state.roundNfts, false) : 'BANK  0 $WIP'
  const who = winner.toUpperCase()

  if (lp.id === 'lose-turn' || lp.id === 'bankrupt') {
    localNeedsLetter = false
    sawServerCanGuess = false
    setResultText(`${who}  ·  ${lp.label}`)
    paintShowBoard(`${who}  ·  ${lp.label}`, bank)
    setHover(spinButton, spinHover())
    celebrate(lp.id)
    return
  }

  localNeedsLetter = true
  setResultText(`${who}  ·  ${lp.label}  ·  CALL A LETTER`)
  paintShowBoard(`${who}  ·  CALL A LETTER`, bank)
  setHover(spinButton, 'Call a letter')
  celebrate(lp.id)
}

export function guessLetter(raw: string) {
  if (!stateEntity || anim || !ShowState.has(stateEntity)) return
  const letter = normalizeLetter(raw)
  if (!letter) return
  const state = ShowState.get(stateEntity)
  const liveBlock = liveLetterGate(state)
  if (liveBlock) {
    showShowBusy(liveBlock.line, liveBlock.sub)
    return
  }
  // Allow tap while localNeedsLetter is up; server still enforces canGuess.
  if ((!state.canGuess && !localNeedsLetter) || alreadyGuessed(state.guessed, letter)) return
  if (!isStateSyncronized() || !serverAlive()) return
  room.send('guessLetter', { letter })
  localNeedsLetter = false
}

export function solvePuzzle(phrase: string) {
  if (!stateEntity || anim || !ShowState.has(stateEntity)) return
  const state = ShowState.get(stateEntity)
  const liveBlock = liveSolveGate(state)
  if (liveBlock) {
    showShowBusy(liveBlock.line, liveBlock.sub)
    return
  }
  if (!state.canGuess && !localNeedsLetter) return
  if (isSolved(liveAnswer(), state.guessed)) return
  if (!isStateSyncronized() || !serverAlive()) return
  room.send('solvePuzzle', { phrase, displayName: playerName() })
  localNeedsLetter = false
}

function puzzleWatchSystem() {
  if (!stateEntity || !ShowState.has(stateEntity)) return
  const state = ShowState.get(stateEntity)
  if (state.roundPhase !== lastRoundPhase) {
    lastRoundPhase = state.roundPhase
  }
  if (state.canGuess) {
    localNeedsLetter = true
    sawServerCanGuess = true
    if (!anim) beginBoardCam()
  } else {
    endBoardCam()
    if (sawServerCanGuess) {
      // Server closed the window (guess landed / round reset) — drop the pad.
      localNeedsLetter = false
      sawServerCanGuess = false
    }
  }
  syncLivePods(state)
  showPuzzle(puzzleAt(state.puzzleIndex))
  refreshBoard(state.guessed)
  setBankSign(state.roundWip, state.roundNfts, isSolved(liveAnswer(), state.guessed))
  syncShowBoard(state.guessed, state.lastSpins)
  if (!isLivePhase(state.roundPhase)) {
    setPlayerOne(state.lastWinner || 'PLAYER 1', state.roundWip, state.roundNfts, state.lastPrize)
  }

  if (isSolved(liveAnswer(), state.guessed) && roundResetIn <= 0 && !isLivePhase(state.roundPhase)) {
    localNeedsLetter = false
    sawServerCanGuess = false
    setResultText(state.weekSolves > 0 ? `SOLVED  ·  ${state.weekSolves} THIS WEEK` : 'SOLVED')
    roundResetIn = 6
  }
}

function roundResetUiSystem(dt: number) {
  if (roundResetIn <= 0) return
  roundResetIn -= dt
  if (roundResetIn > 0) return
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

  // Late join: mirror show snap — do not full-replay the last daily as a new win.
  if (!dailySyncedFromNetwork && isStateSyncronized()) {
    dailySyncedFromNetwork = true
    lastSeenDailyNonce = state.dailyNonce
    if (state.dailySpinning && state.dailyNonce > 0) {
      beginDailyWatch(state.dailyNonce, state.dailyWinner || 'Guest')
      startWheelAnim(state.dailyIndex, state.dailyWinner || 'Guest', true, 'daily', state.dailyPrize)
    } else if (state.dailyNonce > 0) {
      spinDailyWheel(dailyDiscDegrees((state.dailyIndex + 0.5) * DAILY_SLICE_DEG, state.dailyIndex))
      showDailyRoomLast(state.dailyWinner || '', state.dailyPrize || '')
    }
  } else if (state.dailyNonce > lastSeenDailyNonce) {
    lastSeenDailyNonce = state.dailyNonce
    // ACK can drop while ShowState still advances — only the sender owns the land/lock.
    if (dailyRequestInFlight) {
      dailyRequestInFlight = false
      dailyDoneHere = true
      claimerOwnsThisDailyLand = true
    }
    beginDailyWatch(state.dailyNonce, state.dailyWinner || 'Guest')
    startWheelAnim(state.dailyIndex, state.dailyWinner || 'Guest', true, 'daily', state.dailyPrize)
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
      paintShowBoard(
        lastSpinLine(state.lastSpins, `${(state.lastWinner || 'Guest').toUpperCase()}  ·  ${state.lastPrize}`),
        bankLine(state.roundWip, state.roundNfts, false)
      )
    }
  }
}

function spinSystem(dt: number) {
  if (!anim) return
  anim.elapsed += dt
  const t = easeOutCubic(anim.elapsed / anim.duration)
  const angle = anim.startAngle + (anim.endAngle - anim.startAngle) * t
  if (anim.mode !== 'daily') showAngle = angle
  setWheelAngle(angle, anim.mode, anim.prizeIndex)

  if (anim.elapsed >= anim.duration) {
    const landed = normalizeSpinDegrees(anim.endAngle)
    if (anim.mode !== 'daily') showAngle = landed
    setWheelAngle(landed, anim.mode, anim.prizeIndex)
    const done = anim
    anim = null
    if (done.mode === 'daily') {
      finishDailyWheel(done.winner, done.dailyLabel)
    } else {
      finishSpin(done.prizeIndex, done.winner)
    }
  }
}

function finishDailyWheel(winner: string, label: string) {
  endDailyCam()
  // Do not clear letter debt — a prior show spin may still owe a letter (canGuess).
  // Clearing sawServerCanGuess / localNeedsLetter here hid the pad and left show blocked.
  paintShowWheelFace()
  // Daily catalog only (WEARABLE / TRY AGAIN). Show $WIP copy must never land on the gold sign.
  let safe = (label || '').trim() || 'PRIZE'
  if (/\$WIP/i.test(safe)) {
    console.error('[WIP] daily land had show-style label — refusing $WIP copy:', safe)
    safe = 'TRY AGAIN'
  }
  const mine = claimerOwnsThisDailyLand
  claimerOwnsThisDailyLand = false
  if (mine) {
    landDailyPrize(winner, safe)
    dailyDoneHere = true
    lastDailyHud = /TRY AGAIN/i.test(safe)
      ? 'NO PRIZE · COME BACK TOMORROW'
      : 'YOU WON A WEARABLE · CHECK YOUR WALLET'
    dailyHudLeft = 6
  } else {
    // Spectator / guest watching the room reel — not their claim.
    showDailyRoomLast(winner, safe)
  }
  restoreShowHover()
}

/** After any local tween ends, put pad/wheel hover back to the real next action. */
function dailyHudSystem(dt: number) {
  if (dailyHudLeft <= 0) return
  dailyHudLeft -= dt
  if (dailyHudLeft > 0) return
  lastDailyHud = ''
}

function bumpHostFlash(line: string, seconds = 12) {
  hostFlashLine = line
  hostFlashLeft = seconds
}

function hostFlashSystem(dt: number) {
  if (hostFlashLeft <= 0) return
  hostFlashLeft -= dt
  if (hostFlashLeft > 0) return
  hostFlashLine = ''
}

/** Magenta strip under the round clock — host open/end ack only. */
export function hostFlashBanner(): string | null {
  return hostFlashLeft > 0 ? hostFlashLine : null
}

function restoreShowHover() {
  syncStationHovers()
}

/**
 * Station-clarity D3/D1: opposite station shows Wait while this one owns the wheel.
 * Mutate hover only — never re-bindUse.
 */
function stationHoverSystem(dt: number) {
  hoverSyncAcc += dt
  if (hoverSyncAcc < 0.2) return
  hoverSyncAcc = 0
  syncStationHovers()
}

function syncStationHovers() {
  const state = stateEntity && ShowState.has(stateEntity) ? ShowState.get(stateEntity) : null
  const dailyOwns =
    (anim && anim.mode === 'daily') || isDailyWatching() || !!(state && state.dailySpinning)
  const showSpinning = (anim && anim.mode === 'show') || !!(state && state.spinning)
  const letterOwed = localNeedsLetter || !!(state && state.canGuess)

  if (dailyOwns) {
    setHover(spinButton, 'Wait — daily spinning')
  } else if (letterOwed) {
    setHover(spinButton, 'Call a letter')
  } else if (showSpinning || anim) {
    setHover(spinButton, 'Wheel is spinning')
  } else {
    setHover(spinButton, spinHover())
  }

  // The close-up looks straight at this prompt. Keep the click, hide the chip.
  const showDailyChip = !isDailyCamOn()
  if (showSpinning || letterOwed) {
    setDailyHover('Wait — show in progress', showDailyChip)
  } else if (dailyOwns) {
    setDailyHover('Watch the wheel', showDailyChip)
  } else if (dailyDoneHere) {
    setDailyHover('Come back tomorrow', showDailyChip)
  } else {
    setDailyHover('Spin the daily', showDailyChip)
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
  /** True while someone owns the shared wheel — louder strip (Meetup ghosts). */
  onWheel: boolean
}

function stripName(raw: string): string {
  const n = (raw || 'Guest').trim().toUpperCase()
  return n.length > 14 ? `${n.slice(0, 13)}…` : n
}

/** Digits for the next live-round slot. Null until the server has published one. */
export function roundClockHeading(): string {
  if (!stateEntity || !ShowState.has(stateEntity)) return 'NEXT LIVE ROUND'
  const state = ShowState.get(stateEntity)
  if (isLivePhase(state.roundPhase)) {
    return state.hostLiveActive ? 'HOST LIVE ROUND' : 'LIVE ROUND'
  }
  return 'NEXT LIVE ROUND'
}

export function roundClockText(now = Date.now()): string | null {
  if (!stateEntity || !ShowState.has(stateEntity)) return null
  const state = ShowState.get(stateEntity)
  if (isLivePhase(state.roundPhase)) {
    const endRaw = state.liveEndsAt
    const end = typeof endRaw === 'bigint' ? Number(endRaw) : endRaw
    if (end > now) return formatRoundLeft(end - now)
    return 'OPEN'
  }
  const raw = state.nextRoundAt
  const at = typeof raw === 'bigint' ? Number(raw) : raw
  if (!at || at <= 0) return null
  return formatRoundLeft(at - now)
}

export type HostControls = {
  panel: boolean
  canOpen: boolean
  canEnd: boolean
}

export function hostControls(): HostControls {
  if (!hostOperatorAllowed) return { panel: false, canOpen: false, canEnd: false }
  const state = stateEntity && ShowState.has(stateEntity) ? ShowState.get(stateEntity) : null
  const live = state ? isLivePhase(state.roundPhase) : false
  const wheelBusy =
    !!anim ||
    !!(state && (state.spinning || state.dailySpinning || state.canGuess)) ||
    !!(state && isSolved(liveAnswer(), state.guessed) && !live)
  return {
    panel: true,
    canOpen: !live && !wheelBusy && !!state && state.roundPhase === RoundPhase.PRACTICE,
    canEnd: live
  }
}

export function sendHostOpenLive() {
  if (!hostOperatorAllowed || !serverAlive() || !isStateSyncronized()) return
  room.send('hostOpenLive', {})
}

export function sendHostEndLive() {
  if (!hostOperatorAllowed || !serverAlive() || !isStateSyncronized()) return
  room.send('hostEndLive', {})
}

function requestHostStatus() {
  const wallet = playerWallet()
  if (!wallet || !serverAlive() || !isStateSyncronized() || hostStatusPending) return
  hostStatusPending = true
  room.send('hostStatus', {})
}

function hostStatusSystem() {
  const wallet = playerWallet() || ''
  if (!wallet) {
    hostStatusWallet = ''
    hostOperatorAllowed = false
    hostStatusAcked = false
    hostStatusPending = false
    return
  }
  if (wallet !== hostStatusWallet) {
    hostStatusWallet = wallet
    hostOperatorAllowed = false
    hostStatusPending = false
    hostStatusAcked = false
  }
  if (!serverAlive() || !isStateSyncronized()) return
  if (!hostStatusAcked && !hostStatusPending) requestHostStatus()
}

/** Shown when HOST_WALLETS is empty — Preview and World use the same Scene Storage. */
export function hostOperatorHint(): string | null {
  if (!playerWallet() || !hostStatusAcked || hostOperatorAllowed) return null
  if (!stateEntity || !ShowState.has(stateEntity)) return null
  if (ShowState.get(stateEntity).hostWalletsCount > 0) return null
  return 'HOST: add HOST_WALLETS in Scene Storage · then reconnect'
}

export function hudCopy(): HudCopy {
  const clock = clockParts()
  if (!serverAlive() && isStateSyncronized()) {
    return { live: clock.live, status: 'CONNECTING TO SHOW SERVER…', onWheel: false }
  }
  const state = stateEntity && ShowState.has(stateEntity) ? ShowState.get(stateEntity) : null
  // Soft “who’s on the wheel” — names from ShowState / local anim only (no turn locks).
  if (anim) {
    const who = stripName(anim.winner)
    return {
      live: clock.live,
      onWheel: true,
      status:
        anim.mode === 'daily'
          ? `${who}  ON THE WHEEL  ·  DAILY`
          : `${who}  ON THE WHEEL  ·  SHOW`
    }
  }
  if (state && state.dailySpinning) {
    return {
      live: clock.live,
      onWheel: true,
      status: `${stripName(state.dailyWinner)}  ON THE WHEEL  ·  DAILY`
    }
  }
  if (state && state.spinning) {
    return {
      live: clock.live,
      onWheel: true,
      status: `${stripName(state.lastWinner)}  ON THE WHEEL  ·  SHOW`
    }
  }
  if (state && state.lastPrize.includes('MISSED SOLVE') && !state.canGuess && !state.spinning && !state.dailySpinning) {
    const out = state.lastPrize.includes('OUT')
    return {
      live: clock.live,
      onWheel: false,
      status: out
        ? `${stripName(state.lastWinner)} MISSED · OUT THIS ROUND`
        : `${stripName(state.lastWinner)} MISSED THE SOLVE  ·  SPIN AGAIN`
    }
  }
  if (state && isSolved(liveAnswer(), state.guessed) && roundResetIn > 0) {
    return {
      live: clock.live,
      onWheel: false,
      status:
        state.weekSolves > 0
          ? `SOLVED  ·  ${stripName(state.lastWinner)}  ·  ${state.weekSolves} THIS WEEK`
          : `SOLVED  ·  ${stripName(state.lastWinner)}`
    }
  }
  if (dailyDoneHere && lastDailyHud) {
    return { live: clock.live, onWheel: false, status: lastDailyHud }
  }
  if (state && state.canGuess) {
    const prize = state.lastPrize ? `  ·  ${state.lastPrize}` : ''
    if (isLivePhase(state.roundPhase)) {
      return { live: clock.live, onWheel: false, status: `LIVE  ·  LETTER OPEN${prize}` }
    }
    return { live: clock.live, onWheel: false, status: `LETTER IN PLAY  ·  OPEN${prize}` }
  }
  if (state && isLivePhase(state.roundPhase)) {
    const wallet = playerWallet()
    if (wallet && rosterWallets(state.liveLocked).includes(wallet)) {
      return { live: clock.live, onWheel: false, status: 'OUT THIS ROUND  ·  SOLVE LOCKED' }
    }
    const seats = rosterWallets(state.liveSeats)
    if (!wallet) {
      return { live: clock.live, onWheel: false, status: 'LIVE ROUND  ·  CONNECT WALLET TO JOIN' }
    }
    if (!seats.includes(wallet)) {
      return {
        live: clock.live,
        onWheel: false,
        status: seats.length >= 3 ? 'LIVE  ·  ROSTER FULL  ·  WATCH' : 'LIVE  ·  JOIN ON PAD 1–3'
      }
    }
    if (state.activeSeat >= 0 && seats[state.activeSeat] !== wallet) {
      return { live: clock.live, onWheel: false, status: 'LIVE  ·  WAIT FOR YOUR TURN' }
    }
    return { live: clock.live, onWheel: false, status: 'LIVE  ·  YOUR SPIN' }
  }
  // SHOW_OPEN_ALWAYS = practice show any day; title card still owns THURSDAYS (proof 3 / F5).
  if (isShowPlayable()) {
    const base = 'GOLD = DAILY · PAD 1 = SHOW'
    if (!dailyDoneHere) {
      return { live: clock.live, onWheel: false, status: base }
    }
    return { live: clock.live, onWheel: false, status: `${base} · DAILY DONE` }
  }
  if (!dailyDoneHere) {
    return { live: false, onWheel: false, status: 'SPIN THE DAILY WHEEL  ·  ONE A DAY' }
  }
  const until = clock.days > 0 ? `${clock.days}D ${clock.hours}H` : `${clock.hours}H ${clock.minutes}M`
  return { live: false, onWheel: false, status: `COME BACK TOMORROW  ·  THU SHOW  ·  ${until}` }
}

function spinHover(): string {
  if (!stateEntity || !ShowState.has(stateEntity)) return 'Spin the show'
  const state = ShowState.get(stateEntity)
  if (!isLivePhase(state.roundPhase)) return 'Spin the show'
  const wallet = playerWallet()
  if (!wallet) return 'Connect wallet for live'
  const seats = rosterWallets(state.liveSeats)
  if (seats.length >= 3 && !seats.includes(wallet)) return 'Live roster full — watch'
  if (!seats.includes(wallet)) return 'Join live — spin or use Join on a pad'
  if (state.activeSeat >= 0 && seats[state.activeSeat] !== wallet) return 'Wait for your turn'
  return 'Spin the live wheel'
}

function rosterWallets(csv: string): string[] {
  return (csv || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** Client-side live spin gates — server still authoritative. */
function liveSpinGate(state: ReturnType<typeof ShowState.get>): { line: string; sub: string } | null {
  if (!isLivePhase(state.roundPhase)) return null
  const wallet = playerWallet()
  if (!wallet) return { line: 'LIVE ROUND', sub: 'CONNECT WALLET TO PLAY' }
  const seats = rosterWallets(state.liveSeats)
  if (seats.length >= 3 && !seats.includes(wallet)) {
    return { line: 'LIVE ROSTER FULL', sub: 'WATCH THIS ROUND' }
  }
  if (seats.includes(wallet) && state.activeSeat >= 0 && seats[state.activeSeat] !== wallet) {
    return { line: 'NOT YOUR TURN', sub: 'WAIT FOR ACTIVE SEAT' }
  }
  return null
}

function liveLetterGate(state: ReturnType<typeof ShowState.get>): { line: string; sub: string } | null {
  if (!isLivePhase(state.roundPhase)) return null
  const wallet = playerWallet()
  if (!wallet) return { line: 'LIVE ROUND', sub: 'CONNECT WALLET TO PLAY' }
  const seats = rosterWallets(state.liveSeats)
  if (!seats.includes(wallet)) return { line: 'LIVE ROUND', sub: 'JOIN ON A PAD TO PLAY' }
  if (state.activeSeat >= 0 && seats[state.activeSeat] !== wallet) {
    return { line: 'NOT YOUR TURN', sub: 'ONLY ACTIVE SEAT CALLS LETTERS' }
  }
  return null
}

function liveSolveGate(state: ReturnType<typeof ShowState.get>): { line: string; sub: string } | null {
  if (!isLivePhase(state.roundPhase)) return null
  const wallet = playerWallet()
  if (!wallet) return { line: 'LIVE ROUND', sub: 'CONNECT WALLET TO SOLVE' }
  const seats = rosterWallets(state.liveSeats)
  if (!seats.includes(wallet)) return { line: 'LIVE ROUND', sub: 'JOIN ON A PAD TO SOLVE' }
  if (rosterWallets(state.liveLocked).includes(wallet)) {
    return { line: 'OUT THIS ROUND', sub: 'WRONG SOLVE — WAIT FOR NEXT LIVE' }
  }
  return null
}

function liveAnswer(): string {
  if (stateEntity && ShowState.has(stateEntity)) {
    return puzzleAt(ShowState.get(stateEntity).puzzleIndex).answer
  }
  return puzzleAt(0).answer
}

function bankLine(wip: number, nfts: number, solved: boolean) {
  const nftBit = nfts > 0 ? `  ·  ${nfts} NFT` : ''
  return solved ? `BANKED  ${wip} $WIP${nftBit}` : `BANK  ${wip} $WIP${nftBit}`
}

export function puzzleHud(): { canGuess: boolean; guessed: string; solved: boolean; bank: string; lastPrize: string } {
  if (!stateEntity || !ShowState.has(stateEntity)) {
    return {
      // Do not gate on !anim — server canGuess often arrives while the local tween
      // is still finishing; hiding the pad then was the "prompts but no keys" bug.
      canGuess: localNeedsLetter,
      guessed: '',
      solved: false,
      bank: bankLine(0, 0, false),
      lastPrize: ''
    }
  }
  const state = ShowState.get(stateEntity)
  const solved = isSolved(liveAnswer(), state.guessed)
  return {
    canGuess: state.canGuess || localNeedsLetter,
    guessed: state.guessed,
    solved,
    bank: bankLine(state.roundWip, state.roundNfts, solved && roundResetIn > 0),
    lastPrize: state.lastPrize
  }
}
