import { Schemas } from '@dcl/sdk/ecs'
import { registerMessages } from '@dcl/sdk/network'

/**
 * Client ↔ Multiplayer Server messages.
 * Must be imported statically from index.ts before the engine seals.
 */
export const Messages = {
  /** Client → server: request today's daily spin */
  dailySpin: Schemas.Map({
    displayName: Schemas.String
  }),
  /** Client → server: ask if this wallet already claimed today */
  dailyStatus: Schemas.Map({}),
  /** Server → client: status reply (to requester) */
  dailyStatusResult: Schemas.Map({
    claimed: Schemas.Boolean,
    label: Schemas.String,
    prizeId: Schemas.String,
    wheelIndex: Schemas.Int,
    claimId: Schemas.String,
    error: Schemas.String
  }),
  /** Server → client: spin outcome (to requester; also mirrored on ShowState for room) */
  dailySpinResult: Schemas.Map({
    ok: Schemas.Boolean,
    claimId: Schemas.String,
    prizeId: Schemas.String,
    label: Schemas.String,
    prizeType: Schemas.String,
    wheelIndex: Schemas.Int,
    /** Same nonce as ShowState.dailyNonce — claimer starts anim from ACK if CRDT lags. */
    dailyNonce: Schemas.Int,
    status: Schemas.String,
    error: Schemas.String,
    message: Schemas.String
  }),
  /** Client → server: start a show (Thursday) wheel spin */
  showSpin: Schemas.Map({
    displayName: Schemas.String
  }),
  /** Client → server: call a letter after a show spin */
  guessLetter: Schemas.Map({
    letter: Schemas.String
  }),
  /**
   * Client → server: try the whole phrase during the letter window.
   * The server compares it. The client does not report a win.
   */
  solvePuzzle: Schemas.Map({
    phrase: Schemas.String,
    displayName: Schemas.String
  }),
  /** Join the three-player live roster (first come). */
  takeLiveSeat: Schemas.Map({
    displayName: Schemas.String
  }),
  takeLiveSeatResult: Schemas.Map({
    ok: Schemas.Boolean,
    seat: Schemas.Int,
    error: Schemas.String
  }),
  /** Client → server: am I on HOST_WALLETS? (reply to requester only) */
  hostStatus: Schemas.Map({}),
  hostStatusResult: Schemas.Map({
    allowed: Schemas.Boolean
  }),
  /** Host operator opens a live round now (overrides countdown). */
  hostOpenLive: Schemas.Map({}),
  /** Host operator ends the current live round early. */
  hostEndLive: Schemas.Map({}),
  hostLiveResult: Schemas.Map({
    ok: Schemas.Boolean,
    action: Schemas.String,
    error: Schemas.String
  })
}

export const room = registerMessages(Messages)
