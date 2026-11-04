# Preview compare — research vs what we shipped (16 Oct 9:44)

**Shot:** cold/aisle view — board center, wheel left, daily right, pink benches under sit labels.  
**Question:** Is this what we were going for? If not, where did research / Draft A / Step 1 diverge?

---

## Short answer

**Partially.** This matches **blocking + look-ray survival** (face into set, stations present, not empty sky / sideways).  
It does **not** yet match **Draft A as a feeling** (habit-first intimate procession).  

Step 1 only moved the neon lip. Judging “is this Draft A?” from this frame confuses **one dress tick** with **the whole brief**. That mismatch is a process error we need to lock.

---

## Side-by-side

| Claim (research / plan) | What the shot shows | Match? |
|---|---|---|
| Face mostly **+Z** into the set ([positioning.md](positioning.md), look-ray) | Avatar faces board / “SPIN TO START” | **Yes** |
| Set not deleted; board + wheel on ray ([layout-mistakes.md](layout-mistakes.md)) | Purple board + wheel visible | **Yes** |
| Daily stage-right, house-facing | Gold sign on right, hover works | **Yes** |
| Wheel stage-left of board | Wheel left of PHRASE | **Yes** |
| Step 1: neon not a fence at spawn feet | Pink barrier no longer dominates mid-frame (vs prior fence shot) | **Likely yes** for Step 1 only |
| Draft A: **gold is the first habit object** in FOV ([layout-drafts.md](layout-drafts.md)) | Board dominates; daily is a side panel | **No — tension** |
| Draft A spawn: center-low x≈16, `cameraTarget` **on gold** | We ship spawn near gold, target **past** gold at z≈20 | **Docs disagree with code** |
| Spawn contract: gold **near** on ray, board **far** (peek) | Board fills attention; gold secondary | **Recipe working as coded** — undercuts “gold first” marketing |
| Audience: seats facing board; clear aisle | Pink blocks read under sit labels near **wheel**, not a clear house arc | **Weak** |
| Wheel **raked** ~25° | Still vertical | **Expected** (Phase 3 parked) |
| Intimate set / not outdoor void | Flat ground + sky; sparse | **No** — Steps 2–4 / art, not neon |
| One concern = one success metric | Shot judged as whole Draft A | **Process fail** |

---

## Inconsistencies to learn from (ranked)

### 1. Two conflicting “first look” definitions (open gap)

| Source | Says |
|---|---|
| [layout-drafts.md](layout-drafts.md) | Spawn center-low; `cameraTarget` aims at **gold**; gold in first FOV |
| [layout-spawn-contract.md](layout-spawn-contract.md) + mistakes log | Spawn near gold; `cameraTarget` **past** gold into set so board doesn’t vanish / wallpaper |

We **chose** the second after empty-sky / wallpaper failures. The shot is honest to that choice: **set-first attention, gold beside the ray**.  

**Learning:** Until we rewrite Draft A copy to “gold reachable + set visible on cold enter,” we will keep feeling disappointed by a look-ray that is doing its job. **Close the doc gap** — pick one success sentence:

> Cold enter: face into the set; gold is **clickable in the right third**; board/wheel readable ahead — not “gold fills the crop.”

### 2. Step 1 success ≠ Draft A done

Research ([positioning.md](positioning.md) protocol): one concern, one Preview.  
Step 1 concern = neon fence.  
Evaluating intimacy / habit-first / rake from that Preview = measuring the wrong thing.

**Learning:** Caption every Preview: “Pass/fail **Step N only**.”

### 3. `layout-drafts.md` spawn table is stale

Still says center-low + aim at gold. Code + spawn contract contradict it. Agents (and humans) will “fix” toward the draft table and re-break look-ray.

**Learning:** Update drafts placement table to match spawn contract, or mark it superseded.

### 4. Audience geometry ≠ audience *read*

Meters put benches at z≈15. In third-person they lump with pad/wheel (left cluster + floating sit text). Draft A wants a readable **house** then stage. Research told us *how* to move meters; it didn’t make pink risers look like seats.

**Learning:** Step 2 is about **read** (paint, label placement, maybe slight AUDIENCE offset) — not another spawn theory.

### 5. Intimate WoF needs Phase 3 + depth, not more spawn math

Vertical wheel + empty skybox is the biggest “not WoF” signal. Positioning research correctly parks rake. Neon nudge cannot create intimacy.

**Learning:** Don’t spend more cold-path axis edits chasing “feels like TV.”

---

## What was *not* wrong in this shot

- Facing into the set (research axes)  
- Board / wheel / daily all present (not mistake #4 empty sky)  
- Daily not stacked as wallpaper on PHRASE center  
- Pipelines / facingSpinZ untouched  
- Step 1 lever was correct for its narrow goal  

---

## Close the gaps (doc + next Preview)

1. **Doc:** Align [layout-drafts.md](layout-drafts.md) spawn blurb with spawn contract (gold beside ray, set ahead).  
2. **Mark Step 1:** Pass if neon isn’t a spawn-feet fence — independent of “feels like Draft A.”  
3. **Next code:** Step 2 only — audience sit read ([layout-next.md](layout-next.md)).  
4. **Do not:** Retune spawn because the board looks important in this frame — that’s the locked recipe.

---

## One-line verdict

This Preview is **what the look-ray + blocking math produce**, and **what Step 1 was allowed to change** (neon). It is **not** yet Draft A’s intimate habit-first show — and research already said that gap is dress → rake, not another coordinate invention.
