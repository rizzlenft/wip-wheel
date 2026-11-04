import {
  engine,
  ColliderLayer,
  EasingFunction,
  LightSource,
  Material,
  MeshCollider,
  MaterialTransparencyMode,
  MeshRenderer,
  TextShape,
  TextureFilterMode,
  TextureWrapMode,
  Transform,
  Tween,
  TweenLoop,
  TweenSequence,
  VisibilityComponent
} from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { AUDIENCE_FACING } from './facing'
import { SIGN } from './layout'

export const LOOK = {
  magenta: Color4.create(1, 0.32, 0.62, 1),
  gold: Color4.create(1, 0.78, 0.28, 1),
  mint: Color4.create(0.45, 1, 0.72, 1),
  white: Color4.create(1, 1, 1, 1),
  cream: Color4.create(1, 0.96, 0.88, 1),
  navy: Color4.create(0.08, 0.04, 0.16, 1),
  lilac: Color4.create(0.93, 0.88, 1, 1),
  ink: Color4.create(0.02, 0.01, 0.04, 1)
}

export const GLOW = {
  magenta: Color3.create(1, 0.28, 0.58),
  gold: Color3.create(1, 0.78, 0.22),
  mint: Color3.create(0.45, 1, 0.72),
  cream: Color3.create(1, 0.94, 0.8),
  ink: Color3.create(0.08, 0.03, 0.14),
  screen: Color3.create(0.05, 0.02, 0.09)
}

export const FONT_SANS = 0
export const FONT_SERIF = 1
export const FONT_MONO = 2
export const ALIGN_CENTER = 4
export const ALIGN_LEFT = 3

export type Vec = { x: number; y: number; z: number }

export function makeBox(
  position: Vec,
  scale: Vec,
  albedo: Color4,
  emissive: Color3,
  intensity: number,
  rotation: Quaternion = AUDIENCE_FACING
) {
  const entity = engine.addEntity()
  Transform.create(entity, { position, scale, rotation })
  MeshRenderer.setBox(entity)
  paintSolid(entity, albedo, emissive, intensity)
  return entity
}

export function makeColliderBox(
  position: Vec,
  scale: Vec,
  albedo: Color4,
  emissive: Color3,
  intensity: number,
  rotation: Quaternion = AUDIENCE_FACING
) {
  const entity = makeBox(position, scale, albedo, emissive, intensity, rotation)
  MeshCollider.setBox(entity, ColliderLayer.CL_PHYSICS)
  return entity
}

/**
 * Invisible click target with a real box mesh. Babylon / some explorers will not
 * raycast a MeshCollider that has no MeshRenderer.
 */
export function makeClickVolume(position: Vec, scale: Vec, rotation: Quaternion = AUDIENCE_FACING) {
  const entity = engine.addEntity()
  Transform.create(entity, { position, scale, rotation })
  MeshRenderer.setBox(entity)
  // Belt + suspenders: VisibilityComponent alone has failed before on some clients
  // (black untextured box). Fully transparent material keeps the raycast mesh dark-safe.
  VisibilityComponent.createOrReplace(entity, { visible: false })
  Material.setPbrMaterial(entity, {
    albedoColor: Color4.create(0, 0, 0, 0),
    metallic: 0,
    roughness: 1,
    transparencyMode: 2,
    castShadows: false
  })
  MeshCollider.setBox(entity, ColliderLayer.CL_POINTER)
  return entity
}

export const LOGO_TEX = 'assets/Images/wip-logo.png'

export function makeLogo(position: Vec, size: number, src: string = LOGO_TEX, rotation: Quaternion = AUDIENCE_FACING) {
  const entity = engine.addEntity()
  Transform.create(entity, { position, scale: { x: size, y: size, z: 1 }, rotation })
  MeshRenderer.setPlane(entity)
  const texture = Material.Texture.Common({ src })
  Material.setPbrMaterial(entity, {
    texture,
    emissiveColor: Color3.create(0, 0, 0),
    emissiveIntensity: 0,
    albedoColor: Color4.create(1, 1, 1, 1),
    metallic: 0,
    roughness: 1,
    specularIntensity: 0,
    transparencyMode: 1,
    alphaTest: 0.35,
    castShadows: false
  })
  return entity
}

