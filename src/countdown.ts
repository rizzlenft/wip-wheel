import { engine, Material, MeshRenderer, TextureFilterMode, TextureWrapMode, Transform } from '@dcl/sdk/ecs'
import { Color3, Color4 } from '@dcl/sdk/math'
import { openExternalUrl } from '~system/RestrictedActions'
import { AUDIENCE_FACING } from './facing'
import { GLOW, LOOK, hideNamed, makeClickVolume, moveNamed, paintSolid } from './look'
import { parseLastSpins } from './history'
import { BACKDROP, BANNER, STAGE } from './layout'
import { DISCORD_URL } from './week'
import { bindUse, physicsOnly } from './interact'
import { setupScoreboard } from './scoreboard'

/** 1024×512. Plane width/height is 2, so this maps without stretching. */
const BANNER_ART = 'assets/Images/show-banner.png'
const BANNER_ART_ASPECT = 2
/** Shown on the wall. The click still opens the https URL. */
const DISCORD_LINE = 'discord.gg/bTjc6k5uss'

export {
  setPlayerOne,
  setPlayerTwo,
  setPlayerThree,
  setShowPlay,
  setShowStats,
  syncShowBoard
} from './scoreboard'


export function setupShowWall() {
  dressSet()
  buildTitleCard()
  setupScoreboard()
}

export function setCrowdLine(_count: number) {}

function dressSet() {
  // Extents from layout.ts so Draft A depth moves keep the floor under stations.
  moveNamed(
    'Backdrop',
    { x: BACKDROP.x, y: BACKDROP.y, z: BACKDROP.z },
    { x: BACKDROP.w, y: BACKDROP.h, z: 0.32 }
  )
  const backdrop = engine.getEntityOrNullByName('Backdrop')
  if (backdrop) paintSolid(backdrop, LOOK.navy, GLOW.ink, 0.55)
  // The live poster is show-banner.png. The Hub Banner used to sample banner.png
  // (2048, albedo and emissive). Shrink it and paint it flat so that file is unused.
  hideNamed('Banner')
  const banner = engine.getEntityOrNullByName('Banner')
  if (banner) paintSolid(banner, LOOK.navy, GLOW.ink, 0)
  moveNamed('Stage', { x: STAGE.x, y: STAGE.y, z: STAGE.z }, { x: STAGE.w, y: 0.14, z: STAGE.d })
  // Full-width NeonFront spans the center aisle (Hub mockup + Draft A want that gap open).
  // Seat-edge glow is AudienceNeonL/R only — see design/layout-hub-vs-live.md.
  hideNamed('NeonFront')
  hideNamed('WingLeft')
  hideNamed('WingRight')
  hideNamed('Bezel')
  hideNamed('CrowdText')
  hideNamed('Ticker')
  hideNamed('NeonLeft')
  hideNamed('NeonRight')
  physicsOnly('Backdrop')
  physicsOnly('Stage')
  physicsOnly('Floor')
}

/**
 * The marquee is one picture: logo, Thursday line, demo line, and the Discord address.
 * A navy plate on top of it was the dull part. Click still opens the link.
 * Scene textures top out at 1024, and this file is 1024×512 so the 2:1 wall does not stretch it.
 */
function buildTitleCard() {
  const { x, y, z, w, h } = BANNER
  const art = engine.addEntity()
  Transform.create(art, {
    position: { x, y, z },
    scale: { x: w, y: h, z: 1 },
    rotation: AUDIENCE_FACING
  })
  MeshRenderer.setPlane(art)
  const texture = Material.Texture.Common({
    src: BANNER_ART,
    wrapMode: TextureWrapMode.TWM_CLAMP,
    filterMode: TextureFilterMode.TFM_BILINEAR,
    tiling: { x: w / h / BANNER_ART_ASPECT, y: 1 }
  })
  paintBanner(art, texture)

  const hit = makeClickVolume({ x, y, z: z - 0.2 }, { x: w, y: h, z: 0.3 })
  bindUse(hit, DISCORD_LINE, openDiscord, 24, false, 1, true)
}

function paintBanner(entity: ReturnType<typeof engine.addEntity>, texture: ReturnType<typeof Material.Texture.Common>) {
  Material.setPbrMaterial(entity, {
    texture,
    emissiveColor: Color3.create(0, 0, 0),
    emissiveIntensity: 0,
    albedoColor: Color4.create(1, 1, 1, 1),
    metallic: 0,
    roughness: 1,
    specularIntensity: 0,
    castShadows: false
  })
}

function openDiscord() {
  void openExternalUrl({ url: DISCORD_URL })
}

export function lastSpinLine(history: string, fallback: string) {
  const rows = parseLastSpins(history)
  if (rows.length === 0) return fallback
  return `${rows[0].winner.toUpperCase()}  ·  ${rows[0].prize}`
}
