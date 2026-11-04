# Spawn Hub vs Preview desync (16 Oct)

**Symptom:** Hub Spawn Area mockup shows avatar in the **center aisle**; Preview/World spawn is somewhere else (e.g. south of the pink lip, looking at the board; or near daily). Sit still works.

**This is real, accountable, and was biting us.** It is not “DCL can’t place things.”

---

## What Explorer actually uses

**Runtime spawn = `scene.json` → `spawnPoints` only.**

Not `layout.ts` `SPAWN_DOC` (docs only, unless we mirror).  
Not the Hub gizmo’s “looks right” unless Hub **wrote** those meters into `scene.json`.

Creator Hub Spawn Area UI → on save → writes `scene.json` **and** the Scene component inside `main.composite`. Preview reads `scene.json`.

---

## What we found on disk (after your Hub edit)

```json
"position": {
  "x": [17.1, 18.5],
  "y": [-1.25, -1.25],   // ← underground / wrong
  "z": [7.3, 8.7]
},
"cameraTarget": { "x": 18.25, "y": 3, "z": 20 }
```

| Field | Meaning |
|---|---|
| Mid spawn ≈ (17.8, **−1.25**, 8) | South of neon (z≈14), **not** between benches (z≈15, x≈13.6) |
| Look → (18.25, 3, 20) | Into the set — matches your **third** shot (board ahead, pink lip in front) |
| Float noise (`17.10000038…`) | Classic Hub write, not our hand-edited integers |
| `y: -1.25` | Hub wrote a bad height (Spawn Entity parenting / offset). Feet should be **y = 0** |

Your **Hub mockup** (aisle between benches) is **not** what `scene.json` contains. So either:

1. The translucent figure you moved is **not** the Spawn Entity that gets serialized (Spawn vs Camera Target vs another prop — Hub has two pieces: [Spawn Areas](https://docs.decentraland.org/creator/scene-editor/build/spawn-areas)), or  
2. Hub preview showed a placement that **didn’t flush** the same numbers to `spawnPoints`, or  
3. You moved spawn visually then something else (agent/`layout` docs / older save) left z≈8 in `scene.json`.

**Third screenshot = honest to current `scene.json`.**  
**Second screenshot = Hub editor intent that never became runtime truth.**

---

## Triple source of truth (the bug class)

| Source | Role | Danger |
|---|---|---|
| Hub Spawn Area gizmos | Visual authoring | Can write weird `y`; easy to move the wrong child |
| `scene.json` `spawnPoints` | **Runtime authority** | What Preview/World use |
| `layout.ts` `SPAWN_DOC` | Project contract / comments | **Does not apply itself** — we must mirror |

We treated `SPAWN_DOC` as locked while Hub silently rewrote `scene.json` → Preview ≠ contract → chaos that felt like “placement is impossible.”

Same class as Hub scenery vs `moveNamed`: **visual edit without the file Explorer reads** = desync.

---

## Aisle-center vs daily-first (product, not a bug)

| Intent | Spawn | Cold path |
|---|---|---|
| Draft A habit-first (contract) | Near gold, look past gold into set | Daily clickable early; then walk aisle |
| Your Hub mockup | Center aisle between benches (x≈13.6, z≈15) | **Already in the house** — daily is *behind* you (daily z≈10.6) |

Wanting aisle-center is valid, but it is a **different cold story** than gold-first. Choose explicitly; don’t let Hub overwrite by accident.

---

## How we account for it (rules)

1. **`SPAWN_DOC` → `scene.json` is mandatory** after any spawn change (either direction).  
2. **Never trust Hub spawn preview alone** — open `scene.json` and confirm x/y/z/`cameraTarget`.  
3. **Reject `y < 0`** on spawn (clamp to `0`).  
4. **`npm run verify:spawn-sync`** must pass before trusting a cold Preview.  
5. Hub MCP / human Hub edit of spawn = same sync checklist as [layout-hub-sync.md](layout-hub-sync.md).  
6. Full quit Explorer after spawn edits (leave+re-enter); hot reload can keep old feet.

---

## Fix applied this session

- Restore `scene.json` from `SPAWN_DOC` with **`y: [0, 0]`**.  
- Add `scripts/verify-spawn-sync.mjs` + npm script.  
- Wire into verify path / docs.

If you then want **aisle-center** as the real product spawn, we change `SPAWN_DOC` on purpose (look-ray check), mirror `scene.json`, and update the Draft A cold-path sentence — not via a Hub-only drag.
