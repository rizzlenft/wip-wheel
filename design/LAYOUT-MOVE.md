# Moving the floor without breaking pipelines

**Why this exists:** The room will get a real art pass (benches, wheel stand, board, lighting). Positions will change. Daily and show **logic** must stay intact when meshes move.

**How space works (read first):** [positioning.md](positioning.md) — axes, Transform, facing, Hub `moveNamed` vs code-created, precision protocol.  
**Spawn look-ray:** [layout-mistakes.md](layout-mistakes.md) · [layout-spawn-contract.md](layout-spawn-contract.md).

**Single source of blocking numbers:** `src/layout.ts`  
**Dress that applies them:** `src/studio.ts`, `src/dailyWall.ts`, `src/board.ts`, `src/scoreboard.ts`, `src/countdown.ts`, `src/game.ts` (wheel hit), `src/audienceSit.ts`  
**Spawn / camera:** `SPAWN_DOC` in `layout.ts` mirrored to `scene.json` `spawnPoints`

If another file hardcodes an x/z for a station, that is a bug — move the constant into `layout.ts`.

Companion: [pipelines.md](pipelines.md), [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md), [station-clarity.md](station-clarity.md).

---

## What “move” means vs what must not change

| Safe to change | Frozen / careful |
|---|---|
| Numbers in `layout.ts` (wheel, pads, board, audience, strip, banner) | Daily vs show **authorities**, catalogs, claim identity |
| Hub composite mesh *look* (GLB swap on same entity **name**) | Entity **names** used by `getEntityOrNullByName` / `moveNamed` |
| `scene.json` spawn + `cameraTarget` (phone FOV) | Mixing gold `$WIP` labels into daily |
| Paint / lights / sit volumes keyed off `AUDIENCE` | Letter-pad layout; spin mutex; fulfill |

**Rule:** Pipelines bind to **roles** (gold pad, show pad 1, WheelRoot, board). Layout binds those roles to **coordinates**. Move coordinates; do not rename roles casually.

---

## Named entities you must keep (Hub composite)

These names are dress anchors. Renaming breaks `studio.ts` / `game.ts` silently.

| Name | Role |
|---|---|
| `WheelRoot` | Shared physical wheel (daily + show) |
| `WheelFrame`, `Pointer`, `WheelStand`, `StandBase` | Wheel props |
| `SpinButton`, `SpinLabel` | Show pad 1 |
| `Seat2`/`Seat3` (+ labels) | V2 placeholders (`SOON`) |
| `BenchL`/`BenchR`, `BenchBackL`/`R`, risers, neon | Audience |
| Daily sign / gold pad names used in `dailyWall.ts` | Daily station |

After a Creator Hub art bake: confirm every name still exists (`entity-names.ts` / Hub tree). If Hub renames, update dress code in the same PR.

---

## Dependency map (edit `layout.ts` → what to re-check)

| Constant | Consumers | Regression |
|---|---|---|
| `WHEEL` | `studio` placeWheel, `game` wheel click volume | Daily + show spin still hit the face; no black diamond |
| `CONTESTANTS` / `SHOW_PAD` | `studio` pads + show HIT | Pad 1 `Spin the show`; pads 2/3 still SOON |
| `DAILY_PAD` / `DAILY_SIGN` | `dailyWall` | Gold in phone FOV from spawn; `Spin the daily` |
| `BOARD` | `board.ts` tiles | Puzzle rows clear strip; category readable |
| `STRIP` | `scoreboard`, board row Y clearance | Letters + pods under board; row 3 not clipped |
| `BANNER` | `countdown` title card | THURSDAYS still readable |
| `AUDIENCE` / `SIT_SPOT` | `studio` benches, `audienceSit` | Sit on cream plank; walk >1.5 m to stand |
| `PAD` / `HIT` | pad discs + volumes | Proximity 4 m; pads ~8 m apart so they do not steal |

**Spawn** (`scene.json`): if you move daily/wheel, re-run MASTER phone checklist — nudge `cameraTarget` before inventing a second layout.

---

## Checklist before any reposition publish

1. `npm run verify:preview-path`  
2. Change **only** `layout.ts` (+ `scene.json` spawn if needed) — not prize tables.  
3. Preview desktop: **Draft A procession** — gold daily in first FOV, aisle toward board/wheel (not the old three-column frame).  
4. Phone FOV: gold pad still in first frame (or walk ≤2 steps).  
5. One daily claim path + one show spin + letter pad (if eligible).  
6. Audience: cream seats + proximity **`Sit`**.  
7. Board: 3 rows still clear strip (`board.ts` derives from `STRIP`).  
8. One concern publish; quit Explorer fully.

**Active move:** Draft A Phase 2.3 resume — [layout-execute-draft-a.md](layout-execute-draft-a.md). Rake / second daily wheel = later phases.

---

## Future art pass (benches / wheel) without pipeline risk

1. Keep entity **names**; replace mesh/material in Hub or swap GLB on that entity.  
2. Tune `layout.ts` numbers so GLB feet land where pads expect.  
3. Sit volumes stay `AUDIENCE`-driven — do not parent Restricted Actions to the GLB click if Hub steals rays; keep separate `makeClickVolume`.  
4. Never put daily claim or show RNG in the art layer.

---

## Anti-patterns (already paid tuition)

- Hardcoding `x: 9.6` in `game.ts` while `WHEEL` lives in `layout.ts`  
- Moving the wheel in Hub Inspector only (composite overwrite) without updating `layout.ts`  
- Creating a second “daily wheel” mesh in the same publish as a blocking move (Bay: one physical wheel for V0; Draft A Phase 4 only after Phase 1 sightlines + explicit mutex plan)  
- Editing `Scenes/` Hub mirror instead of `Projects/wip-wheel`
