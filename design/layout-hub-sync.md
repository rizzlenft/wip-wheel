# Hub → `layout.ts` sync (close the gaps)

**Purpose:** Make the Hub-visual workflow exact — no silent snap-back, no renamed entities, no pipeline thaw.  
**Companions:** [layout-workflow.md](layout-workflow.md) · [positioning.md](positioning.md) · creator-hub-mcp skill

---

## Gap 1 — Hub MCP must be connected for agent-driven Hub edits

Creator Hub MCP is **not** available in a normal Cursor chat unless you expose it.

1. Open this scene in **Creator Hub** (`Projects/wip-wheel` only — never `Scenes/…`).  
2. Settings → **AI** → enable assistant → expand **Expose AI assistant MCP server** → **Copy configuration**.  
3. Paste into project MCP config (token rotates every Hub launch — don’t commit secrets).  
4. Reload MCP. Agent can then `scene_state` / `set_component` Transform / `editor_screenshot`.

**Without MCP:** You (human) move props in Hub gizmos, then we sync numbers into `layout.ts` from the Transform panel / `scene_state` paste. Agent must **not** hand-edit `main.composite` while Hub has the scene open.

**With MCP:** Agent moves named entities via tools → then **must** write the same meters into `layout.ts` in the same pass.

---

## Gap 2 — Hub moves snap back unless `layout.ts` matches

On every Preview boot, dressers call `moveNamed` from `layout.ts`. Hub-only position changes are **overwritten**.

```
Hub look  →  copy x,y,z (and scale if changed) into layout.ts  →  Preview reapplies correctly
```

Never skip the sync step.

---

## Gap 3 — Name → constant → dresser map

| Hub `EntityNames` | `layout.ts` | Dresser | Notes |
|---|---|---|---|
| `WheelRoot` | `WHEEL` | `studio` `placeWheel` | Children use **offsets from WHEEL**, not independent Hub frees |
| `WheelFrame` | (offset) | z − 0.12 | Sync by moving WHEEL, not Frame alone |
| `Pointer` / `PointerCap` | (offset) | y fixed in studio | Keep relative to WHEEL |
| `WheelStand` / `StandBase` | (offset) | z + 0.35 | |
| `SpinButton` / `SpinLabel` | `SHOW_PAD` / `CONTESTANTS[0]` | `placeShowPad` | Pad 1 = show |
| `Seat2`/`Seat3` (+ labels) | `CONTESTANTS[1]`/`[2]` | placeholders | |
| `BenchL`/`BenchR` | `AUDIENCE.left/right`, `.z` | `placeAudience` | Sit HITs derive from these |
| `BenchBackL`/`R` | `AUDIENCE.backZ` | | |
| `AudienceRiserL`/`R` | `AUDIENCE.riserZ` | | |
| `AudienceNeonL`/`R` | `AUDIENCE.z + 0.55` | | |
| `AudienceLabel` | `AUDIENCE.label*` | | House-facing; **no** Y-billboard |
| `NeonFront` | `NEON_FRONT` | `countdown` | |
| `Stage` | `STAGE` | `countdown` | physicsOnly |
| `Backdrop` | `BACKDROP` | `countdown` | |
| `Banner` (if Hub) | `BANNER` | `countdown` | Often code-dressed |

**Not in Hub (code-created):** daily pad/sign (`DAILY_*` / `dailyWall.ts`), puzzle tiles (`BOARD` / `board.ts`), sit HIT volumes, many lights. Change those only via `layout.ts` + TS — or promote to named Hub entities later (same name contract).

**Do not rename** any row above without updating `studio.ts` / `game.ts` / `audienceSit.ts` in the same change.

---

## Gap 4 — What to move as a group

| Group | Move together |
|---|---|
| Wheel assembly | Change `WHEEL` only; let studio offsets follow |
| Show pads | Change `CONTESTANTS` / `SHOW_PAD` |
| Audience house | Change `AUDIENCE` (+ sit uses it automatically) |
| Cold path | `DAILY_*` + re-derive `SPAWN_DOC` + `scene.json` ([layout-spawn-contract.md](layout-spawn-contract.md)) |
| Neon / stage lip | `NEON_FRONT` (and `STAGE` if footprint changes) |

Moving `WheelFrame` in Hub without updating `WHEEL` = next boot puts Frame back relative to old WHEEL.

---

## Gap 5 — Sync checklist (every Hub dress session)

```
[ ] verify:preview-path — Projects/wip-wheel
[ ] Spawn frozen unless DAILY_* moved
[ ] Hub: names unchanged; Align to world; snap on
[ ] One composition goal (e.g. “audience reads as seats”)
[ ] Read Hub Transform (panel or scene_state) for each moved root
[ ] Write meters into layout.ts constants (+ scene.json if spawn)
[ ] npm run build
[ ] Full quit Preview → cold enter
[ ] floor health: critical names present; positions match intent
[ ] Smoke: daily hover, show pad 1 hover, Sit on BenchL/R
[ ] Stop — do not open a second concern
```

---

## Gap 6 — Integrity smoke (pipelines stay frozen)

After any dress sync, **do not** edit claim/spin/letter. Only confirm:

1. Gold → `Spin the daily` / come-back hover  
2. Pad 1 → `Spin the show`  
3. Sit → emote; walk >1.5 m stands  
4. No `$WIP` on gold  

If any fail → revert `layout.ts` (+ Hub undo), not a pipeline “fix.”

---

## Spawn is special (read this)

Hub Spawn Area edits write **`scene.json`**, which Explorer uses. They can also write **`y: -1.25`** and disagree with the gizmo mockup.  

Full autopsy: [layout-spawn-desync.md](layout-spawn-desync.md).  

```bash
npm run sync:spawn          # SPAWN_DOC → scene.json (y=0)
npm run verify:spawn-sync   # fail if Hub drifted
```

After any Hub spawn drag: run `sync:spawn` **or** update `SPAWN_DOC` on purpose then sync. Never trust Hub preview alone.

---

## This session

Creator Hub MCP was **not** connected to Cursor. Step 2 used the **`layout.ts` bridge**. When MCP is connected, future dress steps should use Hub eyes first, then this map — and always `verify:spawn-sync` after spawn touches.
