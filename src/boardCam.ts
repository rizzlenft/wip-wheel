/**
 * Frames the puzzle board while the letter pad is open (Bay V1 UX).
 */
import { engine, InputModifier, MainCamera, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { BOARD_CAM } from './layout'

type EntityRef = ReturnType<typeof engine.addEntity>

let camEntity: EntityRef | null = null
let lookTarget: EntityRef | null = null
let active = false

export function setupBoardCam() {
  lookTarget = engine.addEntity()
  Transform.create(lookTarget, {
    position: Vector3.create(BOARD_CAM.lookX, BOARD_CAM.lookY, BOARD_CAM.lookZ)
  })

  const pos = Vector3.create(BOARD_CAM.offsetX, BOARD_CAM.offsetY, BOARD_CAM.offsetZ)
  const target = Vector3.create(BOARD_CAM.lookX, BOARD_CAM.lookY, BOARD_CAM.lookZ)
  camEntity = engine.addEntity()
  Transform.create(camEntity, {
    position: pos,
    rotation: Quaternion.fromLookAt(pos, target)
  })
  VirtualCamera.create(camEntity, {
    lookAtEntity: lookTarget,
    defaultTransition: {
      transitionMode: VirtualCamera.Transition.Time(BOARD_CAM.transitionSec)
    },
    fov: BOARD_CAM.fov
  })
}

export function beginBoardCam() {
  if (!camEntity || active) return
  active = true
  MainCamera.createOrReplace(engine.CameraEntity, { virtualCameraEntity: camEntity })
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: InputModifier.Mode.Standard({ disableAll: true })
  })
}

export function endBoardCam() {
  if (!active) return
  active = false
  const main = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (main) main.virtualCameraEntity = undefined
  if (InputModifier.has(engine.PlayerEntity)) {
    InputModifier.deleteFrom(engine.PlayerEntity)
  }
}

export function isBoardCamOn(): boolean {
  return active
}
