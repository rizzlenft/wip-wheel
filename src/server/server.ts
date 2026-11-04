import { engine, PlayerIdentityData } from '@dcl/sdk/ecs'
import { EnvVar } from '@dcl/sdk/server'
import { syncEntity } from '@dcl/sdk/network'
import { AUTH_SERVER_PEER_ID } from '@dcl/sdk/network/message-bus-sync'
import {
  alreadyGuessed,
  isSolved,
  normalizePhrase,
  phrasesMatch,
  puzzleAt,
  revealAll,
  normalizeLetter
} from '../puzzle'
import { loadPracticeScores, notePracticeSolve, practiceScoreSnapshot, seatedName } from './practiceScore'
import { clampRoundMs, DEFAULT_ROUND_MS, nextRoundBoundary } from '../week'
import { pickLivePrizeIndex, livePrizeByIndex, showWheelOpensLetterPad } from '../livePrizes'
import { RoundPhase, isLivePhase } from '../livePhase'
import { isWalletAddress } from '../shared/dailyCatalog'
import { pushLastSpin } from '../history'
import { room } from '../shared/messages'
import { ServerHeartbeat, SyncIds } from '../shared/schemas'
import { DAILY_SPIN_SECONDS, SHOW_SPIN_SECONDS } from '../shared/spinTiming'
import { ShowState } from '../state'
import { assertDailyClaimant } from './claimant'
import { getPlayerDailyClaim, performDailySpin } from './dailyClaims'
import { fulfillRetryTick, logFulfillConfig, requestWearableFulfillment } from './fulfill'
import { fulfillLiveWearable } from './liveClaims'
import {
  activeSeatIndex,
  applyLiveLand,
  assertActivePlayer,
  clearLiveRound,
  handleLiveWrongSolve,
  isOnRoster,
  isSolveLocked,
  liveDeadline,
  mayAttemptSolve,
  resetLiveRound,
  clearWearablePending,
  lockedCsv,
  rosterSize,
  seatsCsv,
  solverWearablePending,
  syncActiveBankToShow,
  tryJoinRoster
} from './liveRound'
import { initPracticeLeaderboard, publishPracticeBoard } from './practiceLeaderboard'
import { isHostWallet, loadHostWallets, logHostConfig } from './hostLive'

const HEARTBEAT_MS = 2000

let stateEntity = engine.addEntity()
let heartbeatEntity = engine.addEntity()
let showSpinEndsAt = 0
let dailySpinEndsAt = 0
let roundResetEndsAt = 0
let heartbeatAcc = 0
/**
 * In-process lock for the shared WheelRoot across `await` in dailySpin.
 * ShowState.dailySpinning is only set AFTER Storage returns — without this,
 * showSpin can start mid-claim (message handlers interleave on await).
 */
let wheelReserve: '' | 'daily' | 'show' = ''
let roundEveryMs = DEFAULT_ROUND_MS
let liveRoundMaxSec = 900

