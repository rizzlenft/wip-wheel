# Layout spawn mistakes — closed gaps (stop the circle)

**Read before any `layout.ts` / `scene.json` spawn edit.**  
Companion: [layout-execute-draft-a.md](layout-execute-draft-a.md) · [layout-spawn-contract.md](layout-spawn-contract.md) · [layout-baseline.md](layout-baseline.md) Phase 2.1

---

## The critical wrong approach

We treated `cameraTarget` like a **Photoshop crop** (“point at the thing I want big; hope the rest looks right”).

DCL only gives a **look vector**: from spawn `position` → `cameraTarget`. Whatever that ray aims at fills the first frame. Whatever sits **off** that ray disappears (empty sky) or stacks **on** that ray (wallpaper).

**Invariant (never violate):**

```
look ray ≈ procession axis (+Z into the set)
gold sits NEAR on that ray (large in FOV)
board / wheel sit FAR on that same ray (peek / destination)
```

If the ray aims **at gold from the side** (center spawn → stage-right gold), the set is **behind your left shoulder**. Screenshot looks like “everything deleted.” It is not. Walk +Z or fix the ray.

---

## Mistake log (16 Oct circle)

| # | What we did | What the shot showed | Actual cause | Lesson locked |
|---|---|---|---|---|
| 1 | `cameraTarget` deep on board | Show-first three-column | Ray through set, gold small | Don’t aim at `BOARD` for cold path |
| 2 | Phase 2.4 look **+X** + `DAILY_FACING` | Sideways vestibule | Left Draft A for Draft C geometry | Never rotate cold path 90° |
| 3 | Spawn **same x** as gold, target on gold | Daily walls PHRASE | Gold + board stacked on +Z ray | Offset gold stage-right; don’t put spawn on gold’s x if that centers the wall |
| 4 | Spawn **center x16**, target on gold **x22** | Empty sky + pink pad only | Look mostly **+X toward gold** — set off-ray | **This shot.** Same class as Phase 2.1 false empty set |
| 5 | Panic-reinterpret empty sky as “wrong draft / missing Hub” | More layout churn | Set still there; FOV wrong | `floor health` + walk +Z before any new theory |
| 6 | Scored wheel-left + gold-right as “Draft A pass” | In-world ≠ diagram | Occlusion workaround replaced the centerline plan | Diagram is the layout: board → wheel → P1–P3 → benches → daily → spawn, all on x≈16 |

Mistakes 3 and 4 are **opposites**. Chasing both without the invariant = infinite loop.

---

## What Draft A actually requires (geometry, not vibes)

From [layout-drafts.md](layout-drafts.md) + DCL spawn docs:

1. **Habit first** — gold large in first FOV.  
2. **Procession** — after claim, walk +Z into seats / pads / wheel / board.  
3. **One depth axis** — not a side lobby.

Those three are the **centerline diagram** (16 Oct — user floor plan). Stage-right gold + stage-left wheel was an occlusion workaround and is **not** Draft A.

| Piece | Value |
|---|---|
| Spawn | South of gold, **same x** as gold (centerline) |
| Daily | **On x=16**, between spawn and benches, compact, `AUDIENCE_FACING` |
| Wheel / pads / benches | Stacked on that same x, wheel behind the pad row |
| `cameraTarget` | **Past** gold into the set (z≈18) — **not** on gold feet, **not** on `BOARD` |

```text
SPAWN      ≈ (DAILY_PAD.x - 1.0 … 1.5,  DAILY_PAD.z - 2.5)
cameraTarget ≈ (lerp toward BOARD.x,  y≈2.8–3.2,  z≈18–22)
```

Gold is close on the ray → dominates. Set is far on the ray → peeks. Face stays into the room.

---

## Pre-flight (mandatory before editing spawn)

Answer in the PR / chat note. If you cannot, do not edit.

1. **Look vector:** From `SPAWN_DOC` to `cameraTarget`, is Δz the largest horizontal component? (Must be mostly +Z.)  
2. **On-ray props:** Is gold nearer than board on that vector?  
3. **Off-ray trap:** Would someone standing at spawn looking at target have the board **beside** them rather than ahead?  
4. **False empty set:** If Preview shows only daily + pink boxes → check `[WIP] floor health`, walk +Z, compare to Phase 2.1 — **do not** invent a new axis.  
5. **DCL doc:** [Scene metadata](https://docs.decentraland.org/creator/scenes-sdk7/kinds-of-projects/scene-metadata) — `cameraTarget` is a point you face, not a framing rectangle.

---

## Forbidden “fixes” (already failed)

- Look +X / `DAILY_FACING` vestibule  
- `cameraTarget` = gold feet only (y≈1.4, z≈ pad)  
- `cameraTarget` = `BOARD`  
- Spawn at house center while gold is far stage-right and target = gold  
- VirtualCamera to “fix” spawn  
- Thawing claim/spin because the set “vanished”

---

## After a bad Preview

1. Log which mistake # (table above) it matches.  
2. Compare the shot to the centerline diagram — do not “fix” by sliding gold stage-right again.  
3. Update this file if a **new** failure mode appears.  
4. One concern per Preview. Stop.
