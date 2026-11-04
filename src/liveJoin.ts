import { getPlayer } from '@dcl/sdk/players'
import { engine } from '@dcl/sdk/ecs'
import { room } from './shared/messages'
import { isLivePhase } from './livePhase'
import { ShowState } from './state'
import { bindUse } from './interact'
import { CONTESTANTS, HIT } from './layout'
import { makeClickVolume } from './look'
import { Quaternion } from '@dcl/sdk/math'

type EntityRef = ReturnType<typeof engine.addEntity>

const hits: EntityRef[] = []
let canSendLiveSeat: () => boolean = () => false

export function setupLiveJoin(stateReady: () => boolean) {
  canSendLiveSeat = stateReady
  hits.length = 0
  // Pad 1 is show spin only (sendShowSpin also takeLiveSeat). Pads 2–3 are join-only.
  CONTESTANTS.forEach((pad, index) => {
    if (index === 0) return
    const hit = makeClickVolume(
      { x: pad.x, y: HIT.y, z: pad.z },
      { x: HIT.w, y: HIT.h, z: HIT.w },
      Quaternion.Identity()
    )
    hits.push(hit)
    bindUse(
      hit,
      'Join live',
      () => requestLiveSeat(index),
      2.2,
      false,
      5,
      true,
      2.2
    )
  })
}

function requestLiveSeat(_padIndex: number) {
  if (!canSendLiveSeat()) return
  for (const [entity] of engine.getEntitiesWith(ShowState)) {
    void entity
    const state = ShowState.get(entity)
    if (!isLivePhase(state.roundPhase)) return
    room.send('takeLiveSeat', { displayName: playerName() })
    return
  }
}

function playerName(): string {
  return (getPlayer()?.name || 'Player').slice(0, 48)
}