export async function initServer() {
  console.log('[SERVER] WIP Wheel Multiplayer Server starting')
  void logFulfillConfig()
  await loadPracticeScores()
  await loadRoundEvery()
  await loadLiveRoundMax()
  await logHostConfig()
  initPracticeLeaderboard()
  publishPracticeBoard(practiceScoreSnapshot())

  // Validators must register after role is known — module-load `isServer()` races false.
  ShowState.validateBeforeChange((value) => value.senderAddress === AUTH_SERVER_PEER_ID)
  ServerHeartbeat.validateBeforeChange((value) => value.senderAddress === AUTH_SERVER_PEER_ID)

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
    dailySpinning: false,
    puzzleIndex: 0,
    weekSolves: 0,
    nextRoundAt: nextRoundBoundary(Date.now(), roundEveryMs),
    roundPhase: RoundPhase.PRACTICE,
    liveSeats: '',
    activeSeat: -1,
    wheelSlices: 4,
    liveEndsAt: 0,
    liveLocked: '',
    hostLiveActive: false,
    hostWalletsCount: 0
  })
  await syncHostWalletsCount()
  syncEntity(stateEntity, [ShowState.componentId], SyncIds.ShowState)

  ServerHeartbeat.create(heartbeatEntity, { serverHeartbeatAt: Date.now() })
  syncEntity(heartbeatEntity, [ServerHeartbeat.componentId], SyncIds.ServerHeartbeat)

  room.onMessage('dailyStatus', async (_data, context) => {
    if (!context) return
    const gate = await assertDailyClaimant(context.from)
    if (!gate.ok) {
      room.send(
        'dailyStatusResult',
        {
          claimed: false,
          label: '',
          prizeId: '',
          wheelIndex: 0,
          claimId: '',
          error: gate.reason
        },
        { to: [context.from] }
      )
      return
    }
    const wallet = gate.wallet
    const claim = await getPlayerDailyClaim(wallet)
    room.send(
      'dailyStatusResult',
      {
        claimed: Boolean(claim),
        label: claim?.label || '',
        prizeId: claim?.prizeId || '',
        wheelIndex: claim?.wheelIndex || 0,
        claimId: claim?.claimId || '',
        error: ''
      },
      { to: [context.from] }
    )
  })

  room.onMessage('dailySpin', async (data, context) => {
    if (!context) return
    const busy = ShowState.has(stateEntity) ? ShowState.get(stateEntity) : null
    if (wheelReserve || (busy && (busy.spinning || busy.dailySpinning))) {
      room.send(
        'dailySpinResult',
        {
          ok: false,
          claimId: '',
          prizeId: '',
          label: '',
          prizeType: '',
          wheelIndex: 0,
          dailyNonce: 0,
          status: '',
          error: 'wheel_busy',
          message: 'Wheel is busy — try again after it lands.'
        },
        { to: [context.from] }
      )
      return
    }
    const gate = await assertDailyClaimant(context.from)
    if (!gate.ok) {
      console.log(`[SERVER] dailySpin rejected ${context.from}: ${gate.reason}`)
      room.send(
        'dailySpinResult',
        {
          ok: false,
          claimId: '',
          prizeId: '',
          label: '',
          prizeType: '',
          wheelIndex: 0,
          dailyNonce: 0,
          status: '',
          error: gate.reason,
          message: gate.message
        },
        { to: [context.from] }
      )
      return
    }

    const wallet = gate.wallet
    // Reserve before Storage await so showSpin cannot interleave.
    wheelReserve = 'daily'
    const result = await performDailySpin(wallet, data.displayName || 'Player')
    if (!result.ok) {
      wheelReserve = ''
      room.send(
        'dailySpinResult',
        {
          ok: false,
          claimId: result.claim?.claimId || '',
          prizeId: result.claim?.prizeId || '',
          label: result.claim?.label || '',
          prizeType: result.claim?.prizeType || '',
          wheelIndex: result.claim?.wheelIndex || 0,
          dailyNonce: 0,
          status: result.claim?.status || '',
          error: result.error,
          message: result.message
        },
        { to: [context.from] }
      )
      return
    }

    const claim = result.claim
    const state = ShowState.getMutable(stateEntity)
    state.dailyIndex = claim.wheelIndex
    state.dailyNonce += 1
    state.dailyWinner = claim.displayName
    state.dailyPrize = claim.label
    state.dailySpinning = true
    dailySpinEndsAt = Date.now() + DAILY_SPIN_SECONDS * 1000
    const dailyNonce = state.dailyNonce

    // Autopilot: do not block the spin animation on Polygon.
    if (claim.status === 'pending_fulfillment' && claim.prizeType === 'wearable') {
      void requestWearableFulfillment(claim)
    }

    room.send(
      'dailySpinResult',
      {
        ok: true,
        claimId: claim.claimId,
        prizeId: claim.prizeId,
        label: claim.label,
        prizeType: claim.prizeType,
        wheelIndex: claim.wheelIndex,
        dailyNonce,
        status: claim.status,
        error: '',
        message: ''
      },
      { to: [context.from] }
    )
  })

  room.onMessage('takeLiveSeat', async (data, context) => {
    if (!context) return
    const state = ShowState.get(stateEntity)
    if (!isLivePhase(state.roundPhase)) {
      room.send('takeLiveSeatResult', { ok: false, seat: -1, error: 'not_live' }, { to: [context.from] })
      return
    }
    const gate = await assertDailyClaimant(context.from)
    if (!gate.ok) {
      room.send('takeLiveSeatResult', { ok: false, seat: -1, error: gate.reason }, { to: [context.from] })
      return
    }
    const joined = tryJoinRoster(gate.wallet)
    if (!joined.ok) {
      room.send('takeLiveSeatResult', { ok: false, seat: -1, error: joined.reason }, { to: [context.from] })
      return
    }
    const mutable = ShowState.getMutable(stateEntity)
    pushLiveFields(mutable)
    room.send('takeLiveSeatResult', { ok: true, seat: joined.seat, error: '' }, { to: [context.from] })
    console.log(`[SERVER] takeLiveSeat ${gate.wallet} seat ${joined.seat}`)
  })

  room.onMessage('showSpin', (data, context) => {
    if (!context) return
    const state = ShowState.getMutable(stateEntity)
    if (wheelReserve || state.spinning || state.dailySpinning || state.canGuess) return
    if (isSolved(puzzleAt(state.puzzleIndex).answer, state.guessed)) return

    const wallet = (context.from || '').toLowerCase()
    const live = isLivePhase(state.roundPhase)

    if (live) {
      if (!isWalletEligibleSync(wallet)) {
        console.log(`[SERVER] live spin rejected ${wallet || 'empty'}`)
        return
      }
      if (!isOnRoster(wallet)) {
        const joined = tryJoinRoster(wallet)
        if (!joined.ok) return
        pushLiveFields(state)
      }
      if (!assertActivePlayer(wallet)) return
      const prizeIndex = pickLivePrizeIndex()
      const payout = livePrizeByIndex(prizeIndex)
      wheelReserve = 'show'
      state.prizeIndex = prizeIndex
      state.wheelSlices = 4
      state.spinNonce += 1
      state.spinning = true
      state.liveSpin = true
      state.lastWinner = (data.displayName || 'Guest').slice(0, 48)
      state.lastPrize = payout.label
      state.lastSpins = pushLastSpin(state.lastSpins, state.lastWinner, payout.label)
      showSpinEndsAt = Date.now() + SHOW_SPIN_SECONDS * 1000
      pushLiveFields(state)
      console.log(`[SERVER] live spin → ${state.lastWinner} ${payout.label}`)
      return
    }

    const prizeIndex = pickLivePrizeIndex()
    const winner = (data.displayName || 'Guest').slice(0, 48)
    const payout = livePrizeByIndex(prizeIndex)
    wheelReserve = 'show'
    state.prizeIndex = prizeIndex
    state.wheelSlices = 4
    state.spinNonce += 1
    state.spinning = true
    state.liveSpin = false
    state.lastWinner = winner
    state.lastPrize = payout.label
    state.lastSpins = pushLastSpin(state.lastSpins, winner, payout.label)
    showSpinEndsAt = Date.now() + SHOW_SPIN_SECONDS * 1000
    console.log(`[SERVER] practice spin → ${winner} ${payout.label}`)
  })

  room.onMessage('hostStatus', async (_data, context) => {
    if (!context) return
    await syncHostWalletsCount()
    const gate = await assertDailyClaimant(context.from)
    const allowed = gate.ok ? await isHostWallet(gate.wallet) : false
    room.send('hostStatusResult', { allowed }, { to: [context.from] })
  })

  room.onMessage('hostOpenLive', async (_data, context) => {
    if (!context) return
    const gate = await assertDailyClaimant(context.from)
    if (!gate.ok) {
      room.send('hostLiveResult', { ok: false, action: 'open', error: gate.reason }, { to: [context.from] })
      return
    }
    if (!(await isHostWallet(gate.wallet))) {
      room.send('hostLiveResult', { ok: false, action: 'open', error: 'not_host' }, { to: [context.from] })
      return
    }
    const block = hostLiveBlockReason()
    if (block) {
      room.send('hostLiveResult', { ok: false, action: 'open', error: block }, { to: [context.from] })
      return
    }
    openLiveRound(true)
    room.send('hostLiveResult', { ok: true, action: 'open', error: '' }, { to: [context.from] })
    console.log(`[SERVER] host open live ${gate.wallet}`)
  })

  room.onMessage('hostEndLive', async (_data, context) => {
    if (!context) return
    const gate = await assertDailyClaimant(context.from)
    if (!gate.ok) {
      room.send('hostLiveResult', { ok: false, action: 'end', error: gate.reason }, { to: [context.from] })
      return
    }
    if (!(await isHostWallet(gate.wallet))) {
      room.send('hostLiveResult', { ok: false, action: 'end', error: 'not_host' }, { to: [context.from] })
      return
    }
    if (!ShowState.has(stateEntity) || !isLivePhase(ShowState.get(stateEntity).roundPhase)) {
      room.send('hostLiveResult', { ok: false, action: 'end', error: 'not_live' }, { to: [context.from] })
      return
    }
    endLiveRound('host')
    room.send('hostLiveResult', { ok: true, action: 'end', error: '' }, { to: [context.from] })
    console.log(`[SERVER] host end live ${gate.wallet}`)
  })

  room.onMessage('guessLetter', (data, context) => {
    if (!context) return
    const letter = normalizeLetter(data.letter)
    if (!letter) return
    const state = ShowState.getMutable(stateEntity)
    if (!state.canGuess || alreadyGuessed(state.guessed, letter)) return
    const wallet = (context.from || '').toLowerCase()
    if (isLivePhase(state.roundPhase)) {
      if (!mayAttemptSolve(wallet) || !assertActivePlayer(wallet)) return
    }

    state.guessed = state.guessed + letter
    state.canGuess = false
    const answer = puzzleAt(state.puzzleIndex).answer
    if (isSolved(answer, state.guessed)) {
      markSolved(state, '', context.from)
    }
  })

  room.onMessage('solvePuzzle', (data, context) => {
    if (!context) return
    const phrase = normalizePhrase(data.phrase || '')
    if (!phrase) return
    const state = ShowState.getMutable(stateEntity)
    if (!state.canGuess) return
    const answer = puzzleAt(state.puzzleIndex).answer
    if (isSolved(answer, state.guessed)) return
    const wallet = (context.from || '').toLowerCase()
    const live = isLivePhase(state.roundPhase)

    if (live && !mayAttemptSolve(wallet)) return

    if (!phrasesMatch(phrase, answer)) {
      state.canGuess = false
      state.lastWinner = (data.displayName || 'Guest').slice(0, 48)
      if (live && mayAttemptSolve(wallet)) {
        handleLiveWrongSolve(wallet)
        state.lastPrize = 'MISSED SOLVE · OUT'
        pushLiveFields(state)
        console.log(`[SERVER] live solve miss ${wallet}`)
      } else {
        state.lastPrize = 'MISSED SOLVE'
        console.log(`[SERVER] solve miss ${state.lastWinner}`)
      }
      return
    }
    markSolved(state, data.displayName || '', context.from)
  })

  engine.addSystem(serverTickSystem)
}

