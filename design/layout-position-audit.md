# Position audit — current vs Draft A (16 Oct)

**Sources:** `src/layout.ts` + `scene.json` (verified in sync) · [layout-drafts.md](layout-drafts.md) · [layout-spawn-desync.md](layout-spawn-desync.md) · [layout-next.md](layout-next.md)

**Spawn sync:** `npm run verify:spawn-sync` = OK (after Hub overwrite repair). Always re-check after Hub spawn edits.

---

## Floor map (meters, scene space)

```
z≈29.6  BOARD / BANNER / STRIP     x=16     ✓ Draft A back wall
z≈23.5  WHEEL                      x=9.5    ✓ stage-left (still VERTICAL)
z≈19.3  P1 / P2 / P3               x=8.8 / 11.2 / 13.6   ✓ arc toward house
z≈15.2  AUDIENCE benches           x=10.4 L / 16.8 R     ✓ clear of daily x≈20.5
z≈14.05 NeonFront                  HIDDEN                 ✓ aisle open (Hub match)
z≈11.4  DAILY_SIGN                 x=20.5                ✓ stage-right
z≈10.6  DAILY_PAD                  x=20.5                ✓
z≈8.0   SPAWN mid                  x=19.3  look→(18.25,3,20)  ✓ contract / in sync
```

Procession order on disk matches Draft A **blocking**. What fails is **dress + cold-story clarity + rake**, not “everything is in the wrong parcel.”

---

## Piece-by-piece

| Piece | Now | Draft A wants | Gap |
|---|---|---|---|
| **Board** | (16, 29.55) | Back wall center | **OK** |
| **Wheel** | (9.5, 3.2, 23.5) vertical | Stage-left, **raked ~25°** | Position OK; **rake = Phase 3** |
| **Pads** | z≈19.3, P1 at wheel foot | Contestant row facing house | **OK** blocking |
| **Audience** | z=15.2, split L/R, aisle ~x13.6 | Seats, clear aisle, sit→board | Blocking OK; **read** still pink slabs (Hub art) |
| **Neon** | z=14.05, w=14 | Stage lip, not cold fence | **OK** for Step 1 |
| **Daily** | x=20.5 compact panel | Stage-right, small, habit object | **OK** blocking; may still compete in FOV (Step 3) |
| **Spawn** | Near gold (19.3, 8) → look past to z=20 | Same contract (updated drafts) | **OK** if we keep gold-near story |
| **Spawn (your Hub mockup)** | Aisle center ~(13.6, 15) | — | **Different product** — show-first / already in house; daily behind you |

---

## Depth story diagram

```
YOUR HUB MOCKUP (aisle)          CURRENT CONTRACT (gold-near)
         BOARD                            BOARD
          ↑                                ↑
       [pads]                           [pads]
      [L] aisle [R]  ← spawn here      [L] aisle [R]
         neon                              neon
                                           ● gold  ← habit
         · daily behind                    ★ spawn
```

Both can look “at the set.” Only gold-near matches Draft A **Spawn → daily → aisle → show**.

---

## What the spawn desync changes about the work

| Before we knew | After |
|---|---|
| Fight meters / invent axes when Preview ≠ Hub | Check `scene.json` + `verify:spawn-sync` first |
| Trust Hub spawn ghost | Ghost can lie; disk can have `y=-1.25` |
| `SPAWN_DOC` “locked” while Hub rewrote disk | Lock = **sync scripts** + refuse Hub-only spawn |
| Blame “can’t place things” | Dual authoring without mirror |

**Additional work that is now mandatory (ops, not dress):**

1. After **any** Hub spawn/Camera Target drag → `npm run sync:spawn` **or** update `SPAWN_DOC` then sync.  
2. Cold Preview only after `verify:preview-path` (includes spawn sync).  
3. Full quit Explorer after spawn file changes.  
4. Decide **explicitly**: keep gold-near cold path **or** switch to aisle-center (rewrite Draft A cold sentence + `SPAWN_DOC` + sync). Do not mix.

No new geometry invention required to “fix” desync — tooling is in place.

---

## Draft A “looks like” gaps (priority)

### A — Product fork (decide once)

| Option | Do |
|---|---|
| **Keep gold-near** (current contract) | Leave `SPAWN_DOC`; ignore aisle Hub mockup; if Hub drifts, `sync:spawn` |
| **Switch to aisle-center** | New `SPAWN_DOC` (x≈13.6, z≈15, look +Z to board); accept daily-behind; update drafts/contract; `sync:spawn`; one Preview |

Until you pick, Hub aisle experiments will feel like bugs.

### B — Dress ladder (still valid)

| Step | Status | Notes |
|---|---|---|
| 0 Spawn sync hygiene | **Done** (scripts) | Re-run after Hub |
| 1 Neon lip | Done | |
| 2 Sit label house-facing | Code done | Confirm in Preview |
| 3 Daily size/offset if PHRASE walled on gold | Pending | Only if needed |
| 4 Optional depth compress | Pending | Hub eyes + sync `AUDIENCE`/pads/wheel together |
| 5 Wheel rake | Parked | Biggest “not WoF” visual; separate publish |
| 6 Mini daily wheel | Parked | |

### C — Hub visual pass (workflow, not more chat Δx)

Intimate set still needs **Hub composition** (better benches, stage lip, less outdoor void) with names kept → sync `layout.ts` ([layout-hub-sync.md](layout-hub-sync.md)). Connect Creator Hub MCP when you want the agent to do that with eyes.

### D — Do not do

- Recreate claim/spin/letter  
- Vestibule / look +X  
- Hub-only spawn without sync  
- Rake + spawn + audience in one Preview  

---

## Integrity check (still green)

| Loop | Expect |
|---|---|
| Spawn file | Matches `SPAWN_DOC`, y=0 |
| Daily | Hover / sit unrelated; pipelines frozen |
| Show pad 1 | Still at wheel foot |
| Sit | You confirmed works |

---

## Recommendation

1. **Decide cold path:** gold-near (stay) vs aisle-center (change contract once).  
2. **Treat spawn as ops:** never Hub-drag without `sync:spawn` / verify.  
3. **Next dress:** finish confirming Step 2 in Preview; then Hub session for audience intimacy (Step 4-ish) with sync map — not spawn thrash.  
4. **Rake** when ready for a dedicated Phase 3 publish — that’s the large Draft A visual remaining after blocking.

Blocking is largely **where Draft A said**. Remaining work is **story choice (spawn)**, **Hub dress**, and **wheel rake** — plus never letting Hub and `scene.json` diverge again.
