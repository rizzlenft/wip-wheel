# Spawn / first-look contract (Draft A)

**Authority:** [layout-mistakes.md](layout-mistakes.md) (read first) · [layout-execute-draft-a.md](layout-execute-draft-a.md)  
**DCL:** [Scene metadata](https://docs.decentraland.org/creator/scenes-sdk7/kinds-of-projects/scene-metadata) · [Spawn Areas](https://docs.decentraland.org/creator/scene-editor/build/spawn-areas)  
**Numbers:** `src/layout.ts` `SPAWN_DOC` ↔ `scene.json`

---

## Invariant (non-negotiable)

`cameraTarget` defines a **look ray**, not a crop.

```
spawn → cameraTarget  must be mostly +Z into the set
gold NEAR on that ray  → large in first FOV
board / wheel FAR on that ray → peek / destination
```

Violating this caused: sideways vestibule, daily wallpaper, **and** empty-sky false deletes. Details: [layout-mistakes.md](layout-mistakes.md).

---

## Locked recipe (Phase 2.1 + 2.3)

| Piece | Rule |
|---|---|
| Daily | **Centerline x=16** (diagram), compact, `AUDIENCE_FACING` |
| Spawn | South of gold, **same x** as gold |
| Wheel / pads | Centered on x=16; wheel behind the pad row (rake later) |
| `cameraTarget` | **Past** gold into the set: y≈3, z≈18 (pads), x = centerline |

Derived:

```text
SPAWN.x        = DAILY_PAD.x          // centerline, same x as gold
SPAWN.z        ≈ DAILY_PAD.z - 2.6
cameraTarget.x = (DAILY_PAD.x + BOARD.x) / 2     // x=16
cameraTarget.y ≈ 3.0
cameraTarget.z ≈ 18                              // past gold, at the pad row — NOT gold feet, NOT BOARD
```

Pre-flight: Δz of (target − spawn) must dominate |Δx|. If |Δx| > Δz, you are repeating mistake #4.

---

## Invalid (do not reintroduce)

| Pattern | Mistake # |
|---|---|
| Look +X / `DAILY_FACING` | 2 |
| `cameraTarget` on `BOARD` | 1 |
| `cameraTarget` on gold feet only | 2.1 / 5 |
| Spawn center x16 + target on gold x22 | 4 |
| Same-x spawn + target on gold (full wall) | 3 |

---

## Pipeline freeze

No claim / fulfill / letter / `facingSpinZ` while tuning spawn.  
WEARABLE → [fulfill-verify.md](fulfill-verify.md).

---

## Preview gate

1. Full quit Preview.  
2. Gold large; **board or wheel visible ahead** (peek OK).  
3. If only daily + pink boxes → `floor health` + walk +Z — do **not** change axis (mistake #5).  
4. Hover daily; walk aisle → sit / pad 1.  
5. `spawnDoc` matches `scene.json`.
