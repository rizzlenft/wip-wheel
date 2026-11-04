/**
 * Layout regression probe — log after setup so “empty set” scares are evidence, not vibes.
 * Does not change gameplay. See design/layout-baseline.md.
 */
import { Transform, engine } from '@dcl/sdk/ecs'
import { AUDIENCE, BOARD, CONTESTANTS, DAILY_PAD, DAILY_SIGN, SPAWN_DOC, WHEEL } from './layout'

const HUB_CRITICAL = [
  'WheelRoot',
  'WheelDisc',
  'WheelFrame',
  'SpinButton',
  'BenchL',
  'BenchR',
  'Backdrop',
  'Stage'
] as const

function posOf(name: string): string {
  const e = engine.getEntityOrNullByName(name)
  if (!e || !Transform.has(e)) return 'MISSING'
  const p = Transform.get(e).position
  return `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`
}

/** Call once at end of setupGame. */
export function logFloorHealth() {
  const missing = HUB_CRITICAL.filter((n) => !engine.getEntityOrNullByName(n))
  console.log(
    `[WIP] floor health layout=WHEEL${JSON.stringify(WHEEL)} BOARD.z=${BOARD.z} DAILY_PAD=${JSON.stringify(DAILY_PAD)} AUDIENCE.z=${AUDIENCE.z} pads=${CONTESTANTS.map((c) => c.z).join('/')}`
  )
  console.log(
    `[WIP] floor health hub WheelPitch=${posOf('WheelPitch')} WheelRoot(local)=${posOf('WheelRoot')} WheelDisc(local)=${posOf('WheelDisc')} SpinButton=${posOf('SpinButton')} BenchR=${posOf('BenchR')} Backdrop=${posOf('Backdrop')}`
  )
  console.log(
    `[WIP] floor health spawnDoc x=${SPAWN_DOC.x} z=${SPAWN_DOC.z} cam=${JSON.stringify(SPAWN_DOC.cameraTarget)} (must match scene.json — npm run verify:spawn-sync)`
  )
  console.log(`[WIP] floor health dailySignTarget=(${DAILY_SIGN.x}, ${DAILY_SIGN.z})`)
  console.log(
    '[WIP] floor health: looking AWAY from +Z (board) shows empty sky — that is parcel void, not a missing set'
  )
  if (missing.length) {
    console.error(`[WIP] floor health MISSING hub entities: ${missing.join(', ')} — composite not loaded or renamed`)
  } else {
    console.log('[WIP] floor health: critical hub names present')
  }
}
