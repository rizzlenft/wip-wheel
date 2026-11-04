# V1 go-live checklist — rizzle.dcl.eth

One page. Do steps **in order**. Check each box.

**Automated repo gate:** `npm run verify:v1-publish`  
**Bay email after deploy:** [bay-v1-handoff.md](bay-v1-handoff.md)

---

## Phase 1 — Scene Storage (15 min)

**Important:** **Preview** and **World** use **different** storage backends.

| Where you play | Where env vars live | How to set |
|----------------|---------------------|------------|
| **Hub Preview** (`localhost:8000`) | Local preview server | `npm run storage:v1:preview` **while Preview is running**, then restart Preview |
| **World** (`rizzle.dcl.eth`) | DCL cloud (`storage.decentraland.org`) | Creator Hub Storage **or** `npm run storage:v1` |

Setting vars only in Hub for the World **does not** fix Preview logs (`404` on `http://localhost:8000/env/...`). That is **expected** until you run `storage:v1:preview` or test on World after deploy.

### Option A — Creator Hub (World / production)

1. [ ] Open **Creator Hub** → project **`~/Projects/wip-wheel`**
2. [ ] Go to **Storage** (or **Environment variables** / **Scene storage** — same area as fulfill keys)
3. [ ] Add or update these **keys** (values on the right):

| Key | Value (example) |
|-----|-----------------|
| `HOST_WALLETS` | `0x…` **your** Explorer wallet (lowercase ok) |
| `ROUND_EVERY_SEC` | `900` (15 min auto live) — or `120` while testing |
| `LIVE_ROUND_MAX_SEC` | `600` (10 min max per live round) |
| `PRIZE_TREASURY` | `0xd9618C06458e98a831F503194cC8b62fB0384d45` |
| `FULFILLER_PRIVATE_KEY` | `0x…` hot wallet key — **only if not already set** |

4. [ ] Save. **Redeploy World** (or first deploy) — Preview still needs Option B below unless you only test on World.

### Option B — Preview local storage

1. [ ] Start Preview (`npm run start` or Hub Preview) — leave it running  
2. [ ] `cp .env.storage.example .env.storage` and set `WIP_HOST_WALLET`  
3. [ ] In another terminal: `npm run storage:v1:preview`  
4. [ ] **Stop and restart Preview**  

### Option C — CLI World storage

1. [ ] `cp .env.storage.example .env.storage`
2. [ ] Edit `.env.storage` — set `WIP_HOST_WALLET=0xYourWallet`
3. [ ] Run `npm run storage:v1` and **sign in the browser** for each key (World only)
4. [ ] Deploy or re-enter World

### Storage verify

**Preview log** (after `storage:v1:preview` + restart):

- [ ] `[SERVER] host wallets configured: 1` (**not** `0` or `empty`)
- [ ] `[SERVER] live round every 900s` (or your `ROUND_EVERY_SEC`)
- [ ] `[SERVER] wearable autopilot ON` — on **World** if fulfiller set in cloud; Preview 404 on fulfiller is OK if key only on World

**World log** (after deploy, `/goto rizzle.dcl.eth`):

- [ ] `[SERVER] host wallets configured: 1`
- [ ] `[SERVER] wearable autopilot ON` (fulfiller on World storage)

In-world (Preview or World):

- [ ] Connect **same wallet** as `HOST_WALLETS`
- [ ] See **START LIVE** / **END LIVE** under the countdown (not the gold HOST hint)

---

## Phase 2 — Preview smoke (15 min)

Use **desktop**, wallet connected (not Guest).

1. [ ] `npm run verify:v1-publish` passes
2. [ ] Start Preview — log bundles **`Projects/wip-wheel/src/index.ts`**
3. [ ] **Daily** — gold pad once → WEARABLE or TRY AGAIN → second click blocked
4. [ ] **Practice** — pad 1 spin → **4 slices** → letters or solve → **WEEKLY SOLVES** on backdrop updates
5. [ ] **Host live** — **START LIVE** → HUD **HOST LIVE ROUND** → pad 1 spin or Join on pad 2–3 → spin → **END LIVE** (or solve to end)
6. [ ] Optional: wrong solve in live → **OUT THIS ROUND**

Log one line in [MASTER.md](MASTER.md) playtest log: pass / fail.

---

## Phase 3 — Deploy World

1. [ ] `npm run deploy` (Hub workspace = this repo only)
2. [ ] Quit Decentraland fully; re-enter https://decentraland.org/play/?realm=rizzle.dcl.eth
3. [ ] Wait ~15s if HUD says **CONNECTING TO SHOW SERVER…**
4. [ ] Repeat Phase 2 steps 3–5 on **World** (not Preview)

---

## Phase 4 — Bay

1. [ ] Send [bay-v1-handoff.md](bay-v1-handoff.md)
2. [ ] Walk [bay-qa-checklist.md](bay-qa-checklist.md) §6 together or async
3. [ ] Optional: two-wallet roster test — [v1-solo-playtest.md](v1-solo-playtest.md) § Two-client sync

---

## Quick reference

| I want… | Do… |
|---------|-----|
| Host a Meetup now | **START LIVE** (needs `HOST_WALLETS`) |
| Auto live without host | Set `ROUND_EVERY_SEC` |
| Co-host later | Add `0x…` to `HOST_WALLETS` comma-separated (you edit Storage) |
| Wearable in backpack | `FULFILLER_PRIVATE_KEY` + treasury stocked |
| Leaderboard | **WEEKLY SOLVES** wall — solve with wallet; not live “winners” board (V2) |

---

## Do not skip

- [ ] `HOST_WALLETS` = wallet you actually use in Explorer  
- [ ] Restart Preview after Storage edits  
- [ ] One full **host live** pass before deploy  

Full audit: [v1-pre-publish-audit.md](v1-pre-publish-audit.md)
