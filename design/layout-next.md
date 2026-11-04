# Draft A — next steps (no guesswork)

**Authority:** [layout-workflow.md](layout-workflow.md) (Hub visual → sync `layout.ts`) → [positioning.md](positioning.md) → [layout-mistakes.md](layout-mistakes.md)  
**Freeze:** claim / fulfill / letter / prize tables / `facingSpinZ` (until Phase 3)  
**Rule:** One Preview concern per row. Dress in Hub when possible; chat does not invent Δx. Tick before starting the next.

---

## Where we are (16 Oct)

| Layer | Status |
|---|---|
| Look ray / cold face into set | **Locked** — spawn near gold, `cameraTarget` past gold (z≈20). Do not thrash. |
| Blocking depth (board / wheel left / pads / benches / daily stage-right) | **In tree** — procession exists |
| Intimate WoF read | **Parked** — art; meters will not deliver canvas look |
| Vertical → raked wheel | Phase 3 — **parked** (with art) |

Latest good shot: gold stage-right, board ahead, wheel left, facing +Z. That is Draft A *blocking*, not Draft A *dress*.  
Photo set (16 Oct): facing board = contract; empty sky / edge daily = turned away or toward gold — see [layout-draft-a-path.md](layout-draft-a-path.md). **Do not reopen spawn.**

---

## Ordered ladder (do in order)

### Step 0 — Spawn freeze (done)

No `SPAWN_DOC` / `scene.json` edits unless `DAILY_*` moves. Re-derive from spawn contract if it does. Preflight: Δz ≫ |Δx|.

### Step 1 — Clear aisle neon *(corrected after Hub vs live)*

**Concern:** Full-width `NeonFront` blocked the center aisle (Hub mockup has open aisle + seat-edge neon only).  
**Fix:** `hideNamed('NeonFront')` — keep `AudienceNeonL/R`. See [layout-hub-vs-live.md](layout-hub-vs-live.md).  
**Pass:** Walk the center aisle to the stage without a pink bar in the path.

### Step 2 — Audience house reads as seats *(this pass)*

**Concern:** Sit cue Y-billboarded into wheel FOV; label not derived from `AUDIENCE`.  
**Lever:** `AUDIENCE.label*` + remove `faceCameraY('AudienceLabel')`; Seat.ts unchanged.  
**Sync map:** [layout-hub-sync.md](layout-hub-sync.md). (No Hub MCP this session — layout bridge.)  
**Pass:** `SIT · WATCH` sits on the house row facing the set; Sit still works; spawn untouched.  
**Do not:** Move daily; reopen spawn; thaw pipelines.

### Step 3 — Daily stays habit-sized

**Concern:** If PHRASE still feels walled when standing on gold, shrink/offset daily further stage-right.  
**Lever:** `DAILY_*` + panel size; then re-derive `SPAWN_DOC` (contract).  
**Pass:** On gold, board centerline readable; hover daily honest.  
**Do not:** Look +X / vestibule.

### Step 4 — Compress depth — **Preview pass 16 Oct**

**Concern:** Set still feels sparse vs “intimate WoF.”  
**Lever:** Shared **Δz=−2** on AUDIENCE / pads / wheel / board / backdrop / stage (spawn + daily frozen).  
**Preview:** floor health `WHEEL z=21.5 BOARD.z=27.55 AUDIENCE.z=13.2`; cold face gold-right + set ahead; sit → board/wheel; show spin JACKPOT; aisle clear of daily. Still outdoor void + vertical wheel (art + Phase 3).  
**Do not:** Another compress — remaining “warehouse” is Hub mass, not meters.

### Step 5 — Phase 3 wheel rake — **PARKED**

Hub tip + `facingSpinZ`. Do not start until art/rake unparked.

### Step 6 — Phase 4 mini daily wheel — **PARKED**

Only after sightlines + mutex plan + explicit unpark.

---

## Explicitly not next

- Another spawn axis theory  
- VirtualCamera for cold path  
- Thawing claim/spin  
- Hub-only moves without `layout.ts`  
- Rake + neon + audience in one Preview  

---

## After each step

1. `npm run build` && `npm run verify:preview-path`  
2. Full quit Preview → cold enter  
3. `[WIP] floor health`  
4. Tick this file + [layout-draft-a-plan.md](layout-draft-a-plan.md)  
5. Stop.
