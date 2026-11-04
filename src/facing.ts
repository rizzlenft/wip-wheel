import { Quaternion } from '@dcl/sdk/math'

/**
 * Audience stands at low Z and looks toward +Z (the back wall).
 *
 * TextShape and MeshRenderer planes both face that audience at identity.
 * Y=180 shows the back face and mirrors every glyph and texture.
 * Use this quaternion for every new sign, banner, wheel face, and puzzle tile.
 */
export const AUDIENCE_FACING = Quaternion.Identity()

/** Wheel spin angle in degrees, always in [0, 360). Keeps prize math and visuals aligned. */
export function normalizeSpinDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

/**
 * Spin the wheel in the plane of the disc (local Z). Always normalize the angle:
 * `fromEulerDegrees(0, 0, 1800)` is the same pose as 0° but returns w = -1, and the
 * renderer can treat that as the back face — mirrored slice labels on the texture.
 */
export function facingSpinZ(degrees: number) {
  const norm = normalizeSpinDegrees(degrees)
  return Quaternion.multiply(AUDIENCE_FACING, Quaternion.fromEulerDegrees(0, 0, norm))
}
