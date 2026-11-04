# Spin mutex audit — daily vs show on one wheel

**Date:** 9 Oct 2026 (revised same day — meta-audit closed remaining gaps)  
**Trigger:** After publish, daily click → “both wheels spun” → show wheel would not spin afterward.  
**Rule:** Evidence only. MASTER + learnings win over Hub memory.

---

## What we are trying to accomplish (context)

From [MASTER.md](MASTER.md) + [post-demo-zoom-out.md](post-demo-zoom-out.md):

| Horizon | Goal | Status |
|---|---|---|
| **V0 locked** | Enter · daily claim · Thursday signal · spectator spin · real reward | Tech proof done at Bay |
| **Immediate** | Floor readability — honesty before chrome | Honesty F1–F3 done; this pass = shared-wheel mutex |
| **Next** | [station-clarity.md](station-clarity.md) ownership cues | Not started — wait until spin path is trustworthy |
| **V1→V2** | Week card · contestant ritual · turn machine | Explicitly after clarity |

Bay-locked product decision: **one physical wheel serves daily + show.** Do not reopen “two wheels?” mid-build.

---

## Verdict (symptoms)

| Symptom | Root cause (evidence) | Status |
|---|---|---|
| “Both wheels spun” | One `WheelRoot`. Face rotates; ring is static sibling. Daily *is* the WoF prop. | **Explained** — copy/clarity, not a second mesh |
| Show dead after daily | Hover stuck on `Wheel is spinning`; silent show gates; letter debt wiped; 5.6 vs 4.2 timers | **Fixed** (pass 1) |
| Pass-1 leftovers | See § Remaining gaps closed | **Fixed** (pass 2 / this meta-audit) |

---

## Entity graph (composite + `studio.ts`)

```
WheelRoot (520)          ← ONLY entity game.ts rotates
  ├─ WheelDisc           ← face texture (slices)
  ├─ WheelHit            ← muted collider
  └─ WheelHub
WheelFrame (sibling)     ← ring texture, does NOT parent to root → does not spin
Pointer / PointerCap     ← world-parented, static
```

No second wheel mesh / second root in `main.composite`.

---

## What pass 1 changed (code)

| Change | File | Why |
|---|---|---|
| Shared `SHOW_SPIN_SECONDS` / `DAILY_SPIN_SECONDS` | `shared/spinTiming.ts` | Client tween + server busy flag must match |
| `finishDailyWheel` → `restoreShowHover()`; keep letter debt | `game.ts` | Hover is mobile UI; clearing `localNeedsLetter` hid open `canGuess` |
| Show clicks no longer silent | `game.ts` | Feedback on busy / letter / solved |
| Server rejects show while `dailySpinning`; daily while `spinning`/`dailySpinning` | `server.ts` | Shared prop mutex |
| `wheel_busy` error path on client | `game.ts` | Daily sign shows WAIT |

---

## Remaining gaps found in meta-audit (evidence → closed)

| Gap | Evidence | Fix |
|---|---|---|
| **Hover lied after daily land** | `restoreShowHover` → `Spin the show`, but `requestShowSpin` gated on `isDailySpinBusy()` (`landedUntil` ~3.8s celebration). Wheel already stopped. | Removed `isDailySpinBusy` from show path. Celebration stays on daily sign only. |
| **Async claim race** | `await performDailySpin(...)` runs **before** `dailySpinning=true`. Message handlers interleave on await ([auth-server docs](https://docs.decentraland.org/creator/scenes-sdk7/networking/authoritative-servers) — async Storage). `showSpin` could start mid-claim. | In-process `wheelReserve` set **before** await; cleared on fail / daily timer / show finish. |
| **Busy feedback wrote to dead surface** | `styleResultSign` scales `ResultText` to `0.01` (ui-ux-audit **F8**). `setResultText` in `showShowBusy` was invisible. | `showShowBusy` paints **scoreboard** play line (visible) + hover. |
| **Daily stole show strip** | `startWheelAnim('daily')` called `paintShowBoard('DAILY · LOOK AT THE WHEEL')` (F9). Two stations screamed. | Daily mode no longer paints show scoreboard; daily sign owns watch cue. |
| **Stale audit prose** | This file still claimed server “does not check spinning” after pass 1 added it. | This revision. |

---

## Control flow (current, after pass 2)

### Daily

1. Client: busy / anim / `spinning` / `dailySpinning` / wallet / server alive  
2. `room.send('dailySpin')`  
3. Server: if `wheelReserve` or spinning/dailySpinning → `wheel_busy`  
4. `wheelReserve = 'daily'` **then** `await performDailySpin`  
5. On ok: bump `dailyNonce`, `dailySpinning=true`, timer = `DAILY_SPIN_SECONDS`  
6. Clients: `syncSpinSystem` → daily tween; daily sign `LOOK LEFT`  
7. Land: `landDailyPrize` + `restoreShowHover` (letter debt preserved)  
8. Timer: `dailySpinning=false`, `wheelReserve=''`

### Show

1. Pad 1 **or** wheel face → `requestShowSpin`  
2. If `anim` → busy on hover + scoreboard  
3. `sendShowSpin`: gates `dailySpinning` / `spinning` / `canGuess` / solved with visible feedback  
4. Server: `wheelReserve` + same flags; sets `spinning`, timer = `SHOW_SPIN_SECONDS`  
5. Land: `canGuess` if non–try-again; client `finishSpin` restores hover  

---

## Still open (honest — not guessed)

| Item | Evidence | Why not closed here |
|---|---|---|
| Wearable face still says **NFT DROP** (slice 5) | `dailyCatalog.ts` comment + face art | Needs art, not mutex |
| Stub puzzle / `SHOW_OPEN_ALWAYS` copy | ui-ux-audit F4–F5 | Product call; station-clarity |
| Pads 2/3 → SOON | F7 | Station-clarity |
| ResultText still written elsewhere (finishSpin etc.) | F8 partial | Writes harmless while scaled; delete path later |
| Bundle ~7.2MB vs 2.4MB gate | `bin/index.js` size; `micro-eth` present, no `viem` | Pre-existing fulfill path; separate size pass |
| In-Explorer regression of this fix | Not run this session | Must preview before publish |
| `DAILY_WEARABLE_MAX` uncapped remnant | post-demo-zoom-out ops | Ops when hang ends |

**Intentionally allowed:** daily claim while `canGuess` is true (wallet day lock ≠ show letter window). Hover restore now points at `Call a letter` if debt exists.

---

## Regression checks (must run in preview before Worlds)

- [ ] Daily: face moves; daily sign LOOK LEFT → land; show hover becomes `Spin the show` (or `Call a letter` if debt)  
- [ ] Immediately after daily land, show click **works** (no 3.8s fake busy)  
- [ ] During daily tween, show click → hover `Wait — wheel busy` + scoreboard line (not silence)  
- [ ] If `canGuess`, show click → `Call a letter` (pad still works)  
- [ ] Show spin still opens letter pad  
- [ ] Second player cannot start show while first’s daily claim is awaiting Storage  

Frozen surfaces untouched: `ui.tsx` letter pad, `watchingWheel` busy-gate rule, fulfill path.
