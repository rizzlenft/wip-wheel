# Layout regression baseline (pre–Draft A)

**Locked:** 15 Oct 2026  
**Purpose:** Every Draft A / floor step must be compared to this working room. If a step breaks a row below, stop and fix or revert — do not “improve” claim/spin to paper over a blocking mistake.

Companion rule: `.cursor/rules/layout-move-regression.mdc`  
Plan: [layout-draft-a-plan.md](layout-draft-a-plan.md) · Move map: [LAYOUT-MOVE.md](LAYOUT-MOVE.md)

---

## Pre–Draft A blocking (last good three-column set)

From `layout.ts` before Phase 1 (restore reference only):

| Station | Approx |
|---|---|
| `WHEEL` | x 9.6, y 3.2, z 23.4 (vertical face) |
| Contestants | z≈18.2; x 7.4 / 9.6 / 11.8 |
| `DAILY_PAD` / sign | x 20.6, z 17.4 / 20.8 |
| `BOARD` / `STRIP` / `BANNER` | x 16, z≈29–30 |
| `AUDIENCE` | left 10.2, right 21.8, z 11.4 |
| Spawn | z≈14.4–15.6; `cameraTarget` ≈ (17.4, 2.9, 23.2) biased to gold |

---

## Functionality that must remain intact

Proven through 14–15 Oct playtests / Meetup — do not lose these while moving furniture.

| Capability | Evidence / contract |
|---|---|
| Daily one claim / wallet / UTC day | Server `assertDailyClaimant` + Storage; guest fail-closed |
| Daily land labels | Catalog only — never `$WIP` / `payoutFor` on gold |
| Shared `WheelRoot` tween | Daily + show mutex; `wheelReserve`; shared `spinTiming.ts` |
| Show → letter pad | `canGuess` / `localNeedsLetter`; flex column UI frozen |
| Hover = mobile UI | `Spin the daily` / `Spin the show`; busy honesty |
| Sit | `audienceSit.ts` Seat.ts port; walk >1.5 m |
| Fulfill WEARABLE | Autopilot on World; [fulfill-verify.md](fulfill-verify.md) |
| Title card | THURSDAYS (even when live) |
| Pointer hygiene | wipe Hub events; HIT volumes not tweened discs |
| Preview path | Hub = `Projects/wip-wheel` only |

---

## Sightline goals (Draft A) vs occlusion debt

| Goal | Phase 1 status (15 Oct Preview) |
|---|---|
| Gold daily first in spawn FOV | **Pass** — pad/sign in first look |
| Clear line of sight to puzzle board from spawn / seats | Phase 1 **Fail** → Phase 2: compact sign + stage-right offset (re-Preview) |
| Wheel readable from house | Phase 1 partial → Phase 2 should open center aisle |
| Contestant pads / Meetup CTA readable | Pass in Phase 1 screenshot |

**Phase 2 change (15 Oct):** Compact daily panel/disc; HIT unchanged. Mini daily *wheel* mesh still Phase 4.

### False “revert” (15 Oct Phase 2.1) — lock this knowledge

| What it looked like | What it actually was |
|---|---|
| Empty sky, only daily + pink/white “placeholders” | Daily still worked (COME BACK hover). Show set was not deleted. |
| Root cause A | **Daily x overlapped BenchR** — right audience read as stray primitives next to gold. |
| Root cause B | **`cameraTarget` aimed at daily feet** (y≈1.45, z≈11) — first frame looked down at gold, not into board/wheel. |
| Fix | Separate daily AABB from benches; spawn look-at into set (~y 3.1, z 22); `[WIP] floor health` log after `setupGame`. |
| Rule | Do not declare “set reverted” until console shows `floor health` + you’ve walked +Z toward the board. Full quit Preview if Hub names are MISSING. |

### Phase 2.2 — wheel clears board (15 Oct)

| Goal | Change |
|---|---|
| House sees full PHRASE grid | `WHEEL` → x≈9.5, z≈23.5 (stage-left of board at x=16) |
| Pad 1 still owns show spin | Contestants nudged with wheel; P1 at wheel foot |
| Pipelines | Untouched — layout.ts only |

### Phase 2.3 — cold path vs three-column (15 Oct)

| Draft A intent | Failure mode | Fix |
|---|---|---|
| Gold first, then walk to show | `cameraTarget` at board depth → show-first frame | Spawn toward daily; look past gold into aisle |
| After claim, path to show | Only COME BACK / TOMORROW | Tip `SHOW UP THE AISLE` (copy only) |
| Sit is later | Sit label in spawn cone | AudienceLabel on bench row |

### Phase 2.4 — vestibule (16 Oct) — INVALID / REVERTED

East daily + look +X fixed wallpaper but broke Draft A (sideways vs set). Reverted.

### Phase 2.3 thrash (16 Oct) — same empty-set class as 2.1

Center spawn → `cameraTarget` on far stage-right gold → look mostly +X → empty sky + pink pad (set still there).  
Full mistake log + locked look-ray recipe: [layout-mistakes.md](layout-mistakes.md).

---

## Per-step comparison checklist (copy into playtest notes)

After each layout Preview:

- [ ] `verify:preview-path` + correct bundle path  
- [ ] Spawn FOV matches the phase intent (daily-first for Phase 1)  
- [ ] Board / wheel not *unintentionally* blocked (note known debts)  
- [ ] Daily spin → wheel moves → correct land label  
- [ ] Show pad 1 spin → letter when owed  
- [ ] Sit / stand  
- [ ] No new `$WIP` on gold; no guest YOU WON  
- [ ] Diff vs this baseline: what improved / what regressed  

Screenshot of Phase 1 occlusion: session asset `Screenshot_2026-10-15_at_4.47.25_PM-*.png` (daily sign wall).
