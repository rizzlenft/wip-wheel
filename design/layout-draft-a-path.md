# Draft A — centerline placement (16 Oct)

**Why we kept missing the diagram:** we shipped an occlusion workaround (wheel at x≈9.5, gold at x≈20.5) and scored z-order as Draft A. The floor plan is one stack on **x=16**. That workaround is reverted in `layout.ts`. Rake and art stay later.

**16 Oct Preview:** centerline functions (daily, show spin, sit). Two follow-ups are now part of the draft, not new theories:

1. Daily sign on x=16 **walls the aisle** — next form is a small raked wheel just stage-right of the walk.
2. Board reads as one janky slab (phrase + keyboard + scores, wheel covering center). Rebuild for a clear puzzle and a full seated sightline **after** the show wheel rakes. Update meters in [layout-drafts.md](layout-drafts.md) if that sightline leaves pure center.

---

# Draft A — why agents keep saying “correct” when you don’t (16 Oct)

**Your call is right.** Live does **not** deliver Draft A procession. Agents kept scoring a *different* test.

---

## Root cause (the real bug)

We silently **replaced** Draft A’s success criteria.

| Draft A (canvas + [layout-drafts.md](layout-drafts.md)) | What agents scored as “pass” |
|---|---|
| **Story:** spawn → notice **small gold** → **walk the aisle** into the house → sit or pads → **raked** wheel + board | Stations exist on +Z; not empty sky; Sit click works; show spin logs; `SPAWN_DOC` syncs |
| **Cold FOV:** gold is the **habit object in first look** | Gold is *somewhere* stage-right while **PHRASE fills the frame** |
| **Procession:** the room *reads* as a path into a show | You can *walk* from A to B on gray floor past pink boxes |
| **House then stage** | Two pink bars under a floating board in outdoor void |

So: meters-in-order + “nothing crashed” ≠ Draft A. Calling that “functional procession” was a category error. Your screenshots fail the left column; we celebrated the right column.

---

## Second trap — we moved the goalposts after empty-sky

After look-ray failures we locked:

> spawn near gold, `cameraTarget` **past** gold → set-first attention, gold beside the ray

That **contradicts** Draft A’s cold sentence (gold first in FOV). Then we scored the *new* look-ray as Draft A pass.  
Documented already in [layout-preview-compare-16oct.md](layout-preview-compare-16oct.md) — we did not treat it as a hard fail.

**Third trap:** parking art/rake, then claiming procession “holds.” Draft A’s procession *is* the read (habit → aisle → house → show). Without that read, blocking alone is not Draft A — it’s Draft D reorder with a vertical wheel.

---

## Honest score vs *your* last spawn + sit shots

| Draft A win (from canvas / drafts) | Live | Grade |
|---|---|---|
| Habit object dominates cold FOV | Board + sky dominate; gold is a side panel | **Fail** |
| Clear “walk into the show” aisle | Gray floor; pink slabs; no house corridor | **Fail** |
| Seats read as studio house | Pink rectangles | **Fail** (art parked — still a Draft A fail) |
| Booths face house; pad 1 at wheel | Roughly present | Weak pass |
| Raked wheel readable from seats | Vertical | **Fail** (parked — still a Draft A fail) |
| Board destination at back | Present | Order only |

**Verdict: Draft A procession = not shipped.** Do not say otherwise.

---

## Rule from now (agents)

1. **Never** mark Draft A pass from floor health / spawn-sync / “stations present.”  
2. Pass only if the **player story** rows above pass — judge from *user* screenshots against the left column.  
3. If art/rake are parked, say: **“Draft A story still fail; parked levers mean we cannot close look yet — open functional levers only: cold FOV / daily size / labels / spawn contract rewrite.”**  
4. Do not invent a third meaning of “procession.”

---

## What is still *in scope* without Hub art

These are the only code/layout levers that can move toward Draft A story while art/rake stay parked:

| Lever | Why it matters for Draft A |
|---|---|
| **Cold FOV / gold-first** | Reconcile spawn contract with “habit in first look” — may need smaller daily, different `cameraTarget`, or accept rewritten Draft A cold sentence *in writing with you* |
| **Label / clutter** | Reduce SHOW/SOON/SIT fighting the read |
| **Depth / aisle width** | Only if a *named* story fail (not “feels warehouse”) |

**Out of scope until unpark:** bleacher meshes, neon walls, wheel rake, “looks like the canvas image.”

---

## One sentence to keep

> **If the cold screenshot does not read “small gold first, then a path into a house and show,” Draft A is failing — regardless of z-order and green verifies.**
