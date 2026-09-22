import { engine, Schemas } from '@dcl/sdk/ecs'

export const ShowState = engine.defineComponent('wip::ShowState', {
  spinNonce: Schemas.Int,
  prizeIndex: Schemas.Int,
  spinning: Schemas.Boolean,
  lastWinner: Schemas.String,
  lastPrize: Schemas.String,
  guessed: Schemas.String,
  canGuess: Schemas.Boolean,
  roundWip: Schemas.Int,
  roundNfts: Schemas.Int,
  liveSpin: Schemas.Boolean,
  lastSpins: Schemas.String,
  dailyNonce: Schemas.Int,
  dailyIndex: Schemas.Int,
  dailyWinner: Schemas.String,
  dailyPrize: Schemas.String,
  dailySpinning: Schemas.Boolean
})
