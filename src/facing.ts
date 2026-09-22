import { Quaternion } from '@dcl/sdk/math'

/**
 * Audience stands at low Z and looks toward +Z (the back wall).
 *
 * TextShape and MeshRenderer planes both face that audience at identity.
 * Y=180 shows the back face and mirrors every glyph and texture.
 * Use this quaternion for every new sign, banner, wheel face, and puzzle tile.
 */
export const AUDIENCE_FACING = Quaternion.Identity()

export function facingSpinZ(degrees: number) {
  return Quaternion.multiply(AUDIENCE_FACING, Quaternion.fromEulerDegrees(0, 0, degrees))
}
