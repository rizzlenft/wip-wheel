/**
 * Short VirtualCamera cut on show spins only (not daily).
 * Meetup spectator beat — freeze walk, cut to the wheel, release after land.
 * Safe lane: does not touch claim / letter / prize RNG.
 *
 * Framing offsets live in layout.SHOW_CAM so Draft A floor moves retune in one place.
 */
import { engine, InputModifier, MainCamera, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { SHOW_CAM, WHEEL } from './layout'

type EntityRef = ReturnType<typeof engine.addEntity>

let camEntity: EntityRef | null = null
let lookTarget: EntityRef | null = null
let active = false
let releaseIn = 0

export function setupShowCam() {
  lookTarget = engine.addEntity()
  Transform.create(lookTarget, {
    position: Vector3.create(WHEEL.x, WHEEL.y, WHEEL.z)
  })

  const pos = Vector3.create(
    WHEEL.x + SHOW_CAM.offsetX,
    WHEEL.y + SHOW_CAM.offsetY,
    WHEEL.z + SHOW_CAM.offsetZ
  )
  const target = Vector3.create(WHEEL.x, WHEEL.y, WHEEL.z)
  camEntity = engine.addEntity()
  Transform.create(camEntity, {
    position: pos,
    rotation: Quaternion.fromLookAt(pos, target)
  })
  VirtualCamera.create(camEntity, {
    lookAtEntity: lookTarget,
    defaultTransition: {
      transitionMode: VirtualCamera.Transition.Time(SHOW_CAM.transitionSec)
    },
    fov: SHOW_CAM.fov
  })

  engine.addSystem(showCamReleaseSystem)
}

/** Call when a show tween starts (every client that sees the spin). */
export function beginShowCamBeat() {
  if (!camEntity) return
  active = true
  releaseIn = 0
  MainCamera.createOrReplace(engine.CameraEntity, { virtualCameraEntity: camEntity })
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: InputModifier.Mode.Standard({ disableAll: true })
  })
}

/** Soft end after show land — hold briefly, then restore player camera. */
export function endShowCamBeat() {
  if (!active) return
  releaseIn = SHOW_CAM.holdAfterLand
}

/** Immediate abort (daily stole the wheel, or scene teardown). */
export function cancelShowCamBeat() {
  if (!active && releaseIn <= 0) return
  releaseNow()
}

function releaseNow() {
  active = false
  releaseIn = 0
  const main = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (main) main.virtualCameraEntity = undefined
  if (InputModifier.has(engine.PlayerEntity)) {
    InputModifier.deleteFrom(engine.PlayerEntity)
  }
}

function showCamReleaseSystem(dt: number) {
  if (releaseIn <= 0) return
  releaseIn -= dt
  if (releaseIn > 0) return
  releaseNow()
}
