# Layout drafts — TV gameshow floor (pre-move)

**Date:** 15 Oct 2026  
**Status:** **Draft A chosen.** Execution: [layout-draft-a-plan.md](layout-draft-a-plan.md).  
**Live today:** Phase 1–2 *blocking* only (vertical wheel) — looks like Draft D dress. Canvas Draft A image ≠ Preview until compress + Hub mass + Phase 3 rake. See [layout-draft-a-path.md](layout-draft-a-path.md).  
**Companions:** [MASTER.md](MASTER.md), [station-clarity.md](station-clarity.md), [playtest-14oct.md](playtest-14oct.md), [playtest-15oct-meetup.md](playtest-15oct-meetup.md), [ui-ux-audit.md](ui-ux-audit.md).

Interactive comparison: canvas `layout-drafts` (floor-plan schematic — not a photo of the finished set).

---

## What feedback + TV grammar demand

| Source | Need |
|---|---|
| Cold testers / Bay | Gold daily unmistakable in first frame; then a path into the show |
| 7–9 Oct | Shared wheel across the set → miss the spin; gold/pink grammar |
| Meetup sit | Board must stay in seated FOV; wheel should still *mean* something |
| Real WoF | Horizontal (or near-horizontal) wheel; contestants face the house; board readable from every seat; set is **intimate**, not a warehouse |
| V2 prep | Three booths that will lock players into turn rotation — face spawn/audience now |

Parcel budget: **2×2** (~32×32 m). Keep the set inside roughly **x 6–26, z 4–30** so nothing feels empty.

---

## Horizontal wheel — visibility research (why pure flat fails)

On TV, the wheel looks huge because **cameras look down** from a crane/balcony and the audience sits on a **rake**. In Decentraland:

- Standing third-person already tips the view slightly down — helps a little.
- **Seated** players look more level — a true XZ-flat disc collapses to a thin ellipse; wedges become unreadable past ~8–10 m.
- There is no broadcast camera for everyone; only optional `VirtualCamera` beats (desktop freeze; web/mobile walk-under-cam).
- Engine kills VirtualCameras outside parcel AABB — framing must stay inside the 2×2.

**Controls that work (stack them; do not rely on one):**

| Control | Effect | Cost / risk |
|---|---|---|
| **Rake the wheel 20–35° toward the house** | Face stays readable from benches without losing “horizontal” feel | Spinner at the rim still leans over it; best default |
| **Raise the wheel on a short pedestal** | Top of disc nearer eye height from seats | Don’t block board |
| **Audience risers (already have)** | Look down onto the face | Keep aisle clear of board |
| **Show-only VirtualCamera beat** | Guarantees a readable spin for the room | Desktop InputModifier; retune after layout |
| **Optional “face repeater”** (small plane above / beside wheel) | Far seats see wedges | Must never disagree with the physical stop — honesty rule |
| Pure vertical (current) | Maximum phone readability | Least WoF-like |
| Pure flat 0° | Most WoF-like at the rim | **Fails Meetup seats** without heavy cam + rake |

**Recommendation:** treat “horizontal” as **raked horizontal** (~25° tip toward audience), not CAD-perfect flat. That is how most live game-show floors read in person anyway.

---

## Daily: smaller + first — and the shared-wheel question

Today one `WheelRoot` serves daily and show (Bay “physical wheel” for daily). That forced gold stage-right and wheel stage-left — proven miss.

For the final format, prefer:

1. **Small daily wheel** at the gold station (physical spin, short tween, Wearable catalog only).  
2. **Show wheel** (raked, larger) as the Thursday centerpiece.  

Bay proof 2 is satisfied by a *physical* daily spin, not by forcing one mesh to do both. Pipelines stay split ([pipelines.md](pipelines.md)); only the dress changes. Mutex still needed if both can animate at once — same server rules, two roots or one root reserved.

Until that split ships, Draft A/B can still use **one show wheel** and a gold pad that *points* at it — worse motion readability, cheaper move.

---

## Draft A — “Procession”

**Superseded as the target pose** by [layout-draft-round.md](layout-draft-round.md) (16 Oct): flat low wheel in the middle, podiums in front of the board facing it, benches two deep around the house side, small daily wheel stage-right. Centerline method still applies. The block below is the floor that was in Preview before that revision.

**Story:** Spawn → small daily → walk the aisle → sit or approach contestant row → show wheel + board.

**Shipped 16 Oct (centerline — matches the floor-plan picture):**

```
 z≈27.5 [ PUZZLE BOARD ]                 x=16
 z≈22   ( SHOW WHEEL — rake −25° in tree, confirm in Preview )
 z≈18.4 [ P1 ] [ P2 ] [ P3 ]             x=13 / 16 / 19
 z≈14.8 [ bench band …… walk gap …… ]
 z≈10.6 ● GOLD SIGN on the centerline    ← blocks the aisle (see deviation)
 z≈8    ★ spawn, look +Z through daily
```

