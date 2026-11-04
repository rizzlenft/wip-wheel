/**
 * Shared click / proximity binding.
 *
 * Hover feedback (docs + Seat.ts + screenshots 14 Oct):
 * - One visible prompt per action. Extra PointerEvents / proximity / E entries
 *   with showFeedback:true stack as duplicate chips (LMB + LMB + E).
 * - Seat.ts: single button, single hover. We keep LMB as the feedback button
 *   (MASTER: hover = mobile UI) and listen for E + proximity silently.
 * - When two volumes share one action (pad + wheel face), only one showHover.
 *
 * Distance / rays: maxDistance is the avatar, maxCameraDistance is OR'd with it,
 * first CL_POINTER wins. The hover chip is the longer pointer event. The
 * shorter one is the no-aim press and stays silent.
 */

import {
  ColliderLayer,
  InputAction,
  MeshCollider,
  PointerEventType,
  PointerEvents,
  engine,
  inputSystem,
  pointerEventsSystem
} from '@dcl/sdk/ecs'

type EntityRef = ReturnType<typeof engine.addEntity>

const POINTER = ColliderLayer.CL_POINTER
const PHYSICS = ColliderLayer.CL_PHYSICS
const BOTH = POINTER | PHYSICS

/** E while aimed — same onUse, no second hover chip. */
const primaryUse = new Map<EntityRef, () => void>()
let primarySystemInstalled = false

/**
 * Walkable / solid. Never POINTER. Never adds a collider that was not already there —
 * `setBox` on a mesh that had none (WheelFrame, Banner) creates a giant steal-box.
 */
export function physicsOnly(name: string) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity) return
  wipePointer(entity)
  if (!MeshCollider.has(entity)) return
  MeshCollider.setBox(entity, PHYSICS)
}

/** Prop. Hub often authors collisionMask 3. Delete the mesh collider so it cannot eat the ray. */
export function muteCollider(name: string) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity) return
  wipePointer(entity)
  if (MeshCollider.has(entity)) MeshCollider.deleteFrom(entity)
}

/** Strip Hub-authored PointerEvents so a dead composite click cannot steal the ray. */
export function wipePointer(entity: EntityRef | null) {
  if (!entity) return
  primaryUse.delete(entity)
  pointerEventsSystem.removeOnPointerDown(entity)
  pointerEventsSystem.removeOnProximityDown(entity)
  if (PointerEvents.has(entity)) PointerEvents.deleteFrom(entity)
}

/**
 * Click + silent E + silent proximity.
 * `showHover` — only the primary volume for an action should be true.
 */
export function bindUse(
  entity: EntityRef | null,
  hoverText: string,
  onUse: () => void,
  maxDistance = 16,
  physical = false,
  priority = 0,
  showHover = true,
  proximity = 3
) {
  if (!entity) return
  wipePointer(entity)
  MeshCollider.setBox(entity, physical ? BOTH : POINTER)

  // One feedback chip: LMB / mobile interact (MASTER).
  pointerEventsSystem.onPointerDown(
    {
      entity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText,
        maxDistance,
        maxCameraDistance: maxDistance,
        showFeedback: showHover,
        showHighlight: showHover,
        priority
      }
    },
    onUse
  )

  // Near-field / phone without aiming — fires, does not draw a second chip.
  pointerEventsSystem.onProximityDown(
    {
      entity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText,
        maxDistance: proximity,
        showFeedback: false,
        showHighlight: false,
        priority
      }
    },
    onUse
  )

  // E while aimed (Seat.ts habit) — silent; helper allows only one onPointerDown.
  const pe = PointerEvents.getMutableOrNull(entity)
  if (pe) {
    pe.pointerEvents.push({
      eventType: PointerEventType.PET_DOWN,
      eventInfo: {
        button: InputAction.IA_PRIMARY,
        hoverText,
        maxDistance,
        maxCameraDistance: maxDistance,
        showFeedback: false,
        showHighlight: false,
        priority
      }
    })
  }
  primaryUse.set(entity, onUse)
  ensurePrimarySystem()
}

export function setHoverText(entity: EntityRef | null, hoverText: string) {
  if (!entity) return
  const events = PointerEvents.getMutableOrNull(entity)
  if (!events) return
  const chip = hoverChipDistance(events.pointerEvents)
  for (let i = 0; i < events.pointerEvents.length; i++) {
    const info = events.pointerEvents[i].eventInfo
    if (!info) continue
    // The visible chip, even while showFeedback is off for the daily close-up.
    // Silent E / the shorter no-aim press stay quiet.
    const visibleChip = info.button === InputAction.IA_POINTER && (info.maxDistance ?? 0) === chip
    if (info.showFeedback || visibleChip) info.hoverText = hoverText
  }
}

/** Hide or show the one visible prompt. Silent E / proximity stay off. */
export function setHoverShown(entity: EntityRef | null, shown: boolean) {
  if (!entity) return
  const events = PointerEvents.getMutableOrNull(entity)
  if (!events) return
  const chip = hoverChipDistance(events.pointerEvents)
  for (let i = 0; i < events.pointerEvents.length; i++) {
    const info = events.pointerEvents[i].eventInfo
    if (!info || info.button !== InputAction.IA_POINTER) continue
    if ((info.maxDistance ?? 0) !== chip) continue
    info.showFeedback = shown
    info.showHighlight = shown
  }
}

/** Longest pointer-button distance on this entity. That one draws the prompt. */
function hoverChipDistance(
  events: { eventInfo?: { button?: InputAction; maxDistance?: number } | null }[]
): number {
  let longest = -1
  let count = 0
  for (let i = 0; i < events.length; i++) {
    const info = events[i].eventInfo
    if (!info || info.button !== InputAction.IA_POINTER) continue
    count += 1
    const distance = info.maxDistance ?? 0
    if (distance > longest) longest = distance
  }
  // Click and no-aim set to the same range: keep the prompt on the click only
  // by returning a distance that still matches a single event when they differ,
  // and the shared distance when a caller set them equal.
  return count === 0 ? -1 : longest
}

function ensurePrimarySystem() {
  if (primarySystemInstalled) return
  primarySystemInstalled = true
  engine.addSystem(() => {
    for (const [entity, onUse] of primaryUse) {
      if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN, entity)) {
        onUse()
      }
    }
  })
}
