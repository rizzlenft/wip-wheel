# Preview: “wheel won’t spin” — diagnose before changing code

**Date:** 14 Oct 2026  
**Rule:** `npm run verify:preview-path` first. Do **not** thaw claim/spin RNG while chasing UI.

Companions: [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md), [spin-mutex-audit.md](spin-mutex-audit.md), [pipelines.md](pipelines.md), DCL [build-ui](https://docs.decentraland.org/creator/scenes-sdk7/) pointer rules (full-canvas root must stay `pointerFilter: 'none'`).

---

## What is *not* a regression

After a **show** spin lands on a real prize (not TRY AGAIN):

1. Letter pad appears at the **bottom** (title: `LETTER IN PLAY · OPEN · …`).
2. Show pad hover becomes **`Call a letter`** (not `Spin the show`).
3. Scoreboard / busy line may say letter pad open.
4. **Next show spin is rejected until someone taps a letter** — client + server (`canGuess`). This is the shared-wheel mutex, not a broken bind.

Standing on pad 1 is **not** required. Click pad HIT or wheel face from avatar distance ≤16.

Daily gold is a **separate** path — should still work while a letter is owed (unless the physical wheel tween is still running).

---

## Decision tree (30 seconds)

| What you see | Meaning | What to do |
|---|---|---|
| Hover: `Call a letter` + pad at bottom | Expected gate | Tap any unused letter, then spin again |
| Hover: `Wait — daily spinning` / `Wheel is spinning` | Mutex busy | Wait for land; do not republish |
| Hover: `Spin the show` but click no-ops | Ray / UI steal or server silent reject | Full quit Preview → restart → confirm bundling path; check Multiplayer Server log for `show spin →` |
| No hover on pad 1 or gold at all | Collider / bind / wrong tree | `verify:preview-path`; confirm log `Bundling …/Projects/wip-wheel/src/index.ts` |
| HUD stuck `CONNECTING TO SHOW SERVER…` | Server not up | Wait ~15s; first wallet wakes Preview server |
| Only gold dead, show OK | Day lock / guest / eligibility | Expected if already claimed today |

---

## Retest ritual (every spin scare)

1. **Fully quit** Creator Hub Preview / Explorer (reload ≠ clean client).  
2. `npm run verify:preview-path`  
3. Start Preview from **this** repo; confirm bundling path + `[SERVER] WIP Wheel Multiplayer Server starting`.  
4. At pad 1: read **hover** before clicking.  
5. If letter pad is up → tap a letter → hover should return to `Spin the show`.  
6. Only if hover is `Spin the show` and click still silent with **no** server `show spin →` line → then investigate bind/UI (not more copy).

---

## Code we will not touch for this scare

- `claimant.ts`, prize tables, letter-pad **flex layout**, `bindUse` distance/priority (unless tree proves ray steal).  
- Inventing a second spin while `canGuess` (that reopens free-for-all chaos Bay already flagged).

---

## If UI is eating the world (DCL gotcha)

Symptom: scene looks fine; **nothing** in 3D clicks.  
Cause: `100%`×`100%` UI root with a pointer handler or `pointerFilter: 'block'`.  
Fix: root always `pointerFilter: 'none'`; handlers only on letter key boxes. See `src/ui.tsx`.
