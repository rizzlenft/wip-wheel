import { engine, ColliderLayer, Material, MeshCollider, MeshRenderer, TextShape, Transform } from '@dcl/sdk/ecs'
import { Color3, Color4 } from '@dcl/sdk/math'
import { AUDIENCE_FACING } from './facing'

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

export type Vec = { x: number; y: number; z: number }

const marqueeBulbs: ReturnType<typeof engine.addEntity>[] = []
let marqueeTime = 0
let marqueeOn = false

export function makeBox(position: Vec, scale: Vec, albedo: Color4, emissive: Color3, intensity: number) {
  const entity = engine.addEntity()
  Transform.create(entity, { position, scale, rotation: AUDIENCE_FACING })
  MeshRenderer.setBox(entity)
  paintSolid(entity, albedo, emissive, intensity)
  return entity
}

export function makeColliderBox(position: Vec, scale: Vec, albedo: Color4, emissive: Color3, intensity: number) {
  const entity = makeBox(position, scale, albedo, emissive, intensity)
  MeshCollider.setBox(entity, ColliderLayer.CL_POINTER)
  return entity
}

export function makeClickVolume(position: Vec, scale: Vec) {
  const entity = engine.addEntity()
  Transform.create(entity, { position, scale, rotation: AUDIENCE_FACING })
  MeshCollider.setBox(entity, ColliderLayer.CL_POINTER)
  return entity
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

export function makeText(
  position: Vec,
  fontSize: number,
  color: Color4,
  opts?: { mono?: boolean; serif?: boolean; led?: boolean; width?: number; height?: number }
) {
  const entity = engine.addEntity()
  Transform.create(entity, { position, rotation: AUDIENCE_FACING })
  const font = opts?.mono ? FONT_MONO : opts?.serif ? FONT_SERIF : FONT_SANS
  TextShape.create(entity, {
    text: '',
    fontSize,
    font,
    textAlign: ALIGN_CENTER,
    width: opts?.width ?? 10,
    height: opts?.height ?? 2,
    textWrapping: false,
    textColor: color,
    outlineWidth: opts?.led ? 0.07 : 0.1,
    outlineColor: opts?.led
      ? { r: 0.55, g: 0.32, b: 0.04 }
      : { r: 0.12, g: 0.06, b: 0.02 }
  })
  return entity
}

export function setSign(entity: ReturnType<typeof engine.addEntity> | null, value: string, color?: Color4) {
  if (!entity || !TextShape.has(entity)) return
  const text = TextShape.getMutable(entity)
  text.text = value
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

export function marqueeRect(cx: number, cy: number, cz: number, w: number, h: number, spacing = 0.4) {
  const left = cx - w / 2
  const right = cx + w / 2
  const top = cy + h / 2
  const bottom = cy - h / 2
  for (let x = left; x <= right + 0.01; x += spacing) {
    addBulb(x, top, cz)
    addBulb(x, bottom, cz)
  }
  for (let y = bottom + spacing; y < top - 0.04; y += spacing) {
    addBulb(left, y, cz)
    addBulb(right, y, cz)
  }
}

function addBulb(x: number, y: number, z: number) {
  marqueeBulbs.push(makeBox({ x, y, z }, { x: 0.13, y: 0.13, z: 0.09 }, LOOK.gold, GLOW.gold, 1.8))
}

export function setupMarquee() {
  if (marqueeOn) return
  marqueeOn = true
  engine.addSystem((dt) => {
    marqueeTime += dt
    for (let i = 0; i < marqueeBulbs.length; i++) {
      const wave = Math.sin(marqueeTime * 9 - i * 0.45) * 0.5 + 0.5
      paintSolid(marqueeBulbs[i], LOOK.gold, GLOW.gold, 0.4 + wave * 2.2)
    }
  })
}
