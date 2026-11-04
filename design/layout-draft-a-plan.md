# Draft A execution plan — procession floor

**Decision:** Draft A ([layout-drafts.md](layout-drafts.md)).  
**Runbook (open first):** [layout-execute-draft-a.md](layout-execute-draft-a.md) — DCL gate per step, no guesswork.  
**Spawn math:** [layout-spawn-contract.md](layout-spawn-contract.md).  
**Rules:** [LAYOUT-MOVE.md](LAYOUT-MOVE.md), [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md), [V0-FREEZE.md](V0-FREEZE.md), DCL sdk-skills (`create-scene`, `add-interactivity`, `audience-sit`, `camera-control`).

**Hard rule:** One phase per Preview. Do not thaw claim / letter / fulfill / spin RNG. Keep entity **names**. All meters in `layout.ts` (+ `scene.json` spawn).

---

## Why phases (not one big bang)

| Deferred | Why not Phase 1 |
|---|---|
| Raked / horizontal wheel | `facingSpinZ` spins in the disc plane for a **vertical** face. Tip without rewriting spin + Hub mesh = broken slices / black diamond risk. |
| Second small daily wheel mesh | LAYOUT-MOVE + Bay: one physical `WheelRoot` for daily until a dedicated daily root is designed with mutex. Phase 1 keeps shared wheel; gold moves to spawn so the aisle points at the show wheel. |
| Hub GLB art bake | Names must survive; art follows numbers. |

---

## Phase 1 — Procession blocking (this pass)

**Regression rule:** Every step compares to [layout-baseline.md](layout-baseline.md). Cursor rule: `layout-move-regression.mdc`.

**Do:** Reorder stations in depth only.

```
z≈29.5  board + banner + strip (unchanged depth band)
z≈24    shared WheelRoot (still vertical; nudged center-left)
z≈19.5  P1 / P2 / P3 facing house (−Z / AUDIENCE_FACING)
z≈15    audience benches + sit volumes
z≈10.6  gold daily (smaller disc) — first FOV
z≈8–10  spawn; cameraTarget = gold daily
```

**Do not:** Edit `server/`, `claimant`, letter pad, prize tables, `facingSpinZ` axis.

**Regression (Preview):**

1. `npm run verify:preview-path`  
2. Spawn: gold daily fills first look; aisle toward board visible past it  
3. Daily: spin still moves `WheelRoot`; land WEARABLE/TRY AGAIN (not `$WIP`)  
4. Show pad 1: spin → letter pad when eligible  
5. Sit on BenchL/R; walk >1.5 m stands  
6. Pads ~8 m apart — no proximity steal  

### Phase 1 Preview notes (15 Oct)

| Check | Result |
|---|---|
| Daily first in FOV | **Pass** |
| Workflows (hover Watch the wheel / stage still live) | Appears intact from screenshot |
| Board / aisle sightline | **Fail** — daily sign panel is a wall in the center of the shot |

**Do not “fix” by deleting the daily station.** Next dress pass: clear the center aisle (offset or shrink the sign) while keeping gold pad first-frame. Consult build-ui / advanced-rendering / LAYOUT-MOVE — world TextShape + panels must stay within MASTER eye-height rules without blocking the show set.

---

## Phase 2 — Dress polish (after Phase 1 Preview OK)

**Priority 1:** Compact daily + clear aisle.  
**Phase 2.1 fix (15 Oct):** Daily vs BenchR overlap + spawn FOV → false empty set.  
**Phase 2.2 (this pass):** Wheel stage-left (`WHEEL` x≈9.5) + pad 1 at wheel foot so PHRASE board isn’t covered from the house. Layout numbers only — no claim/spin/letter thaw.  
Still optional after Preview OK: audience label / after-claim CTA / `SHOW_CAM` retune.

### Phase 2.2 Preview checklist

1. `verify:preview-path` + `[WIP] floor health: critical hub names present`  
2. From spawn / sit: full PHRASE grid visible; wheel readable stage-left  
3. Daily still stage-right; click → land not `$WIP`  
4. Pad 1 `Spin the show` → wheel moves → letter when owed  
5. Sit / walk-to-stand  

### Phase 2.3 — cold path (Draft A story)

Spawn was looking at board depth → three-column “show first,” not habit-first.  
**Fix:** spawn nearer gold; `cameraTarget` past daily into aisle (gold large, set peeks); eligible copy `SPIN HERE · THEN THE SHOW`; claimed tip `SHOW UP THE AISLE`; sit label on bench row only.

**Preview:** first frame = gold dominates; board/wheel visible beyond (not empty sky). Walk aisle → sit / pad 1.

### Phase 2.4 — vestibule axis (16 Oct) — INVALID / REVERTED

Tried east vestibule + look **+X** + `DAILY_FACING` to clear board wallpaper. Left Draft A (felt sideways). Audit: [layout-dcl-audit.md](layout-dcl-audit.md).

**Do not re-apply.** Occlusion stays a Phase 2.3 dress problem on the **+Z** axis.

### Phase 2.3 resume (active)

**Spawn:** locked — [layout-mistakes.md](layout-mistakes.md). Do not thrash.

**Ladder:** [layout-next.md](layout-next.md).

**Step 1 (this pass):** `NEON_FRONT` → audience lip (z≈14.05, w 14) so cold path isn’t fenced. Spawn untouched.

**Preview pass:** gold + open aisle; pink line near seats, not at spawn feet.

**Next after Preview OK:** Step 2 audience sit read → Step 3 daily size → Step 4 optional compress → Phase 3 rake.

---

## Phase 3 — Wheel rake (separate publish)

- Hub tip + `facingSpinZ` / parent quaternion rewrite  
- Preview spin honesty (slice ↔ prize) before World  

---

## Phase 4 — Small daily wheel (optional, Bay-aware)

- New named daily disc root; show keeps `WheelRoot`  
- Server mutex already shared — wire daily tween to daily root only  
- Only after Phase 1–2 sightlines proven  

---

## Rollback

Revert `layout.ts` + `scene.json` only. No pipeline files in Phase 1 diff.
