# Show wheel (main stage) — authority

**Date:** 4 Nov 2026  
**Rule:** One face, one table, practice and live. Do not reintroduce an 8-slice show face or a phase-based texture swap.

North star links: [pipelines.md](pipelines.md) · [v1-bay-pitch-build.md](v1-bay-pitch-build.md) · [V0-FREEZE.md](V0-FREEZE.md) (daily unchanged).

---

## What players see

| Piece | Art | Server table | When |
|-------|-----|--------------|------|
| **Show wheel** (`WheelDisc` on `WheelRoot`) | `assets/Images/wheel-face-live-4.png` | `src/livePrizes.ts` → `LIVE_PRIZES` (4 slices) | **Always** — practice and live |
| **Gold daily cabinet** | Separate disc / catalog art | `shared/dailyCatalog.ts` | Daily claim only — **never** the show table |

Labels on the show disc: **LETTER · WEARABLE · LOSE TURN · BANKRUPT**. Fifth **$WIP** slice is **V2** (Base hot wallet + new art).

---

## What `roundPhase` controls (not the face)

`practice` vs `live` only gates **live rules**, not slice count or PNG:

| In live only | In practice |
|--------------|-------------|
| 3-wallet roster, active seat, turns | Anyone can spin pad 1 (no roster cap) |
| Wearable slice → bank → fulfill on **correct solve** | Same wheel outcomes; **no** live fulfill / no solve lock |
| Wrong solve → OUT + `liveLocked` until round ends | Wrong solve → close letter window; **no** OUT lock |
| Practice spins paused for spectators (roster plays) | Indefinite practice puzzles |

---

## Code map (edit here, not `PRIZES[]`)

| Concern | Files |
|---------|--------|
| Slice labels + roll | `src/livePrizes.ts` |
| Show spin RNG + `wheelSlices` | `src/server/server.ts` (`showSpin`, `finishShowSpinOnServer`) |
| Tween degrees | `ShowState.wheelSlices` (always **4**) + `showSliceDegrees()` in `src/game.ts` |
| Disc texture (albedo **and** emissive) | `paintShowWheelFace()` in `src/game.ts` — Hub composite often pins emissive to old PNG |
| Regenerate PNG | `python3 scripts/generate-assets.py --wheels-only` or `npm run generate:wheels` |

**Preflight:** `npm run verify:v1-preview` checks `LIVE_PRIZE_COUNT === 4` and art path.

---

## Legacy: `src/prizes.ts` `PRIZES` (8 entries)

**Not** the show-wheel authority after Nov 2026. Still referenced for:

- Gold daily cabinet tween math (`DAILY_SLICE_DEG`, `dailyDiscDegrees` in `game.ts`)
- Historical docs / audits mentioning `wheel-face.png`

Do **not** roll show `showSpin` from `PRIZES.length` or swap back to `wheel-face.png` on `WheelDisc` when `roundPhase === practice`.

---

## Common mistakes (avoid design loops)

| Wrong assumption | Truth |
|------------------|--------|
| “Practice should show $WIP / JACKPOT slices” | Bay V1 pitch: **4-slice show wheel everywhere**; fantasy $WIP on show is retired for V1 |
| “Wheel still 8 slices until LIVE” | Fixed Nov 4 — texture and server always 4 |
| “Fix live face by toggling `roundPhase` in Hub” | Set PNG + `livePrizes.ts`; phase only toggles roster/fulfill |
| “Letter hits add practice `$WIP` bank from `PRIZES`” | Removed with unified table; live bank uses roster logic only |

---

## Verification

Solo: [v1-solo-playtest.md](v1-solo-playtest.md) steps 3 + 6 (practice spin lands on four labels; live step 4–8 when `ROUND_EVERY_SEC=120`).