**Accepted deviations (not built yet — do not “fix” by sliding the whole floor again):**

1. **Daily** — replace the centerline sign with a **small raked wheel, just stage-right of the aisle**, so the walk up the middle stays open. Same rake idea as the show wheel. Spawn stays on the aisle; daily is the habit object beside the path, not a wall on it.
2. **Board** — rebuild so the puzzle, letters, and scores read as separate layers, and a **seated** viewer sees the **entire phrase** once the show wheel is raked. Nudge board or wheel off pure center only if that sightline requires it, and write the new meters here.

| Piece | Placement intent |
|---|---|
| **Spawn** | On the aisle (x=16), south of the house. Look **+Z** through the gap (`cameraTarget` z≈18). |
| **Daily** | **Next:** small raked wheel stage-right of the aisle. **Now:** flat sign on x=16 (blocks the walk — known fail). |
| **Audience** | Bench band under the pads, walk gap on x=16. Sit looks at the **whole puzzle**. |
| **Contestants** | P1 P2 P3 centered, facing spawn. Pad 1 = show spin. |
| **Wheel** | Centered behind the pads until rake. Rake ~25° toward the house is the next show-wheel pass. |
| **Board** | Back wall. **Next:** reconstruct for clarity + full phrase from the seats after rake. |

**Why this matches feedback:** daily is the first habit object; show is a destination; Meetup seats face the board; contestants read as “on TV” facing the room.

**Risks:** two wheels (or one wheel + small daily) = art + mutex care; raked mesh needs Hub GLB / Transform, not only `layout.ts` numbers.

---

## Draft B — “TV rake” (most WoF-like)

Same procession, but **audience higher** and **stage lower** so the house looks down onto a near-flat wheel.

```
 Audience (y raised)  →  looking down
 Contestants at wheel rim, facing house
 Wheel nearly flat (10–15° tip)
 Board elevated on back wall
 Daily still at spawn vestibule
```

**Wins:** best “horizontal wheel” authenticity for seated viewers.  
**Costs:** more vertical art (risers, stairs); phone FOV and sit emotes need re-tuning; easier to clip the board if risers are too far back.

Use if you commit to a real Hub art pass on benches + wheel stand in the same move.

---

## Draft C — “Lobby + studio” (strongest daily-first)

```
 [VESTIBULE]          [STUDIO beyond threshold]
 ★ spawn + gold daily    benches → contestants → wheel → board
 small daily wheel only     full show set
```

A floor threshold / lighting change (not a load screen) marks “you finished the habit; now you’re in the show.”

**Wins:** impossible to confuse gold with pad 1; Meetup can hang in the studio without the daily disc competing.  
**Costs:** uses more of the 2×2 depth; cold users who ignore daily might not cross the threshold — need a soft open arch, not a wall.

---

## Draft D — keep vertical wheel, fix blocking only (lowest risk)

Keep current vertical face; reorder to procession (daily front → audience → contestants facing house → wheel → board).

**Wins:** no visibility gamble; smallest art change.  
**Costs:** never feels like TV WoF; VirtualCamera still helps but the set won’t “read” as the real show.

Park unless the horizontal research proves too expensive for the next publish.

---

## Contestant booths (all drafts)

| Now | Target |
|---|---|
| Pads face vaguely toward board / side | Face **−Z toward spawn/audience** |
| Labels `2` / `3` look playable | `SOON` / empty score pods only |
| No lock-in | Placeholders until V2 `movePlayerTo` + turn mutex |

Booth depth: shallow (~1 m) so they don’t hide the wheel from the aisle. Contestors stand *in front of* the wheel rim (TV grammar), not between audience and board in a way that blocks the puzzle.

---

## What we will not break when we move

From [LAYOUT-MOVE.md](LAYOUT-MOVE.md) + freeze:

- Entity **names** (`WheelRoot`, pads, benches, daily sign)  
- Daily vs show **pipelines** (catalogs, claim, letter pad)  
- One concern per publish; Preview before World  

**Move order (when a draft is chosen):**

1. Put all new coordinates in `layout.ts` only (plus `scene.json` spawn).  
2. Add `SHOW_CAM` / daily-small offsets to `layout.ts` — no hardcoded meters in `showCam.ts`.  
3. Hub art: wheel orientation / small daily mesh — same names.  
4. Preview sightlines: standing spawn → seated Meetup → pad 1 spin.  
5. Then retune VirtualCamera once.

---

## Pick before any code move

| If you want… | Pick |
|---|---|
| Best match to your brief (intimate, daily-first, board + wheel, booths face house) | **Draft A**, with raked wheel + small daily |
| Maximum WoF authenticity and you’re ready for riser art | **Draft B** |
| Hard separation of habit vs show | **Draft C** |
| Smallest risk this week | **Draft D** |

Recommendation: **A**, with wheel rake researched in Preview before World; defer pure-flat until seats prove they can still read the face.
