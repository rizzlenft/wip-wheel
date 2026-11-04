/**
 * Draft A centerline — matches the floor-plan diagram (board at +Z).
 * Authority: design/layout-drafts.md diagram → layout-mistakes.md look ray.
 *
 * Round room (layout-draft-round.md):
 *   z≈27.5  BOARD
 *   z≈24.0  P1 P2 P3 out from the board, clear of the wheel, room to stand behind
 *   z≈18.6  big wheel, horizontal, face up
 *   ring r≈6   four seats N/E/S/W facing the hub (south seat is the spawn side)
 *   z≈10.2  small daily wheel stage-right of the aisle (x≈19.2)
 *   z≈8     spawn on the aisle (x=16), look +Z
 */

/** Shared show wheel. Flat face-up disc, low so a seated player looks onto it. */
export const WHEEL = { x: 16, y: 0.62, z: 18.6 }

/**
 * +90° X lays the vertical disc flat with the textured face pointing up.
 * −68° was still a tilt toward the board. facingSpinZ stays local Z on WheelRoot.
 */
export const WHEEL_RAKE_DEG = 90
/** Disc mesh is already scale 4. 1.8 → about 7.2 m across. */
export const WHEEL_SCALE = 1.8

/**
 * Contestant row, facing −Z (at the wheel).
 * Wheel face reaches z≈22.2 (center 18.6, radius 3.6). Podium front at this z is ≈23.7, so about 1.5 m of air.
 * Board is z≈27.55, so about 3 m behind the desk for a contestant.
 */
export const CONTESTANTS = [
  { x: 12.6, z: 24.0 },
  { x: 16, z: 24.0 },
  { x: 19.4, z: 24.0 }
] as const

export const SHOW_PAD = CONTESTANTS[0]

/**
 * Footprint of the removed show desks. The GLB is not spawned.
 * The spin volume still uses this shell so pad 1 stays where it was.
 * Native size about 1.01 × 1.01 × 0.43 m, drawn at scale 1.5.
 */
export const SHOW_PODIUM = {
  scale: 1.5,
  halfX: 0.5033,
  halfY: 0.5039,
  halfZ: 0.2145
}

/** Gold daily — stage-right of the aisle so the walk at x=16 stays open. */
export const DAILY_PAD = { x: 19.2, z: 10.2 }

/**
 * Spin reach for the pedestal only.
 * Spawn (16, 8) is 3.9 m from this pad. The near edge of the spawn area
 * is still about 3 m out. A 16 m click and a 3 m no-aim bubble armed the
 * daily as you arrived.
 */
export const DAILY_REACH = {
  /** Aimed click. Feet to the stone, not from the aisle. */
  click: 2.2,
  /** Press without aiming. Only while standing at the pedestal. */
  proximity: 1.5
} as const

/**
 * Ritual pedestal, measured. Pivot is the model origin, just under the base.
 * Native size 2.83 × 2.77 × 2.97 m. Feet sit on the floor at originY.
 * Scale 0.43 puts the rim near 1.2 m so a standing camera looks down onto the wheel.
 * Yaw 180 turns local +Z toward spawn. The disc lies above the rim, face up.
 * World disc ≈ holeDiameter × 0.97 × scale ≈ 0.66 m.
 */
export const DAILY_CABINET = {
  scale: 0.43,
  originY: 0.02,
  /** Local Y of the raised stone rim. The red arrow clears this. */
  rimY: 2.74,
  hole: { x: 0, y: 2.8, z: 0 },
  holeDiameter: 1.582
}

/**
 * Navy plaque center, signed off on the old cabinet.
 * Old top was halfH 0.502 × scale 2.2 × 2, then +1.905. Do not recompute from the pedestal.
 */
export const DAILY_PLAQUE_Y = 0.502 * 2.2 * 2 + 1.905

/**
 * Daily spin camera. Same kind of lock as the show: up and back, freeze walk, hold after land.
 * Not SHOW_CAM. Distance is sized to the cabinet, not the 7 m show disc.
 */
export const DAILY_CAM = {
  above: 1.45,
  towardSpawn: 1.7,
  fov: 26,
  transitionSec: 0.4,
  holdAfterLand: 1.4
}
export const DAILY_SIGN = { x: 19.2, z: 11.15 }

