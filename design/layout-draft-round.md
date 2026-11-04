# Draft — wheel in the round (16 Oct)

**Replaces** the “tall disc in front of the board” pose. The centerline *method* stays: one look ray, meters in `layout.ts`, one Preview per pass.  
**Proven already:** `WheelPitch` tips the disc and `facingSpinZ` still spins `WheelRoot` on local Z. The −25° Preview is that mechanism, not this room.

Spawn shot (16 Oct 10:55): top tips toward the house; the stand stays upright; the disc still covers the phrase. That is what −25° was built to do. The side shot is the same pose. It is not the layout below.

---

## The room

```
 z high   [ PUZZLE BOARD ]
          [ P1 ] [ P2 ] [ P3 ]     in front of the board, facing the wheel (−Z)
          ( BIG WHEEL — low, nearly flat, large )
          [ bench ] [ bench ]      back row
          [ bench ] [ bench ]      front row, angled around the wheel, facing the podiums
 z low    ★ spawn on the aisle
          small raked DAILY wheel, just stage-right, obvious to spin
```

The show wheel is **horizontal, face up** (`WHEEL_RAKE_DEG = 90` on `WheelPitch` only). `WHEEL.y` is low (`0.62`). Camera offsets stay as they are.

Four seats, one row, on the house side of the wheel (south and both flanks). A bench is not a sign: at yaw 0 it looks **+Z** and the backrest is at **−Z**. `benchYawTowardBoard` aims that +Z across the wheel at the board. Sit spots use that same basis, feet at y 0, and look at the board.

Daily uses the same parent: an X pitch of **+68** (same sign as the show wheel’s +90, stopped short of flat so the face leans toward spawn / −Z). `spinDailyWheel` runs only when `setWheelAngle` is in daily mode. Copy sits in front of the disc, toward spawn. No gold panel, no floor slab.

---

## How to build it without breaking pipelines

Server claim, prize tables, letter pad, and `facingSpinZ` stay. The scene only moves meshes and writes the same spin angle.

| Piece | Safe lever | Breaks if |
|---|---|---|
| Big wheel flat + low + large | `WHEEL_RAKE_DEG = 90` on `WheelPitch` only (face up). `WHEEL.y = 0.62`. Scale stays `WHEEL_SCALE`. Spin stays `facingSpinZ` on `WheelRoot` | You bake the tip into `facingSpinZ` or spin around Y |
| Stand | Move it under the hub and shorten it in the **same** pass. Today it is not parented to the pitch, which is why the side shot shows a vertical post beside a tipped disc | Leave it and the platter floats off the pole |
| Nobody stands on the wheel | Disc / `WheelHit` stay **pointer-only**. A physics face at ankle height becomes a floor | Add `CL_PHYSICS` on the flat disc |
| Podiums | Move `CONTESTANTS` up toward the board, still facing −Z (that already faces the wheel once the wheel is on the house side of them). Pad 1 click stays `SHOW_PAD` | Rename pads or retarget the show click |
| Benches, one house-side row | `HOUSE` positions. Yaw from `benchYawTowardBoard` — a bench looks +Z at yaw 0; the sign yaw table points the other way. Sit spots and the click box use that same yaw. Feet stay y 0. Look target is the board | Apply the sign-facing yaw to a bench |
| Small daily wheel | Same parent as the show wheel: X pitch **+68** (same sign as +90, face leans toward spawn). `spinDailyWheel` only when mode is daily. Copy in front of the disc, toward spawn. Claim code untouched | A second prize roll, or writing daily spin onto `WheelRoot` |
| Board | Leave the slab until the flat wheel is in place and you sit. Then separate phrase / letters / scores only if the seats still cannot read the puzzle | Rebuild the board before the wheel has moved |

---

## Order (one Preview each)

1. **Flat show wheel** — rake, height, scale, stand under the hub, podiums between board and wheel. Spin a daily and a pad-1. Phrase visible beside/above the wheel, not through it.
2. **House** — unhide row 2, angle both rows, fix sit spots and facing. Walk off still stands you up.
3. **Small daily wheel** stage-right of the aisle. Same spin angle on a daily spin. Aisle at x=16 stays empty.
4. **Board** only if a seated screenshot still cannot show the whole phrase.

Do not start 2–4 until 1 has been looked at in Preview.
