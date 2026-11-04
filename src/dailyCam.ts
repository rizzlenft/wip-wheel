/**
 * VirtualCamera for a daily spin only. Does not read SHOW_CAM and does not
 * rotate WheelRoot. Show spins keep showCam.ts.
 */
import { engine, InputModifier, MainCamera, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { DAILY_CABINET, DAILY_CAM, DAILY_PAD } from './layout'

type EntityRef = ReturnType<typeof engine.addEntity>

let camEntity: EntityRef | null = null
let lookTarget: EntityRef | null = null
let active = false
let releaseIn = 0

function holeWorld(): Vector3 {
  const s = DAILY_CABINET.scale
  const h = DAILY_CABINET.hole
  // Cabinet yaw 180 sends local +Z toward world −Z (spawn).
  return Vector3.create(
    DAILY_PAD.x - h.x * s,
    DAILY_CABINET.originY + h.y * s,
    DAILY_PAD.z - h.z * s
  )
}

export function setupDailyCam() {
  const look = holeWorld()
  lookTarget = engine.addEntity()
  Transform.create(lookTarget, { position: look })

  const pos = Vector3.create(look.x, look.y + DAILY_CAM.above, look.z - DAILY_CAM.towardSpawn)
  camEntity = engine.addEntity()
  Transform.create(camEntity, {
    position: pos,
    rotation: Quaternion.fromLookAt(pos, look)
  })
  VirtualCamera.create(camEntity, {
    lookAtEntity: lookTarget,
    defaultTransition: { transitionMode: VirtualCamera.Transition.Time(DAILY_CAM.transitionSec) },
    fov: DAILY_CAM.fov
  })
  engine.addSystem(dailyCamReleaseSystem)
}

/** True for the close-up, including the hold after the wheel lands. */
export function isDailyCamOn() {
  return active || releaseIn > 0
}

export function beginDailyCam() {
  if (!camEntity) return
  active = true
  releaseIn = 0
  MainCamera.createOrReplace(engine.CameraEntity, { virtualCameraEntity: camEntity })
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: InputModifier.Mode.Standard({ disableAll: true })
  })
}

export function endDailyCam() {
  if (!active) return
  releaseIn = DAILY_CAM.holdAfterLand
}

export function cancelDailyCam() {
  if (!active && releaseIn <= 0) return
  releaseNow()
}

function releaseNow() {
  active = false
  releaseIn = 0
  const main = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (main && camEntity && main.virtualCameraEntity === camEntity) {
    main.virtualCameraEntity = undefined
  }
  if (InputModifier.has(engine.PlayerEntity)) InputModifier.deleteFrom(engine.PlayerEntity)
}

function dailyCamReleaseSystem(dt: number) {
  if (releaseIn <= 0) return
  releaseIn -= dt
  if (releaseIn > 0) return
  releaseNow()
}
