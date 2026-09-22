import { ColliderLayer, InputAction, MeshCollider, engine, pointerEventsSystem } from '@dcl/sdk/ecs'

type EntityRef = ReturnType<typeof engine.addEntity>

export function physicsOnly(name: string) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity) return
  MeshCollider.setBox(entity, ColliderLayer.CL_PHYSICS)
}

export function bindUse(entity: EntityRef | null, hoverText: string, onUse: () => void, maxDistance = 5) {
  if (!entity) return
  MeshCollider.setBox(entity, ColliderLayer.CL_POINTER)
  pointerEventsSystem.removeOnPointerDown(entity)
  pointerEventsSystem.onPointerDown(
    {
      entity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText,
        maxDistance,
        showFeedback: true
      }
    },
    onUse
  )
}
