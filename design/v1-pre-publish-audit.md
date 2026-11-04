# V1 pre-publish audit (Nov 2026)

**Purpose:** Full pass before pushing the Bay V1 build to `rizzle.dcl.eth`.  
**Runbook:** [v1-deploy-runbook.md](v1-deploy-runbook.md) · **Automated:** `npm run verify:v1-publish`

---

## A. Automated checks (repo)

| Check | Command | Status |
|-------|---------|--------|
| Hub path + daily pipeline files | `npm run verify:v1-preview` | Run before deploy |
| Typecheck + bundle | `npm run build` | Run before deploy |
| Spawn vs layout | included in verify:preview-path | |
| Week card vs `week.ts` | included in verify:v1-preview | |
| 4-slice live art + modules | included in verify:v1-preview | |
| Publish bundle | `npm run verify:v1-publish` | Runs v1-preview + build + World metadata |

---

## B. Bay V1 pitch — code vs promise

| Pitched | Shipped | Where | Pre-publish note |
|---------|---------|-------|------------------|
| Practice puzzles + advance on solve | Yes | `puzzle.ts`, `markSolved` | |
| Countdown to live | Yes | `nextRoundAt`, HUD clock | Default **2 h** without `ROUND_EVERY_SEC` |
| **Host go live** | Yes | `HOST_WALLETS`, `hostOpenLive` | **Must set Storage** or no buttons |
| 3-player live roster | Yes | `liveRound.ts`, pads 1–3 | 4th blocked |
| 4-slice show wheel (practice + live) | Yes | [show-wheel.md](show-wheel.md) | |
| Wearable on **solve** (live) | Yes | `fulfillLiveWearable` | Needs fulfill env on World |
| Wrong solve → OUT | Yes | `handleLiveWrongSolve` | |
| **Weekly solve board** | Yes | `leaderboardWall.ts`, `WEEKLY SOLVES` | Backdrop stage-left; wallet solves only |
| Spin + letter cameras | Yes | `showCam.ts`, `boardCam.ts` | |
| Live **winners** board | **No (V2)** | — | Align with Bay — not forgotten |
| 5th `$WIP` slice | **No (V2)** | — | |
| Base $WIP send | **No (V2)** | — | |

---

## C. Frozen surfaces (must still pass)

From [V0-FREEZE.md](V0-FREEZE.md) + layout rules — **do not change** in this release without explicit thaw:

| Loop | Verify |
|------|--------|
| Daily | Gold → WEARABLE or TRY AGAIN; never `$WIP` on gold |
| Path | `npm run verify:preview-path`; bundle path = this repo |
| Mutex | Daily tween vs show spin |
| Spawn look-ray | `npm run verify:spawn-sync` if spawn touched |
| First look | Gold + set on +Z |

---

## D. Copy & honesty (Nov 4 pass)

| Item | Status |
|------|--------|
| `scene.json` description | Updated — daily, practice, live, host |
| HUD idle strip | `GOLD = DAILY · PAD 1 = SHOW` restored when idle |
| Pods 2–3 practice label | **OPEN / LIVE** (not SOON) |
| Pad 2–3 hover | `Join live` when live |
| Places / World blurb | Matches in-world behavior |

---

## E. Scene Storage matrix

| Variable | Required? | Risk if missing |
|----------|-----------|-----------------|
| `HOST_WALLETS` | **Yes for host** | No START/END LIVE; hint under clock |
| `ROUND_EVERY_SEC` | Recommended | 2 h wait for auto live |
| `LIVE_ROUND_MAX_SEC` | Optional | 15 min default |
| `FULFILLER_PRIVATE_KEY` | For real wearables | Log-only wins |
| `PRIZE_TREASURY` | With fulfiller | Backpack empty |

Preview log strings to grep:

- `[SERVER] WIP Wheel Multiplayer Server starting`
- `[SERVER] host wallets configured: N` (N ≥ 1 for you)
- `[SERVER] live round every …`
- `[SERVER] daily claim …`
- `[SERVER] host open live` / `live round open`

---

## F. Manual tests (cannot automate)

| # | Test | Owner |
|---|------|-------|
| F1 | Solo script incl. **host START LIVE** round | Rizzle |
| F2 | Daily already-claimed same session | Rizzle |
| F3 | Guest daily blocked / need wallet | Optional |
| F4 | Live wrong solve → OUT | Rizzle |
| F5 | Weekly board row after wallet solve | Rizzle |
| F6 | Two-wallet roster (optional) | Before 3-up stream |
| F7 | Fulfill one WEARABLE on World | [fulfill-verify.md](fulfill-verify.md) |

---

## G. Known limitations (document, don’t “fix” in V1)

- Auth server cold start ~15s first visitor  
- Meetup “ghost” avatars — CRDT still works ([playtest-15oct-meetup.md](playtest-15oct-meetup.md))  
- Practice letter hits do not add `$WIP` bank (4-slice table)  
- No in-world host delegate UI — co-hosts via `HOST_WALLETS` only  
- `setResultText` no-op — scoreboard/HUD carry UX  
- Leaderboard is **weekly solves**, not live round winners  

---

## H. Sign-off gate

**Do not deploy** until:

1. `npm run verify:v1-publish` green  
2. F1 + F2 + F5 done in Preview with Storage configured  
3. MASTER playtest log updated  
4. [bay-v1-handoff.md](bay-v1-handoff.md) ready to send  

**Deploy** via [v1-deploy-runbook.md](v1-deploy-runbook.md). **Bay session** via [bay-qa-checklist.md](bay-qa-checklist.md) §6.

---

## I. Post-audit code tweaks (4 Nov)

- Scene description, HUD station line, pod SOON→OPEN/LIVE, join-not-live copy, host env hint, publish script + this audit.
