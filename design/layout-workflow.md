# Set dress workflow — simple again, pipelines intact

**Question (16 Oct):** Should we stop carefully nudging meters and instead recreate the set in the right places — like the early WoF prompts that “just looked right”?

**Answer:** Recreate **looks** in Creator Hub. Do **not** recreate **systems**. Sync Hub positions into `layout.ts` so code keeps owning integrity.

---

## What felt hard (and what didn’t)

| Felt hard | Actual cause |
|---|---|
| Endless Preview thrash | Optimizing **spawn look-ray** + conflicting “gold first” vs “set visible” docs |
| “Moving things carefully” | Agent editing `layout.ts` numbers **blind**, without Hub visual composition |
| Afraid to break claim/spin | Correct instinct — those are frozen for good reason |

| Was never the hard part | |
|---|---|
| DCL Transform API | Solved — [positioning.md](positioning.md) |
| Pipelines | Bind to **names + roles**, not meters — [pipelines.md](pipelines.md) |
| Early WoF set | Built as **visible scenery** (Hub / composite), not as spawn-math experiments |

So: we overcomplicated **cold-path cameraTarget**, not “placing a bench.”

---

## Do not recreate

| Keep as-is (tested integrity) | Why |
|---|---|
| Daily claim / identity / catalog | V0 freeze |
| Show spin / letters / mutex | V0 freeze |
| Fulfill path | V0 freeze |
| Entity **names** (`WheelRoot`, `SpinButton`, benches, …) | `getEntityOrNullByName` / `moveNamed` / sit |
| `facingSpinZ` axis until Phase 3 | Spin honesty |
| Gold vs magenta authorities | [pipelines.md](pipelines.md) |

Recreating those “in the right place” = rebuilding weeks of proof. **Wrong lever.**

---

## Do use the early-WoF workflow (for dress only)

Official DCL split ([create-scene](https://github.com/decentraland/sdk-skills/blob/main/create-scene/SKILL.md)):

| Layer | Where | Job |
|---|---|---|
| **Scenery** | Creator Hub → `main.composite` | Looks, blocking, intimacy — gizmos, snap, numeric Transform |
| **Logic** | TypeScript | Claim, spin, sit bind, hover, mutex |
| **Meters bridge** | `src/layout.ts` | Single source so Hub and code don’t fight |

### Recommended loop (back to simple)

```
1. Freeze spawn      — SPAWN_DOC locked ([layout-mistakes.md](layout-mistakes.md)). Don’t open that door.
2. Hub visual pass   — Move ONLY named set pieces until the room looks like Draft A from aisle + seats.
                     Keep names. Align-to-world. Snap on. One composition goal per session.
3. Sync to layout.ts — Copy Hub Transform x/y/z into the matching constants (WHEEL, AUDIENCE, …).
                     Code moveNamed will re-apply them every boot — Hub alone is not enough.
4. One cold Preview  — verify:preview-path; floor health; daily + show smoke (not a layout invent session).
5. Stop              — Next session = next dress goal, or Phase 3 rake as its own publish.
```

That is the “few prompts / looks great” workflow: **eyes in Hub**, not chat inventing Δx.

### Why Hub alone isn’t enough here

`studio.ts` / `countdown.ts` call `moveNamed(...)` from `layout.ts` on load. If you only move in Hub and skip the sync, **next Preview snaps props back**. Early WoF sets didn’t have that dresser loop; we do — on purpose — so pipelines stay tied to roles.

**Integrity rule:** Hub proposes the look → `layout.ts` records the meters → code reapplies → pipelines never care where the mesh sat.

---

## Code-built props (daily sign, board tiles)

Some dress is created in TS (`dailyWall`, board), not Hub. For those:

- Still change **only** `layout.ts` / dresser constants — or  
- Optionally promote a static shell to a **named Hub entity** later (same name contract), then `moveNamed` — bigger art pass, not required to unblock intimacy.

Do **not** rewrite daily claim to “recreate the gold pad.”

---

## Recreate vs move — decision table

| Goal | Move (`layout.ts` / Hub sync) | Recreate from scratch |
|---|---|---|
| Intimate spacing / WoF read | **Yes** — Hub visual + sync | No |
| New decorative prop | Hub entity + name + layout constant | Only if not claiming/spinning |
| Fix spawn empty sky | Look-ray recipe only | Never |
| Broken claim after art | You renamed or thawed — rollback | Don’t “rebuild daily” |
| Raked wheel | Phase 3: Hub tip + `facingSpinZ` together | Not a clean-room rewrite |

---

## What to stop doing

- Meter-nudging in chat every Preview without Hub eyes  
- Judging whole Draft A from a single neon/spawn step  
- Reopening spawn axis theories  
- Hand-editing `main.composite` JSON while Hub has the scene open  
- Second Hub tree (`Scenes/…`) — always `Projects/wip-wheel`

---

## Immediate recommendation

1. **Adopt this workflow** for Steps 2–4 on [layout-next.md](layout-next.md): Hub composition → sync `layout.ts` → one smoke Preview.  
2. **Keep spawn frozen.**  
3. **Do not** greenfield-rebuild the show.  
4. Optional later: one intentional Hub art bake (better benches / stage lip) with names preserved — still sync meters after.

Integrity stays in pipelines + names. Beauty returns to Hub. Chat stops inventing geometry.

---

## Exact sync procedure

See **[layout-hub-sync.md](layout-hub-sync.md)** — MCP connect, name→constant map, group moves, checklist, smoke. Read before any Hub dress session.