/** Compact gold disc — HIT volume stays full size for easy spawn clicks. */
export const DAILY_DISC = { w: 1.15, h: 0.3 }

/** Compact eye-height panel — short so it does not wall the PHRASE grid. */
export const DAILY_SIGN_PANEL = { w: 1.85, h: 1.45, centerY: 1.45 }

export const BOARD = { x: 16.0, z: 27.55 }

/**
 * Title card. Art is assets/Images/show-banner.png at 1024×512, so width/height stays 2
 * and the picture is not stretched. Bottom stays at 8.025, above the puzzle.
 * The poster itself carries the logo, the Thursday line, DEMO NOW, and the Discord address.
 */
export const BANNER = { x: 16.0, y: 11.825, z: 27.85, w: 15.2, h: 7.6 }

/** Game strip under the puzzle: letters + three contestant scores. */
export const STRIP = { x: 16.0, y: 2.12, z: 27.15, w: 15.2, h: 2.72 }

/** Visual disc for show pads. Clicking uses HIT, not this mesh. */
export const PAD = {
  w: 2.2,
  y: 0.48,
  h: 0.42,
  labelY: 1.48
}

/** Tall pointer-only volume over each pad. Avatar distance, not camera. */
export const HIT = {
  w: 2.6,
  y: 1.1,
  h: 2.0
}

/**
 * Show spin only while standing at podium 1. The wheel face is not a button.
 *
 * The click box wraps the podium shell plus a short stand pocket. Cursor range is
 * feet → hit point, not a sphere from the camera
 * (add-interactivity: maxDistance is the avatar root). A chest-high hit is about
 * 1.25 m above the feet, so 1.55 m leaves ~0.9 m of horizontal room and stops
 * on the wheel rim (z 22.2) and at podium 2.
 */
const SHOW_PODIUM_HALF_X = SHOW_PODIUM.halfX * SHOW_PODIUM.scale
const SHOW_PODIUM_HALF_Z = SHOW_PODIUM.halfZ * SHOW_PODIUM.scale
const STAND_TOWARD_WHEEL = 0.55
const STAND_TOWARD_BOARD = 0.7
const STAND_AWAY_AISLE = 0.7
const STAND_TOWARD_AISLE = 0.45

export const SHOW_STAND = {
  reach: 1.55,
  volume: {
    x: SHOW_PAD.x + (STAND_TOWARD_AISLE - STAND_AWAY_AISLE) / 2,
    y: 1.1,
    z: SHOW_PAD.z + (STAND_TOWARD_BOARD - STAND_TOWARD_WHEEL) / 2,
    w: SHOW_PODIUM_HALF_X * 2 + STAND_AWAY_AISLE + STAND_TOWARD_AISLE,
    h: 1.6,
    d: SHOW_PODIUM_HALF_Z * 2 + STAND_TOWARD_WHEEL + STAND_TOWARD_BOARD
  }
}

/**
 * Studio benches — one house band under the pad row.
 * left/right centers + studio.ts scale leave a walk gap on x=16.
 */
export const AUDIENCE = {
  left: 11.4,
  right: 20.6,
  z: 13.4,
  backZ: 12.7,
  riserZ: 13.1,
  /** Sit cue on the aisle, in front of the wheel */
  labelX: 16,
  labelY: 1.4,
  labelZ: 11.2
}

/**
 * House-side arc. Seat look direction is +Z at yaw 0 (backrest sits at −Z).
 * That is the opposite of a sign: signs show their face toward −Z.
 * `benchYawTowardBoard` aims that +Z axis at the board, across the wheel.
 */
export const HOUSE = [
  { bench: 'BenchRow2L', back: 'BenchBack2L', x: 10.2, z: 15.8 },
  { bench: 'BenchL', back: 'BenchBackL', x: 13.4, z: 12.3 },
  { bench: 'BenchR', back: 'BenchBackR', x: 18.6, z: 12.3 },
  { bench: 'BenchRow2R', back: 'BenchBack2R', x: 21.8, z: 15.8 }
] as const