/**
 * Official text scale: fontSize 10 is 1 meter tall.
 * https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/text
 */
export function fontSizeForMeters(meters: number) {
  return meters * 10
}

/**
 * Shared 1024 panel. The visible tile is the inner 84%. The polygon continues
 * into the transparent margin so neighboring tiles can sit close without touching.
 * Alpha test discards that margin. Alpha blend left it filled in on the published
 * client, and the oversized quads fused into one block.
 * https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/materials
 */
const PANEL_TEX = 'assets/Images/tile-panel.png'
const PANEL_FILL = 0.84

export function makeFace(
  position: Vec,
  width: number,
  height: number,
  albedo: Color4,
  emissive: Color3,
  intensity: number
) {
  const entity = engine.addEntity()
  Transform.create(entity, {
    position,
    scale: { x: width / PANEL_FILL, y: height / PANEL_FILL, z: 1 },
    rotation: AUDIENCE_FACING
  })
  MeshRenderer.setPlane(entity)
  const texture = Material.Texture.Common({
    src: PANEL_TEX,
    filterMode: TextureFilterMode.TFM_BILINEAR,
    wrapMode: TextureWrapMode.TWM_CLAMP
  })
  Material.setPbrMaterial(entity, {
    texture,
    albedoColor: albedo,
    emissiveColor: emissive,
    emissiveIntensity: intensity,
    metallic: 0,
    roughness: 1,
    specularIntensity: 0,
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST,
    alphaTest: 0.15,
    castShadows: false
  })
  return entity
}

/** Recolor a panel without dropping its texture. */
export function tintFace(
  entity: ReturnType<typeof engine.addEntity>,
  albedo: Color4,
  emissive: Color3,
  intensity: number
) {
  const flat = Material.getFlatMutableOrNull(entity)
  if (!flat) return
  flat.albedoColor = albedo
  flat.emissiveColor = emissive
  flat.emissiveIntensity = intensity
}

export function makeRule(x: number, y: number, z: number, w: number, albedo: Color4, emissive: Color3, intensity: number) {
  return makeBox({ x, y, z }, { x: w, y: 0.07, z: 0.05 }, albedo, emissive, intensity)
}

export function paintSolid(
  entity: ReturnType<typeof engine.addEntity>,
  albedo: Color4,
  emissive: Color3,
  intensity: number
) {
  Material.setPbrMaterial(entity, {
    albedoColor: albedo,
    emissiveColor: emissive,
    emissiveIntensity: intensity,
    metallic: 0.18,
    roughness: 0.4
  })
}

/**
 * Studio shell. Albedo only, rough, no glow.
 * A large emissive surface blooms white and does not light its neighbors.
 */
export function paintMatte(entity: ReturnType<typeof engine.addEntity>, albedo: Color4) {
  Material.setPbrMaterial(entity, {
    albedoColor: albedo,
    emissiveColor: Color3.create(0, 0, 0),
    emissiveIntensity: 0,
    metallic: 0,
    roughness: 1,
    specularIntensity: 0,
    castShadows: false
  })
}

export function makeText(
  position: Vec,
  fontSize: number,
  color: Color4,
  opts?: {
    mono?: boolean
    serif?: boolean
    led?: boolean
    left?: boolean
    width?: number
    height?: number
    rotation?: Quaternion
    /** On-screen stroke. Drawn larger with `sharp`, then scaled back. */
    outlineWidth?: number
    /**
     * Draw the glyph this many times larger, then scale the entity down.
     * The letters stay the same size on the wall and the edge stays crisp.
     */
    sharp?: number
    /** Fit the words inside width and height, and keep them centered. */
    fit?: boolean
  }
) {
  const entity = engine.addEntity()
  const sharp = opts?.sharp ?? 1
  Transform.create(entity, {
    position,
    rotation: opts?.rotation ?? AUDIENCE_FACING,
    scale: { x: 1 / sharp, y: 1 / sharp, z: 1 }
  })
  const font = opts?.mono ? FONT_MONO : opts?.serif ? FONT_SERIF : FONT_SANS
  TextShape.create(entity, {
    text: '',
    fontSize: fontSize * sharp,
    font,
    textAlign: opts?.left ? ALIGN_LEFT : ALIGN_CENTER,
    width: (opts?.width ?? 10) * sharp,
    height: (opts?.height ?? 2) * sharp,
    textWrapping: false,
    fontAutoSize: opts?.fit ?? false,
    textColor: color,
    outlineWidth: (opts?.outlineWidth ?? 0.12) * sharp,
    outlineColor: { r: 0.02, g: 0.01, b: 0.03 }
  })
  return entity
}

