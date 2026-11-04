# Hub vs live spawn — careful compare (16 Oct 10:08)

**Left / live Preview:** tiger avatar, pink bar + bread in the walk line, daily right, sit text left, outdoor sky.  
**Right / Creator Hub:** ghost in **center aisle between benches**, clear path to stage, neon on **seat outsides only**, purple set, wheel left — **no gold daily in frame**.

---

## 1. Spawn numbers (disk right now)

`npm run verify:spawn-sync` = OK.

| | Live runtime (`scene.json`) | Hub mockup (visual) |
|---|---|---|
| Feet | mid ≈ **(19.3, 0, 8)** — south of gold, stage-right | Ghost ≈ **(13.6, 0, 15)** — between BenchL/R |
| Look | `cameraTarget` **(18.25, 3, 20)** — into set past gold | Facing stage up the aisle |
| Story | Gold-near cold path (contract) | Aisle-center / house entry |

So: **you are not spawning where the Hub ghost stands.** Live is still the gold-near contract we synced. The Hub editor is showing a **different** spawn placement (and may not have written it to `scene.json` — same desync class as [layout-spawn-desync.md](layout-spawn-desync.md)).

If the live shot *feels* “in an aisle,” that’s the dark floor strip + look toward the board — not Hub’s between-benches coordinates.

---

## 2. Why live has a pink wall in your face

| | Live | Hub mockup |
|---|---|---|
| Cross-aisle bar | **`NeonFront`** at z≈14.05, **w=14**, x=16 → spans **x≈9…23** | No continuous front bar |
| Seat neon | `AudienceNeonL` / `R` on bench outsides | Neon strips on **outer** edges of seat platforms only |
| Center aisle | **Blocked** by full-width `NeonFront` (x=13.6 sits inside the bar) | **Open** walk to stage |

Step 1 moved the fence to the “audience lip” but kept it as one wide bar. That **violates Draft A “clear center aisle”** and does **not** match Hub. Bread stuck on that bar makes it worse (daily/meetup prop sitting on the lip).

`AudienceNeonL/R` already do the Hub-style edge glow. The full-width `NeonFront` is redundant and harmful.

---

## 3. What else differs (same scene, two presentations)

| | Live (after `moveNamed` dress) | Hub editor viewport |
|---|---|---|
| Daily gold | Present stage-right (code `dailyWall`) | Often **absent** from that framing — Hub doesn’t run TS dress the same way |
| Benches | Cream/paint via studio; can still read as pink slabs | Purple tiered blocks in your mockup art |
| Wheel | Vertical, stage-left | Similar left; Hub may show floor ring / different stand |
| Sky / void | Open DCL sky | Editor grid / purple stage mass — reads more “set” |
| Sit label | House-facing on row (Step 2) | Not the focus of this Hub shot |
| “SPAWN” float text | Likely OCR / label near sit or pad — check in Preview | Ghost = spawn widget only |

Hub is showing **composite resting art + Spawn Area gizmo**.  
Live is showing **composite + runtime dress** (`layout.ts` / `studio` / `dailyWall` / `countdown`). They will never look identical until we Hub-compose with names kept and sync meters.

---

## 4. Draft A alignment

| Draft A | Hub shot | Live shot |
|---|---|---|
| Clear center aisle | **Yes** | **No** — NeonFront wall |
| Spawn → daily → aisle | Ghost skips daily (aisle-first) | Gold-near spawn; daily in FOV right |
| Wheel stage-left | Yes | Yes |
| Board back center | Yes | Yes |
| Intimate set | Stronger | Weaker (void + fence) |

---

## 5. What to do with this (no guesswork)

**Ops (spawn):** Hub ghost ≠ live until `scene.json` matches. After Hub spawn moves: `npm run sync:spawn` **from** an updated `SPAWN_DOC`, or don’t drag spawn in Hub. Pick gold-near vs aisle-center on purpose ([layout-position-audit.md](layout-position-audit.md)).

**Dress (aisle):** Remove or hide full-width **`NeonFront`** so the center aisle matches Hub/Draft A. Keep `AudienceNeonL/R`. One Preview concern.

**Art:** Later Hub session for bench/stage mass — names + sync. Not another spawn axis.

**Do not:** Treat this pair of screenshots as “spawn sync still broken” without reading `scene.json` — sync is green; **placement stories differ**.