async function loadLiveRoundMax(): Promise<void> {
  const raw = ((await EnvVar.get('LIVE_ROUND_MAX_SEC')) || '').trim()
  const sec = Number(raw)
  if (Number.isFinite(sec) && sec >= 60) liveRoundMaxSec = Math.min(sec, 3600)
  console.log(`[SERVER] live round max ${liveRoundMaxSec}s`)
}

function pushLiveFields(state: {
  liveSeats: string
  activeSeat: number
  roundNfts: number
  liveLocked: string
}) {
  state.liveSeats = seatsCsv()
  state.activeSeat = rosterSize() > 0 ? activeSeatIndex() : -1
  state.liveLocked = lockedCsv()
  syncActiveBankToShow(state)
}

function isWalletEligibleSync(address: string): boolean {
  const wallet = (address || '').toLowerCase()
  if (!isWalletAddress(wallet)) return false
  for (const [, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
    if ((identity.address || '').toLowerCase() !== wallet) continue
    return !identity.isGuest
  }
  return false
}

async function loadRoundEvery(): Promise<void> {
  const raw = ((await EnvVar.get('ROUND_EVERY_SEC')) || '').trim()
  const sec = Number(raw)
  roundEveryMs = raw ? clampRoundMs(sec) : DEFAULT_ROUND_MS
  console.log(`[SERVER] live round every ${Math.round(roundEveryMs / 1000)}s`)
}

async function syncHostWalletsCount(): Promise<void> {
  const hosts = await loadHostWallets()
  if (!ShowState.has(stateEntity)) return
  ShowState.getMutable(stateEntity).hostWalletsCount = hosts.size
}

function hostLiveBlockReason(): string {
  if (!ShowState.has(stateEntity)) return 'no_state'
  const state = ShowState.get(stateEntity)
  if (isLivePhase(state.roundPhase)) return 'already_live'
  if (state.roundPhase !== RoundPhase.PRACTICE) return 'busy'
  if (wheelReserve || state.spinning || state.dailySpinning || state.canGuess) return 'wheel_busy'
  if (isSolved(puzzleAt(state.puzzleIndex).answer, state.guessed)) return 'puzzle_solved'
  return ''
}

function rollRoundClock() {
  if (!ShowState.has(stateEntity)) return
  const state = ShowState.get(stateEntity)
  const now = Date.now()

  if (isLivePhase(state.roundPhase)) {
    if (liveDeadline() > 0 && now >= liveDeadline()) {
      endLiveRound('timeout')
    }
    return
  }

  if (state.roundPhase !== RoundPhase.PRACTICE) return
  const at = typeof state.nextRoundAt === 'bigint' ? Number(state.nextRoundAt) : state.nextRoundAt
  if (now < at) return
  openLiveRound(false)
}

function openLiveRound(byHost: boolean) {
  const mutable = ShowState.getMutable(stateEntity)
  mutable.roundPhase = RoundPhase.LIVE
  mutable.guessed = ''
  mutable.canGuess = false
  mutable.roundWip = 0
  mutable.roundNfts = 0
  mutable.liveLocked = ''
  mutable.hostLiveActive = byHost
  resetLiveRound(Date.now(), liveRoundMaxSec)
  mutable.liveEndsAt = liveDeadline()
  mutable.wheelSlices = 4
  pushLiveFields(mutable)
  console.log(`[SERVER] live round open (${byHost ? 'host' : 'auto'}, ${liveRoundMaxSec}s)`)
}

function endLiveRound(reason: string) {
  const mutable = ShowState.getMutable(stateEntity)
  mutable.roundPhase = RoundPhase.RESOLVING
  mutable.canGuess = false
  mutable.spinning = false
  if (reason !== 'solved') {
    mutable.guessed = ''
    mutable.lastPrize = ''
  }
  mutable.roundWip = 0
  mutable.roundNfts = 0
  clearLiveRound()
  mutable.liveSeats = ''
  mutable.activeSeat = -1
  mutable.liveLocked = ''
  mutable.nextRoundAt = nextRoundBoundary(Date.now(), roundEveryMs)
  mutable.liveEndsAt = 0
  mutable.wheelSlices = 4
  mutable.hostLiveActive = false
  mutable.roundPhase = RoundPhase.PRACTICE
  console.log(
    `[SERVER] live round ended (${reason}) next slot ${new Date(Number(mutable.nextRoundAt)).toISOString()}`
  )
}

function serverTickSystem(dt: number) {
  heartbeatAcc += dt
  if (heartbeatAcc >= HEARTBEAT_MS / 1000) {
    heartbeatAcc = 0
    if (ServerHeartbeat.has(heartbeatEntity)) {
      ServerHeartbeat.getMutable(heartbeatEntity).serverHeartbeatAt = Date.now()
    }
  }

  fulfillRetryTick(dt)

  rollRoundClock()

  if (showSpinEndsAt > 0 && Date.now() >= showSpinEndsAt) {
    showSpinEndsAt = 0
    finishShowSpinOnServer()
  }

  if (dailySpinEndsAt > 0 && Date.now() >= dailySpinEndsAt) {
    dailySpinEndsAt = 0
    if (ShowState.has(stateEntity)) {
      ShowState.getMutable(stateEntity).dailySpinning = false
    }
    if (wheelReserve === 'daily') wheelReserve = ''
  }

  if (roundResetEndsAt > 0 && Date.now() >= roundResetEndsAt) {
    roundResetEndsAt = 0
    if (ShowState.has(stateEntity)) {
      const state = ShowState.getMutable(stateEntity)
      state.puzzleIndex += 1
      state.guessed = ''
      state.canGuess = false
      state.roundWip = 0
      state.roundNfts = 0
      state.lastPrize = ''
      console.log(`[SERVER] next puzzle card ${state.puzzleIndex}`)
    }
  }
}

function markSolved(
  state: {
    guessed: string
    canGuess: boolean
    lastWinner: string
    lastPrize: string
    puzzleIndex: number
    weekSolves: number
    roundPhase: number
  },
  displayName: string,
  wallet: string
) {
  const w = (wallet || '').toLowerCase()
  state.guessed = revealAll(puzzleAt(state.puzzleIndex).answer)
  state.canGuess = false
  state.lastWinner = (displayName || seatedName(wallet) || 'Guest').slice(0, 48)
  state.lastPrize = 'SOLVED'
  state.weekSolves = notePracticeSolve(wallet)
  publishPracticeBoard(practiceScoreSnapshot())

  if (isLivePhase(state.roundPhase)) {
    if (solverWearablePending(w)) {
      fulfillLiveWearable(w, state.lastWinner)
      clearWearablePending(w)
    }
    roundResetEndsAt = Date.now() + 6000
    endLiveRound('solved')
    console.log(`[SERVER] live puzzle solved by ${state.lastWinner}`)
    return
  }

  roundResetEndsAt = Date.now() + 6000
  console.log(`[SERVER] puzzle solved by ${state.lastWinner} week ${state.weekSolves}`)
}

function finishShowSpinOnServer() {
  if (!ShowState.has(stateEntity)) return
  const state = ShowState.getMutable(stateEntity)
  state.spinning = false

  if (isLivePhase(state.roundPhase)) {
    const land = applyLiveLand(state.prizeIndex)
    const payout = livePrizeByIndex(state.prizeIndex)
    state.canGuess = land === 'letter' || land === 'wearable'
    pushLiveFields(state)
    console.log(`[SERVER] live land ${payout.label} → ${land}`)
  } else {
    state.canGuess = showWheelOpensLetterPad(state.prizeIndex)
    if (isSolved(puzzleAt(state.puzzleIndex).answer, state.guessed)) {
      state.canGuess = false
    }
  }

  if (wheelReserve === 'show') wheelReserve = ''
}
