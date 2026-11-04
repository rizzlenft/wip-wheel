# Execute Draft A — locked runbook (no guesswork)

**Authority order (if anything conflicts, higher wins):**

1. [positioning.md](positioning.md) — how DCL space / Transform / facing works  
2. [layout-mistakes.md](layout-mistakes.md) — look-ray invariant; mistake log  
3. This file — *how* we execute Draft A  
4. [layout-drafts.md](layout-drafts.md) — *what* Draft A is  
5. [layout-spawn-contract.md](layout-spawn-contract.md) — spawn / `cameraTarget` math  
6. [layout-draft-a-plan.md](layout-draft-a-plan.md) — phase history + gates

**Not Draft A:** east vestibule, look **+X**, center-spawn→far-gold (empty sky). **Invalid.**

---

## Locked geometry (Draft A)

Depth axis = **+Z toward board**. House faces **−Z** (`AUDIENCE_FACING`). Every station faces the house unless Hub art says otherwise.

```
z≈29.5   TITLE · PHRASE board · strip
z≈23.5   SHOW WHEEL (vertical until Phase 3 rake) — stage-left OK
z≈19.4   P1 / P2 / P3 facing house
z≈15     audience benches — clear center aisle
z≈10–11  ● GOLD daily (stage-right of aisle, compact) — first FOV
z≈8–9    ★ spawn south of gold; look mostly +Z at gold
```

| Piece | Rule |
|---|---|
| Spawn | South of gold, near gold’s x (slightly aisle-ward). |
| Daily | Stage-right (~x 20–21), compact, `AUDIENCE_FACING`. |
| `cameraTarget` | **Past** gold into set (y≈3, z≈20) — gold near on ray, board far on ray. |
| Look check | Δz must dominate \|Δx\| from spawn→target. Else stop. |

Numbers live only in `src/layout.ts` (`SPAWN_DOC`) + mirrored `scene.json`.

---

## DCL best-practice gate (every step)

Before changing floor code, open the matching doc. After Preview, tick the gate.

| Step concern | Consult (do not invent) | Pass when |
|---|---|---|
| Spawn position / first face | [Scene metadata — spawn](https://docs.decentraland.org/creator/scenes-sdk7/kinds-of-projects/scene-metadata) · [Spawn Areas](https://docs.decentraland.org/creator/scene-editor/build/spawn-areas) · create-scene skill `spawnPoints` | Avatar faces from `position` → `cameraTarget`; gold dominates first look; look is mostly **+Z** |
| Station coords | [LAYOUT-MOVE.md](LAYOUT-MOVE.md) · create-scene parcel bounds | All meters in `layout.ts`; entities inside 0…32 for 2×2 |
| Pointer / hover | add-interactivity skill | Gold / pad 1 verbs honest; no double chips |
| Sit | [audience-sit.md](audience-sit.md) · Seat.ts | Click/E Sit; walk >1.5 m stands |
| Show cam only | camera-control skill (`VirtualCamera`) | **Never** used to “fix” spawn; show land only |
| Text / signs face house | `AUDIENCE_FACING` in `facing.ts` | No per-station Y+90 “vestibule” facing |
| Pipelines | [pipelines.md](pipelines.md) · [V0-FREEZE.md](V0-FREEZE.md) | No claim / fulfill / letter / prize / `facingSpinZ` thaw |

**Optional (preferred once numbers stabilize):** set Spawn Area + Camera Target visually in Creator Hub, then copy into `SPAWN_DOC` / `scene.json`.

---

## One-step protocol (repeat for every Preview)

```
1. Name the ONE concern (e.g. “daily stage-right 0.4 m”).
2. Open the DCL / skill row above for that concern.
3. Edit only layout.ts (+ scene.json if spawn) and dress that reads it.
4. npm run build && npm run verify:preview-path
5. Full quit Preview → enter cold.
6. Tick baseline checklist (layout-baseline.md) + spawn contract Preview gate.
7. Log result in layout-draft-a-plan.md under the active phase.
8. Stop. Do not stack a second concern in the same Preview.
```

---

## Active phase

| Phase | Status | Next action |
|---|---|---|
| 1 Blocking | Done (with occlusion debt) | — |
| 2.1–2.2 Dress / wheel left | Done | — |
| 2.3 Cold path on **+Z** | **Active** | Look-past-gold into set (mistakes.md recipe); stop axis thrash |
| 2.4 Vestibule +X | **REVERTED / INVALID** | Never re-apply |
| 3 Wheel rake | Parked | Needs `facingSpinZ` + Hub — separate publish |
| 4 Mini daily wheel | Parked | After sightlines proven |

---

## Anti-patterns (automatic stop)

- Calling Draft C geometry “Draft A”  
- `DAILY_FACING` or any Y+90 on daily for spawn  
- `cameraTarget` on `BOARD` / deep set when selling gold first  
- `cameraTarget` on pad feet only (y too low)  
- Freestyle spawn numbers not derived via spawn contract  
- Spawn center + `cameraTarget` on far stage-right gold (empty sky — mistake #4)  
- Spawn same-x + target on gold feet (wallpaper or down-look)  
- Treating empty sky as “set deleted” without `floor health` + walk +Z  
- Thawing claim/spin to “fix” blocking  
- Two layout concerns in one Preview  
- Fixing spawn with `VirtualCamera`  
- Inventing a new spawn theory instead of matching mistakes.md #1–5

---

## Confusion check (ask before coding)

1. Is this still **Draft A** (one depth axis), or did we invent a lobby?  
2. Look ray: does Δz dominate |Δx|? Gold near, board far on that ray? ([layout-mistakes.md](layout-mistakes.md))  
3. Which **DCL doc / skill** justifies this edit?  
4. What is the **single** Preview concern?  
5. Which mistake # are we avoiding — or did Preview just hit one?

If any answer is fuzzy → stop. Do not invent mistake #6.
