# Positioning & orientation in Decentraland (WIP Wheel)

**Purpose:** Close the knowledge gap on *how* to place and face things accurately — existing Hub props, code-built signs, and future elements.  
**This is the spatial authority.** Layout *numbers* still live in `src/layout.ts`; spawn look-ray rules live in [layout-mistakes.md](layout-mistakes.md).

**Official DCL sources (consult before inventing):**

| Topic | Doc |
|---|---|
| Transform, parenting, billboards, bounds | [Entity positioning](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/entity-positioning) |
| Vector3 / Quaternion | [Special types](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/special-types) |
| Spawn / `cameraTarget` | [Scene metadata](https://docs.decentraland.org/creator/scenes-sdk7/kinds-of-projects/scene-metadata) · [Spawn Areas](https://docs.decentraland.org/creator/scene-editor/build/spawn-areas) |
| Hub gizmos / snap / numeric Transform | [Scene Editor essentials](https://docs.decentraland.org/creator/scene-editor/get-started/scene-editor-essentials) |
| TextShape | [Text](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/text) |
| Skills | create-scene (bounds), advanced-rendering (Billboard), LAYOUT-MOVE |

---

## 1. Coordinate system (locked mental model)

Decentraland scenes use a **left-hand** axis (docs tip: left hand — index = **+Z**, middle = **+X**, thumb = **+Y**).

| Axis | Direction | WIP Wheel meaning |
|---|---|---|
| **+X** | East / right | Stage-right (daily side) |
| **+Y** | Up | Height above ground |
| **+Z** | North / “forward” | Into the set (toward board) |
| **−Z** | South | Toward spawn / house |

**Shortcuts** (`@dcl/sdk/math`):

- `Vector3.Forward()` = `(0,0,1)` = **+Z**
- `Vector3.Right()` = `(1,0,0)` = **+X**
- `Vector3.Up()` = `(0,1,0)` = **+Y**

### Origin and our 2×2 footprint

From [entity positioning](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/entity-positioning) + create-scene skill:

- `(0,0,0)` = **southwest corner** of `scene.base` at ground.
- Units = **meters**.
- Position = entity **center**, not feet (unless the mesh pivot is at feet — GLBs vary).
- Our `scene.json`: `base: "0,0"`, parcels `0,0` `1,0` `0,1` `1,1` → valid roughly **`0 ≤ x ≤ 32`**, **`0 ≤ z ≤ 32`**.
- Out of bounds → **silently not rendered** (or clipped). Preview highlights OOB in red. Negative x/z is always outside.
- Height limit 330 m; keep gameplay under ~200 m for multiplayer sync.

**House centerline** for Draft A ≈ `x = 16` (center of 2×2). Board sits on that line at high z.

### Preview compass

In Preview, a compass at `(0,0,0)` labels the axes. Use it when a first frame feels “rotated” — check whether *you* are facing +Z or the props are.

---

## 2. Transform — the only placement API

Every visible thing needs a `Transform`:

```ts
Transform.create(entity, {
  position: Vector3.create(x, y, z),  // meters, center
  rotation: Quaternion.Identity(),    // or fromEulerDegrees
  scale: Vector3.create(1, 1, 1),
  parent: optionalParentEntity
})
```

| Field | Meaning |
|---|---|
| `position` | Center in **local** space (world if no parent) |
| `rotation` | Quaternion (engine storage). Prefer `Quaternion.fromEulerDegrees(x,y,z)` for authoring |
| `scale` | Multiplier; default 1 |
| `parent` | Child local (0,0,0) = parent center; parent rotate/scale compounds |

**World vs local:** use `Transform.getWorldPosition(engine, entity)` / `getWorldRotation` when parenting matters (e.g. collider on a spinning wheel). Docs: positions are **scene-relative**, not Genesis City.

**Do not** write `engine.CameraEntity` / `engine.PlayerEntity` Transforms — read-only. Move players with `movePlayerTo`; force view with `VirtualCamera` ([camera-control](https://docs.decentraland.org/creator/scenes-sdk7/) skill).

---

## 3. Orientation — facing the house

### Identity = faces the audience

In this project:

```ts
// src/facing.ts
export const AUDIENCE_FACING = Quaternion.Identity()
```

**Meaning (project law, verified in play):**  
`MeshRenderer` planes and `TextShape` with **identity** rotation show their readable face toward the house (players at **low Z** looking **+Z**).  

`Quaternion.fromEulerDegrees(0, 180, 0)` shows the **back** face and **mirrors** glyphs/textures. That is almost never what we want for signs.

| Intent | Rotation |
|---|---|
| Sign / board / strip / logo facing house | `AUDIENCE_FACING` (Identity) |
| Turn a house-facing plane to face **−X** (west) | `fromEulerDegrees(0, 90, 0)` — used once for vestibule; **forbidden for Draft A daily** |
| Turn to face **+X** (east) | `fromEulerDegrees(0, -90, 0)` or `(0, 270, 0)` |
| Wheel spin in disc plane | `facingSpinZ(degrees)` — multiply Identity × Euler Z; **normalize** degrees (w = −1 back-face bug) |
| Floor decal / flat on ground | often `fromEulerDegrees(90, 0, 0)` (see spotlight helper) |
| Bench look (not a sign) | yaw 0 looks **+Z** (backrest at lower Z). `atan2(boardX − x, boardZ − z)` aims that +Z at the board. Do **not** use the sign yaw row for seats |
| Look at a point (cameras) | `Quaternion.fromLookAt(from, to)` — used in `showCam.ts` |

### Billboard vs fixed facing

| Use | When |
|---|---|
| Fixed `AUDIENCE_FACING` | Set dressing that must read as architecture (board, daily sign, pads) |
| `Billboard` `BM_Y` | Floating labels that should stay legible as you walk (optional) |
| Avoid `BM_ALL` on set pieces | Tilts unnaturally; feel like HUD junk |

Billboard **does not** mutate `Transform.rotation` in the component data — it affects what players *see*. Multiple players each see their own billboard facing. Do **not** Billboard the puzzle board or daily station.

### Euler authoring tip

- Think in **degrees**, store as **Quaternion**.
- Avoid Euler↔Quaternion every frame (docs: expensive).
- Yaw (turn left/right on the floor) = **Y** Euler axis.

---

## 4. Two placement pipelines in this repo

We use **both**. Confusing them caused “set vanished” and Hub overwrite bugs.

```
┌─────────────────────────────────────────────────────────┐
│ A. Hub composite (assets/scene/main.composite)          │
│    Named scenery: WheelRoot, BenchL, SpinButton, Stage… │
│    Initial Transform authored in Creator Hub            │
│    Runtime: moveNamed(name, position, scale) from code  │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ B. Code-created entities (dailyWall, board tiles, …)    │
│    engine.addEntity + Transform at create time          │
│    Position/rotation from layout.ts + AUDIENCE_FACING   │
└─────────────────────────────────────────────────────────┘
```

| | Hub named (`moveNamed`) | Code-created (`makeBox` / `makeText`) |
|---|---|---|
| Where meters live | `layout.ts` → `studio.ts` / `countdown.ts` | `layout.ts` → `dailyWall.ts` / `board.ts` |
| Rotation | Often **left as Hub authored** — `moveNamed` today sets **position + scale only** | Default `AUDIENCE_FACING` in `look.ts` |
| Rename risk | **High** — `getEntityOrNullByName` silent miss | None |
| Art swap | Keep **name**, change GLB in Hub | Rebuild in code |

**Critical:** `moveNamed` does **not** set rotation. If a Hub mesh faces the wrong way after a move, fix rotation in Hub **or** extend the dresser to set `Transform.rotation` explicitly — do not guess with a second entity.

**Critical:** Editing positions only in Hub without updating `layout.ts` is overwritten next Preview when `studio` runs `moveNamed`. **Numbers authority = `layout.ts`.**

---

## 5. How to move an existing object precisely

### Checklist

1. **Name the role** (WheelRoot, DAILY_PAD, BOARD…) — not “that pink box.”  
2. **Find the constant** in `src/layout.ts` (or add one).  
3. **Confirm the dresser** (`studio.ts`, `dailyWall.ts`, …) reads that constant.  
4. **Change only that constant** (and spawn if the cold path depends on it).  
5. **Pre-flight look ray** if spawn/`cameraTarget` changes — [layout-mistakes.md](layout-mistakes.md).  
6. `npm run build` · `npm run verify:preview-path`.  
7. Full quit Preview → cold enter.  
8. Console: `[WIP] floor health` — Hub names present; positions match intent.  
9. One concern per Preview.

### Precision aids

| Method | How |
|---|---|
| Meter math | Draft A depth bands in [layout-execute-draft-a.md](layout-execute-draft-a.md); keep Δx/Δz intentional |
| Hub numeric Transform | Select entity → type exact meters in properties (docs: more precise than free drag) |
| Hub snap | Editor snap increments for position/rotation/scale |
| Align to world | Gizmo axes follow world, not local — use when nudging along aisle (+Z) |
| Floor health | Logs `WHEEL`, `DAILY_PAD`, Hub entity positions after setup |
| Walk test | Empty sky → walk +Z before declaring missing geometry |

### Parenting when moving groups

- Children move with parent. Wheel face spin = rotate `WheelRoot`; hit volume parented to it (`game.ts`).  
- Sit spots are **offsets** from bench positions (`SIT_SPOT` in layout) — change bench first, then verify sit.  
- Invisible parent wrappers are valid (docs) for grouping — prefer named Hub roots we already have.

---

## 6. How to place a **new** element precisely

1. **Decide pipeline**  
   - Static scenery players see every visit → **Hub** named entity + `moveNamed` from `layout.ts`.  
   - Dynamic / many instances (tiles, reel text) → **code** `make*` helpers.  
2. **Add a layout constant** (single source).  
3. **Face house** with `AUDIENCE_FACING` unless Billboard is intentional.  
4. **Register the name** in [LAYOUT-MOVE.md](LAYOUT-MOVE.md) dependency map + `entity-names.ts` if Hub.  
5. **Bounds check:** center within 0…32 x/z.  
6. **Pointer:** separate `makeClickVolume` if needed; don’t rely on pretty mesh alone (add-interactivity).  
7. Preview from spawn **and** from seats.

Do **not** hardcode `x: 12.3` inside feature files while a parallel constant exists in `layout.ts`.

---

## 7. Spawn is not an entity Transform

| | Entity Transform | Spawn `cameraTarget` |
|---|---|---|
| What it moves | A prop | Player’s **first look** |
| API | `Transform` / `moveNamed` | `scene.json` `spawnPoints` (+ `SPAWN_DOC`) |
| Mistake class | Wrong meters / facing | Look **ray** off the set ([layout-mistakes.md](layout-mistakes.md)) |

Moving the daily sign does **not** automatically fix spawn. If you move `DAILY_*`, re-derive `SPAWN_DOC` from the spawn contract and mirror `scene.json`.

DCL: player faces from `position` toward `cameraTarget` ([scene metadata](https://docs.decentraland.org/creator/scenes-sdk7/kinds-of-projects/scene-metadata)). Optional: set Spawn Area visually in Hub, then copy numbers into `SPAWN_DOC`.

---

## 8. WIP Wheel spatial map (Draft A)

```
z ≈ 29.5   BOARD / BANNER / STRIP     x ≈ 16 (center)
z ≈ 23.5   WHEEL                      x ≈ 9.5 (stage-left)
z ≈ 19.4   CONTESTANT pads             face house (−Z)
z ≈ 15     AUDIENCE benches           clear aisle at x ≈ 16
z ≈ 10–11  DAILY pad + sign           stage-right x ≈ 20–21
z ≈ 8      SPAWN                      south of gold; look past gold to z ≈ 20
```

All of these are **meters in scene space**, applied either by `moveNamed` or by creating Transforms in code. They are not “CSS.” They are not relative to the camera.

---

## 9. Common failure modes → correct lever

| Symptom | Likely cause | Correct lever |
|---|---|---|
| Prop missing | OOB, wrong name, scale 0.01 hide, composite not loaded | `floor health`; bounds; name |
| Text mirrored / blank | Y=180 or wrong face | `AUDIENCE_FACING` |
| Sign sideways vs set | Extra yaw (Y±90) | Remove; house-facing only |
| Empty sky at spawn | Look ray not +Z into set | [layout-mistakes.md](layout-mistakes.md) |
| Daily walls board | Gold on look ray center + large panel | Offset + shrink; look past gold |
| Hub move “reverts” | `moveNamed` overwrites Hub position | Edit `layout.ts` |
| Click misses | Collider / HIT not moved with mesh | Move HIT from same layout constant |
| Wheel labels flip mid-spin | Unnormalized Euler → w=−1 | `facingSpinZ` / `normalizeSpinDegrees` |

---

## 10. Precision protocol (print this)

```
BEFORE
  [ ] Role named; layout constant identified or created
  [ ] DCL doc/skill for this concern opened (positioning / spawn / interactivity)
  [ ] If spawn: look-ray Δz ≫ |Δx|; gold near, board far
  [ ] One concern only

EDIT
  [ ] layout.ts (+ scene.json if SPAWN_DOC)
  [ ] Dresser uses constant; rotation explicit if not AUDIENCE_FACING
  [ ] No pipeline thaw

AFTER
  [ ] build + verify:preview-path
  [ ] Cold Preview; floor health
  [ ] Sightlines: spawn, aisle, seat
  [ ] Log result in layout-draft-a-plan / playtest note
```

---

## 11. Related project docs

| Doc | Role |
|---|---|
| [LAYOUT-MOVE.md](LAYOUT-MOVE.md) | What may move vs frozen pipelines |
| [layout-mistakes.md](layout-mistakes.md) | Spawn look-ray failures |
| [layout-spawn-contract.md](layout-spawn-contract.md) | SPAWN_DOC formula |
| [layout-execute-draft-a.md](layout-execute-draft-a.md) | Draft A execution gates |
| [facing.ts](../src/facing.ts) | `AUDIENCE_FACING`, `facingSpinZ` |
| [look.ts](../src/look.ts) | `moveNamed`, `make*` defaults |
| [floorHealth.ts](../src/floorHealth.ts) | Runtime position audit log |