/**
 * Tower speakers, 0.9 × 2.9 × 0.9 m, feet on the floor, cones on local +Z.
 * Yaw 90 faces +X (the left stack looks at the wheel). Yaw 270 faces −X.
 * No texture. They stay while the studio kit is built.
 */
export const SPEAKER = [
  { x: 5.2, z: 20.8, yaw: 90 },
  { x: 26.8, z: 20.8, yaw: 270 }
] as const

/** Degrees. yaw 0 = look +Z. +90 = look +X. Matches a left-hand Y turn of the +Z axis. */
export function benchYawTowardBoard(x: number, z: number): number {
  return (Math.atan2(BOARD.x - x, BOARD.z - z) * 180) / Math.PI
}

/**
 * Sit-spot offsets — mirror Creator Hub smart_items Seat.ts / classic_bench.
 */
export const SIT_SPOT = {
  /**
   * Cushion centers of audience-row.glb, local +X.
   * Four pans between the armrests at about ±1.74, ±0.88, and 0.
   * Feet stay at y 0. panZ is local +Z, toward the board, on the seat pan.
   */
  cushions: [-1.31, -0.44, 0.44, 1.31],
  panZ: 0.15,
  /** Visible row is 3.6 × 1.05 × 1.05. The prompt box matches that, centered on the model. */
  hit: { x: 3.6, y: 1.05, z: 1.05 },
  hitY: 0.52,
  standUpDistance: 1.5,
  /** Hover and click. BenchR is ~2.2 m from the cabinet, so 1.7 stays on the row. */
  reach: 1.7
}

export const SIGN = {
  w: 3.4,
  postW: 0.1
}

export const STAGE = { x: 16.0, y: 0.1, z: 18, w: 20, d: 16 }
/**
 * Legacy Hub bar — DO NOT place full-width (blocks center aisle).
 * Kept for reference; countdown hideNamed('NeonFront'). Use AudienceNeonL/R only.
 */
export const NEON_FRONT = { x: 16.0, y: 0.2, z: 13.6, w: 14.0 }
export const BACKDROP = { x: 16.0, y: 5.55, z: 28.55, w: 16.8, h: 10.9 }

/**
 * Studio shell. Primitives only. Does not move the wheel, pads, plaque, or spawn.
 * Posts sit outside the puzzle frame (about x 7.5–24.5). Wings sit outside the speakers.
 * The ring is outside the 3.6 m wheel. Chairs sit on the stage, back toward the board.
 */
export const STUDIO_SHELL = {
  wingX: 6.5,
  wing: { y: 5.19, z: 25.6, w: 0.45, h: 10, d: 8.2 },
  postX: 7.05,
  post: { y: 11.1, z: 27.25, t: 0.36, h: 10.2 },
  trussTop: { y: 16.36, z: 27.25, w: 18.3, h: 0.32, d: 0.36 },
  rail: { y: 15.98, z: 27.05, w: 18.3, h: 0.1, d: 0.12 },
  ring: { radius: 4.15, segments: 12, y: 0.2, length: 1.9, width: 0.2, height: 0.05 },
  /** Local to each contestant pad. +Z is toward the board. */
  chair: { seatZ: 0.22, backZ: 0.56 }
} as const

export const SHOW_CAM = {
  offsetX: 0.2,
  offsetY: 8.4,
  offsetZ: -6.4,
  fov: 46,
  transitionSec: 0.4,
  holdAfterLand: 0.45
}

/** VirtualCamera while the letter pad is open — puzzle + strip in frame. */
export const BOARD_CAM = {
  offsetX: 0,
  offsetY: 4.2,
  offsetZ: -6.5,
  lookX: 16,
  lookY: 2.8,
  lookZ: 27.15,
  transitionSec: 0.35,
  fov: 52
} as const

/**
 * Spawn stays on the aisle. Daily is stage-right of this ray, not on it.
 * Look: Δx = 0, Δz = 10, into the wheel (not the board).
 */
export const SPAWN_DOC = {
  x: 16,
  z: 8,
  xBand: 0.7,
  zBand: 0.55,
  cameraTarget: {
    x: 16,
    y: 3.0,
    z: 18
  }
}