export function setSign(entity: ReturnType<typeof engine.addEntity> | null, value: string, color?: Color4) {
  if (!entity || !TextShape.has(entity)) return
  const text = TextShape.getMutable(entity)
  if (text.text !== value) text.text = value
  if (color) text.textColor = color
}

export function moveNamed(name: string, position?: Vec, scale?: Vec) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity || !Transform.has(entity)) return entity
  const transform = Transform.getMutable(entity)
  if (position) transform.position = position
  if (scale) transform.scale = scale
  return entity
}

export function hideNamed(name: string) {
  moveNamed(name, undefined, { x: 0.01, y: 0.01, z: 0.01 })
}

export function setNamedText(name: string, value: string, color?: Color4) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity || !TextShape.has(entity)) return
  const text = TextShape.getMutable(entity)
  text.text = value
  if (color) text.textColor = color
}

/**
 * "Click me" without words: the pad breathes. Renderer-side yoyo tween, no per-frame scripting.
 */
export function breathe(entity: ReturnType<typeof engine.addEntity> | null, from: Vec, to: Vec, ms = 1400) {
  if (!entity || !Transform.has(entity)) return
  Tween.setScale(entity, Vector3.create(from.x, from.y, from.z), Vector3.create(to.x, to.y, to.z), ms, EasingFunction.EF_EASESINE)
  TweenSequence.create(entity, { sequence: [], loop: TweenLoop.TL_YOYO })
}

/**
 * Stage spotlight pointing straight down at (x, z).
 * Desktop now; some mobile clients ignore or reject LightSource — never throw,
 * or the rest of setupDailyWall / setupStage aborts and the gold pad never binds.
 */
export function spotlightDown(x: number, z: number, height: number, color: Color3, intensity = 6000, range = 12) {
  try {
    const entity = engine.addEntity()
    Transform.create(entity, {
      position: { x, y: height, z },
      rotation: Quaternion.fromEulerDegrees(90, 0, 0)
    })
    LightSource.create(entity, {
      type: LightSource.Type.Spot({ innerAngle: 18, outerAngle: 38 }),
      color,
      intensity,
      range
    })
    return entity
  } catch {
    return null
  }
}

/**
 * Eye-height sign: dark panel, gold rules, two posts to the floor.
 * Faces house (AUDIENCE_FACING). Text goes at z - 0.1 in front.
 * Optional `width` — daily uses a compact panel so it does not wall the aisle.
 * Draft A: no west-facing vestibule variant (Phase 2.4 invalid).
 */
export function makeSignPanel(
  x: number,
  z: number,
  centerY: number,
  height: number,
  glow: Color3,
  width: number = SIGN.w
) {
  const panel = makeBox({ x, y: centerY, z: z + 0.06 }, { x: width, y: height, z: 0.08 }, LOOK.ink, glow, 0.35)
  const top = centerY + height / 2
  const bottom = centerY - height / 2
  makeRule(x, top + 0.05, z, width + 0.1, LOOK.gold, GLOW.gold, 2.0)
  makeRule(x, bottom - 0.05, z, width + 0.1, LOOK.gold, GLOW.gold, 1.6)
  const postX = width / 2 + SIGN.postW / 2
  makeBox({ x: x - postX, y: top / 2, z: z + 0.06 }, { x: SIGN.postW, y: top, z: 0.1 }, LOOK.gold, GLOW.gold, 1.4)
  makeBox({ x: x + postX, y: top / 2, z: z + 0.06 }, { x: SIGN.postW, y: top, z: 0.1 }, LOOK.gold, GLOW.gold, 1.4)
  return panel
}
