# Layout vs DCL best practices (16 Oct)

**Trigger:** Spawn felt “sideways” after Phase 2.4 vestibule.  
**Ask:** Zoom out — consult DCL docs / sdk-skills, compare to our approach, name inconsistencies.  
**Canvas:** `layout-dcl-best-practices-audit.canvas.tsx`

---

## Verdict

Decentraland is behaving correctly. We pointed `cameraTarget` east (+X) at a west-facing daily. The avatar faces that vector. The show set, aisle, benches, and board all read along **+Z**. Feeling sideways relative to the room is the Phase 2.4 geometry working as coded — not a misread of TextShape, not a VirtualCamera bug.

The real inconsistency: **we left Draft A and built Draft C–style vestibule geometry while still calling it Draft A.**

---

## What DCL actually says

| Source | Rule |
|---|---|
| [Scene metadata](https://docs.decentraland.org/creator/scenes-sdk7/kinds-of-projects/scene-metadata) | `cameraTarget` = a **point**; player faces from `position` toward it. Example: spawn at (5,1,4) facing east toward (10,1,4). |
| [Spawn Areas](https://docs.decentraland.org/creator/scene-editor/build/spawn-areas) | Hub: Spawn Entity + Camera Target Entity. Visual first-look control. Steer first impression. |
| create-scene skill | Point `cameraTarget` at the scene’s **focal area**. Ranges: all of x/y/z are numbers or all are ranges. |
| camera-control skill | Spawn ≠ VirtualCamera. Cinematics = `VirtualCamera` + `MainCamera` (we already use this for show land only). |

There is **no** DCL API to “exclude” a distant prop from the first cone. Occlusion is placement, size, and depth — not a second look axis.

---

## Draft A (chosen) vs Phase 2.4 (shipped)

| | Draft A ([layout-drafts.md](layout-drafts.md)) | Phase 2.4 |
|---|---|---|
| Spawn | Center-low (~x 16, z 9–11) | West of east-edge daily (~x 21, z 10.5) |
| Daily | In spawn cone, short sign, faces house | East parcel edge, `DAILY_FACING` west |
| Look | Into the set (+Z), gold first by proximity | +X at gold; board forced out of cone |
| Story | Procession on one depth axis | Side vestibule → turn to enter show |

Phase 2.3 failed differently: `cameraTarget` too deep → **show-first**. Fix should have been closer target + compact offset daily on the **same** +Z axis. Instead Phase 2.4 rotated the cold path 90°.

---

## Inconsistencies (ranked)

1. **Plan drift** — Draft A chosen; Draft C geometry executed.  
2. **Wrong lever for occlusion** — rotated look axis instead of dress (shrink / stage-right offset / closer `cameraTarget`).  
3. **Orthogonal daily station** — rest of room uses `AUDIENCE_FACING`; daily alone uses `DAILY_FACING`.  
4. **Authoring gap** — docs prefer Hub Spawn Area visual; we only hand-edit `layout.ts` / `scene.json`.  
5. **Contract doc wrong** — [layout-spawn-contract.md](layout-spawn-contract.md) currently encodes the vestibule workaround as law.

Aligned (keep): pipeline freeze; show `VirtualCamera` separate from spawn; `SPAWN_DOC` mirrored in `scene.json`.

---

## Correct path — status

| Item | Status |
|---|---|
| Revert Phase 2.4 / `DAILY_FACING` | **Done** (16 Oct) |
| Draft A spawn contract (+Z) | **Done** — [layout-spawn-contract.md](layout-spawn-contract.md) |
| Execution runbook + DCL gates | **Done** — [layout-execute-draft-a.md](layout-execute-draft-a.md) |
| Preview: gold first, face into set | **Next** — Phase 2.3 resume |
| Wallpaper → dress only | If needed after Preview |
| Hub Spawn Area visual | Optional after numbers stabilize |
| True lobby = Draft C rename | Only if we change the plan on purpose |

Do not thaw claim / fulfill / letter / `facingSpinZ` for this.
