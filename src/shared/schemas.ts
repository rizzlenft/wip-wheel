import { engine, Schemas } from '@dcl/sdk/ecs'

/**
 * All `defineComponent` calls live here and MUST be reached by a static import
 * from `index.ts` before `main()`. Dynamic import after seal →
 * "Engine is already sealed. No components can be added at this stage".
 */

export const ShowState = engine.defineComponent('wip::ShowState', {
  spinNonce: Schemas.Int,
  prizeIndex: Schemas.Int,
  spinning: Schemas.Boolean,
  lastWinner: Schemas.String,
  lastPrize: Schemas.String,
  guessed: Schemas.String,
  canGuess: Schemas.Boolean,
  /** Which card in the puzzle bank the room is on. Server-owned. */
  puzzleIndex: Schemas.Int,
  /** Last solver's solves this week. 0 if the solver was a guest. */
  weekSolves: Schemas.Int,
  /** UTC ms when the next live-round slot opens. Clients only format it. */
  nextRoundAt: Schemas.Int64,
  roundWip: Schemas.Int,
  roundNfts: Schemas.Int,
  liveSpin: Schemas.Boolean,
  lastSpins: Schemas.String,
  dailyNonce: Schemas.Int,
  dailyIndex: Schemas.Int,
  dailyWinner: Schemas.String,
  dailyPrize: Schemas.String,
  dailySpinning: Schemas.Boolean,
  /** 0 practice · 1 live · 2 resolving (server-owned). */
  roundPhase: Schemas.Int,
  /** Lowercase wallets, comma-separated, max three. */
  liveSeats: Schemas.String,
  /** 0..2 whose turn in live; -1 when no roster. */
  activeSeat: Schemas.Int,
  /** Wheel tween slice count (show wheel is always 4). */
  wheelSlices: Schemas.Int,
  /** UTC ms when the current live round ends. 0 when not live. */
  liveEndsAt: Schemas.Int64,
  /** Wallets locked from solving again this live round (comma-separated). */
  liveLocked: Schemas.String,
  /** True when the current live window was opened by a host (not the auto clock). */
  hostLiveActive: Schemas.Boolean,
  /** How many wallets are on HOST_WALLETS (0 = host live disabled). Server-only write. */
  hostWalletsCount: Schemas.Int
})

export const PracticeLeaderboard = engine.defineComponent('wip::PracticeLeaderboard', {
  updatedAt: Schemas.Int64,
  /** JSON array of { name, score } top N. */
  payload: Schemas.String
})

/** Pulsed by the Multiplayer Server so clients know it is alive (cold start ~15s). */
export const ServerHeartbeat = engine.defineComponent('wip::ServerHeartbeat', {
  serverHeartbeatAt: Schemas.Int64
})

// validateBeforeChange is registered in server/server.ts initServer() after role is known.

export enum SyncIds {
  ShowState = 1,
  ServerHeartbeat = 2,
  PracticeLeaderboard = 3
}
