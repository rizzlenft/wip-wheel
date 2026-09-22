import { Billboard, engine, TextShape, Transform } from '@dcl/sdk/ecs'
import { GLOW, LOOK, hideNamed, makeText, moveNamed, paintSolid, setNamedText, setSign } from './look'

const SHOW_X = 12.35
const SHOW_Z = 22.15

export function setupStage() {
  hideNamed('HostPad')
  hideNamed('HostLabel')
  hideNamed('Seat1Label')
  hideNamed('Seat2Label')
  hideNamed('Seat3Label')
  hideNamed('Seat2')
  hideNamed('Seat3')

  moveNamed('SpinGlow', { x: SHOW_X, y: 0.16, z: SHOW_Z }, { x: 2.6, y: 0.06, z: 2.6 })
  moveNamed('PodiumBase', { x: SHOW_X, y: 0.3, z: SHOW_Z }, { x: 1.9, y: 0.24, z: 1.9 })
  moveNamed('SpinButton', { x: SHOW_X, y: 0.95, z: SHOW_Z }, { x: 1.7, y: 1.3, z: 1.7 })
  moveNamed('SpinLabel', { x: SHOW_X, y: 2.28, z: SHOW_Z })

  setNamedText('SpinLabel', 'SHOW', LOOK.cream)
  const spinLabel = engine.getEntityOrNullByName('SpinLabel')
  if (spinLabel && TextShape.has(spinLabel)) {
    const text = TextShape.getMutable(spinLabel)
    text.fontSize = 2.4
    text.font = 1
    text.outlineWidth = 0.3
    text.textColor = LOOK.cream
  }
  if (spinLabel && Transform.has(spinLabel)) {
    Billboard.createOrReplace(spinLabel, { billboardMode: 2 })
  }

  const hint = makeText({ x: SHOW_X, y: 1.82, z: SHOW_Z }, 0.85, LOOK.gold, { width: 4.6, height: 0.4 })
  Billboard.create(hint, { billboardMode: 2 })
  setSign(hint, 'PLAY THE WHEEL')

  glow('SpinGlow', LOOK.magenta, GLOW.magenta, 1.9)
  glow('PodiumBase', LOOK.magenta, GLOW.magenta, 1.35)
  glow('SpinButton', LOOK.magenta, GLOW.magenta, 1.7)
}

function glow(name: string, albedo: typeof LOOK.magenta, emissive: typeof GLOW.magenta, intensity: number) {
  const entity = engine.getEntityOrNullByName(name)
  if (!entity) return
  paintSolid(entity, albedo, emissive, intensity)
}
