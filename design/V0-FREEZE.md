# V0 freeze — do not break the working room

**Date:** 14 Oct 2026. **Updated 28 Oct 2026.**  
**Status:** V0 is paid. Daily claim and wearable payout stay frozen. The show loop may change only along the V1 slices in [roadmap-v0-v4.md](roadmap-v0-v4.md) and [NOW.md](NOW.md). Do not mix the gold table into a live round.

Companion: [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md), [pipelines.md](pipelines.md), [daily-claim-audit.md](daily-claim-audit.md), [v0-closure.md](v0-closure.md).

---

## Frozen (do not edit without a playtest bug + regression)

| Area | Paths |
|---|---|
| Daily claim / identity | `src/server/claimant.ts`, `src/server/dailyClaims.ts`, daily handlers in `src/server/server.ts` |
| Daily catalog / day lock | `src/shared/dailyCatalog.ts` |
| Fulfillment / eth | `src/server/fulfill.ts`, `src/server/onchainTransfer.ts` |
| Claimer vs spectator UI | `src/game.ts` daily helpers, `src/dailyWall.ts` |
| Show spin + letters | Extend only as V1a/V1b in [NOW.md](NOW.md): card index, solve message, later the live table. Do not restyle the pad or change the daily mutex while doing it. Files: `showSpin` / `guessLetter` in `server.ts`, show paths in `game.ts`, `src/ui.tsx` |
| Shared wheel mutex / timing | `wheelReserve`, `shared/spinTiming.ts`, `facing.ts` normalize |
| Pipelines contract | [pipelines.md](pipelines.md) — never mix daily/show prize tables |

**Publish rule:** one concern per publish. Do **not** republish mid-Meetup. Quit Explorer fully after any deploy.

**Path rule:** `npm run verify:preview-path` before any spin debug. Hub opens `Projects/wip-wheel` only.

---

## Safe to work on now (V1 prep — does not touch frozen spin)

| Path | Why safe | Files |
|---|---|---|
| **Week card content** | Swap guest / puzzle / hype copy without changing claim logic | `src/week.ts`, `design/week.json` (keep in sync) |
| **Meetup ops / host card** | No code | [demo-tomorrow.md](demo-tomorrow.md), marketing checklist in [v0-scorecard.md](v0-scorecard.md) |
| **Docs / playtest log** | Memory only | `design/*` |
| **Sit on benches** | Additive; no claim path | `audienceSit.ts` (`Sit` hover) — see [audience-sit.md](audience-sit.md) |
| **Layout numbers only** | Prep for art moves | `layout.ts` + [LAYOUT-MOVE.md](LAYOUT-MOVE.md) — no pipeline edits |
| **Meetup URL / plaque** | Already exists; copy-only tweaks | `week.ts` `MEETUP_URL`, daily wall meetup bind |

---

## V1 lanes (28 Oct — this replaces the host-ritual list)

Build order is [NOW.md](NOW.md): phrase bank, shared advance, solve on the existing pad, then the round clock and the three-seat live round. A host walking one player to pad 1 is not the plan. Vowels, credit transfers, and a $WIP send are not V1.

The 14 Oct checklist in [v1-progression.md](v1-progression.md) is history.

---

## Tomorrow’s crowd test (your job, not code)

- Gold = daily (one per wallet / UTC day). Magenta = show.
- Watch for: day lock, show → letter pad, no black diamond, no `$WIP` on gold.
- Backpack if someone lands WEARABLE — verify with [fulfill-verify.md](fulfill-verify.md) (proven 14 Oct; still log each hang).
- **Do not ask for spin-code changes mid-hang** unless the room is dead.

---

## If something breaks after a future edit

1. Stop. `npm run verify:preview-path`.  
2. Run [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md) §4 regression.  
3. Rollback publish to last known-good (git / prior Hub publish).  
4. Log *why* in [learnings.md](learnings.md) the same day.
