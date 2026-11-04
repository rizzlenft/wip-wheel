# V1 build plan — Bay pitch (Nov 2026)

**Status:** V1 **code complete** (Nov 2026). **Show wheel unified 4-slice** practice + live — [show-wheel.md](show-wheel.md). **Gate before Bay:** solo Preview — [v1-solo-playtest.md](v1-solo-playtest.md).  
**North star:** [MASTER.md](MASTER.md). **Do not thaw:** daily claim, gold table, spawn look-ray ([V0-FREEZE.md](V0-FREEZE.md)).

---

## What we told Bay V1 is

One line (pitch):

- Practice rounds **indefinitely** with **random puzzles** (shared room, advances on solve)
- **Countdown** to live round (server clock, tunable)
- **3-user live round** (first three connected wallets)
- **4-slice wheel** on the main stage (practice + live) — **5th slice ($WIP)** when Base hot wallet is wired (**V2**, not blocked on V1 sign-off)
- **Wearable delivered on puzzle solve** (not on spin)
- **Wrong solve:** wipe that player’s **pending wearables** in the round + **lock them from solving again** until the live round ends
- **Weekly solve board** (puzzles solved)
- **Readable cameras:** spin (wheel) + **letter board** when a letter is chosen / letter window open

**Not in this V1 pitch:** second weekly board (live winners), all-time boards, Marketplace Credits, playtoearn, Base $WIP send.

---

## Already shipped (do not redo)

| Area | Where |
|------|--------|
| Phrase bank + advance on solve | `src/puzzle.ts`, `ShowState.puzzleIndex`, `markSolved` |
| Solve row + wrong phrase (practice) | `solvePuzzle` in `server/server.ts`, `game.ts` |
| Weekly solve **data** (Storage) | `src/server/practiceScore.ts` → key `practiceSolves` |
| Countdown **timestamp** (no live open yet) | `nextRoundAt`, `ROUND_EVERY_SEC`, HUD |
| Daily + show mutex, wearable autopilot | `dailyClaims.ts`, `fulfill.ts`, `pipelines.md` |
| Spin VirtualCamera | `src/showCam.ts`, `src/dailyCam.ts` |
| Studio shell, sit, show cam offsets | `layout.ts`, `audienceSit.ts`, `scoreboard.ts` (pod 1 only) |

**V1a exit:** two clients solve → same next phrase; gold still WEARABLE / TRY AGAIN only.

---

## DCL rules (every slice)

1. **Server authority** — phase, roster, turn, wheel index, banks, solve lock, leaderboard totals ([authoritative servers](https://docs.decentraland.org/creator/scenes-sdk7/networking/authoritative-servers.md)).
2. **Clients send actions only** — `showSpin`, `guessLetter`, `solvePuzzle`, `takeLiveSeat` (new); never send scores.
3. **Storage on checkpoints** — solve, live round end, week roll; not per letter ([roadmap hard rules](roadmap-v0-v4.md)).
4. **Leaderboard** — copy [90,-9-authoritative-server-leaderboard](https://github.com/decentraland/sdk7-test-scenes/tree/main/scenes/90,-9-authoritative-server-leaderboard): Map + JSON blob + synced top-N component; `validateBeforeChange` server-only.
5. **Live wearable** — new **live claim** queue; reuse `requestWearableFulfillment`; **never** `performDailySpin` ([pipelines.md](pipelines.md)).
6. **Wheel face = server table** — show wheel is always **4** labels (`livePrizes.ts` + `wheel-face-live-4.png`) in practice and live; **never** gold `DAILY_CATALOG`. Details: [show-wheel.md](show-wheel.md).

---

## Build order (one concern per merge)

Ship in this order. Preview with **two wallets** before each publish. `npm run verify:preview-path` first.

### Step 1 — Live phase machine (V1b core)

**Goal:** Clock opens a live window; room returns to practice after round resolves.

| Task | Detail |
|------|--------|
| `ShowState.roundPhase` | `practice` \| `live` \| `resolving` (string or int enum in schema) |
| Open live | In `rollRoundClock()` when `now >= nextRoundAt` and phase is `practice` → set `live`, reset round puzzle/banks, clear roster |
| Close live | When round ends (solve paid or abort timeout) → `resolving` → bump `nextRoundAt` → `practice` |
| Gate messages | `showSpin` / `guessLetter` / `solvePuzzle` read phase; practice rules unchanged in `practice` |
| HUD copy | Strip shows `LIVE ROUND` vs practice; countdown hidden or “round in progress” during live |

**Done when:** EnvVar `ROUND_EVERY_SEC=120`; at zero, phase flips to `live` on all clients; manual or timed end returns to practice and schedules next slot.

**Files:** `shared/schemas.ts`, `server/server.ts`, `game.ts`, `ui.tsx`.

---

### Step 2 — Three-player roster + turns

**Goal:** Only three wallets play in live; lose-turn / bankrupt mean something.

| Task | Detail |
|------|--------|
| `takeLiveSeat` message | Wallet from context; reject guest; reject if roster full or not `live` |
| Seat source | **First three** non-guest wallets who sit on **contestant benches** (Hub names TBD — wire to existing `HOUSE` or new `CONTESTANT` coords in `layout.ts` only after reading [positioning.md](positioning.md)) |
| Roster on state | Synced `liveSeats: string` (comma wallets) or small component — keep payload small |
| Turn index | `activeSeat` 0..2; only active wallet may `showSpin` / `guessLetter` / `solvePuzzle` in live |
| Advance turn | After spin lands (except lose-turn), after letter miss, after successful letter; **lose-turn** skips active once |
| Pods 2–3 | `scoreboard.ts` — drive from roster + per-player bank (Step 3) |

**Decision locked for build:** first-come **sit** = opt-in (matches Bay “three users”), not pad spam.

**Done when:** Fourth wallet cannot spin in live; spectators can still practice… **pitch says live round** — during `live`, practice spins **paused** (only roster plays). Spectators watch same puzzle.

**Files:** `shared/messages.ts`, `server/server.ts`, `audienceSit.ts` or thin `liveSeats.ts`, `scoreboard.ts`.

---

### Step 3 — Per-player bank + wrong-solve penalty (pitch-specific)

**Goal:** Wearable lands in **player bank** on spin; pays on **solve**; wrong solve wipes wearable + locks solve.

| Task | Detail |
|------|--------|
| Server `Map<wallet, LiveBank>` | `{ wearablePending: boolean, … }` in memory only during `live` |
| Spin in live | Active player only; roll Step 4 table; if wearable slice → set `wearablePending` (no fulfill yet) |
| Correct solve (live) | Active or any roster member who solves? **Pitch:** solver keeps bank → **whoever solves correctly** gets payout of **their** bank (clarify: usually active player solving — if any of three can solve, bank belongs to solver’s wallet) |
| Wrong solve (live) | Clear that wallet’s `wearablePending`; set `solveLocked[wallet]=true`; reject further `solvePuzzle` from them until round end; HUD `MISSED SOLVE · OUT` |
| Wrong solve (practice) | Keep today: close letter window, no lock (pitch penalty is **live**-scoped) |
| Bankrupt | Zero active player’s `LiveBank`; stay in round |

**Done when:** Preview live — spin wearable, wrong solve → no backpack; same player cannot solve again; correct solve → fulfill runs once.

**Files:** `server/liveBank.ts`, `server/server.ts`, `game.ts`.

---

### Step 4 — Four-slice show wheel (practice + live)

**Goal:** All show spins roll 4 outcomes; disc always matches labels.

| Slices (V1 pitch) | Server id | On land |
|-------------------|-----------|---------|
| Letter | `letter` | Opens letter flow (same as today) |
| Wearable | `wearable` | Live: bank for active player. Practice: letter pad only (no fulfill until live solve rules) |
| Lose turn | `lose-turn` | Live: skip active; advance turn. Practice: no letter pad |
| Bankrupt | `bankrupt` | Live: zero active bank. Practice: no letter pad |

| Task | Detail |
|------|--------|
| `src/livePrizes.ts` | `LIVE_PRIZES` length 4, weights (Storage later) |
| Server roll | **Both** practice and live `showSpin` → `pickLivePrizeIndex()`; `wheelSlices = 4` |
| Client tween | `showSliceDegrees()` from `wheelSlices` (always 4) |
| Wheel art | `wheel-face-live-4.png` on `WheelDisc` always — albedo + emissive |
| Phase | `roundPhase` gates roster/turn/fulfill only — **not** face swap |

**V2 add-on (pre-pitched):** fifth slice `$WIP` + Base hot wallet + five-slice art — do not block V1 demo.

**Done when:** Practice and live spins only hit four labels; pointer matches PNG. Shipped Nov 2026 (+ unified face Nov 4).

**Files:** `livePrizes.ts`, `game.ts`, `server/server.ts`, `assets/Images/wheel-face-live-4.png`.

---

### Step 5 — Live wearable fulfill on solve

**Goal:** Same trust as daily, separate pipeline.

| Task | Detail |
|------|--------|
| `server/liveClaims.ts` | Like `dailyClaims`: claim id, wallet, status, **no day lock** |
| On live correct solve | If solver’s bank has `wearablePending`, enqueue + `requestWearableFulfillment` |
| Storage key | Separate from daily player claims (e.g. `liveClaimsLedger`) |
| Idempotency | One fulfill per live round per wallet max unless design says otherwise |

**Done when:** Two-client live round — no NFT on spin; NFT on solve; daily still one/day.

**Files:** `liveClaims.ts`, `server.ts`, optional extend `fulfill.ts` logging.

---

### Step 6 — Weekly solve board (V1c scoped to pitch)

**Goal:** Wall shows top practice+solve counts for ISO week.

| Task | Detail |
|------|--------|
| `PracticeLeaderboard` component | `names[10]`, `scores[10]`, `updatedAt` — server writes after `notePracticeSolve` |
| Client | Read component; render on existing wall mesh or new sign in Hub |
| Include live solves | Same `notePracticeSolve` on any correct solve (already called from `markSolved`) |

**Done when:** Solve moves rank; restart world keeps week via Storage.

**Files:** `shared/schemas.ts`, `server/practiceScore.ts`, `leaderboardWall.ts` (new client), sync id in `SyncIds`.

---

### Step 7 — Letter-board camera (pitch UX)

**Goal:** After spin lands and letter window opens, frame **puzzle + strip** (not only wheel).

| Task | Detail |
|------|--------|
| `src/boardCam.ts` | Mirror `showCam.ts`: VirtualCamera at `layout.BOARD_CAM`, trigger on `canGuess` true (show/live only) |
| Release | On letter submitted, miss, or solve row open/close — restore third person |
| Mutex | Cancel board cam if daily/show spin cam active |

**Not a funding milestone** — part of V1 polish; low risk (client-only).

**Done when:** Letter phase shows full phrase row readable on desktop + mobile.

**Files:** `boardCam.ts`, `layout.ts` (`BOARD_CAM` offsets), `game.ts` hooks.

---

## Verification gates (before Bay playtest)

**Solo (one wallet):** [v1-solo-playtest.md](v1-solo-playtest.md) — `npm run verify:v1-preview`

**Two wallets (later):** same doc, § Two-client sync — roster cap and turn order only.

1. `npm run verify:v1-preview`
2. `npm run check:week`
3. Two clients: practice solve sync; gold daily once/day
4. `ROUND_EVERY_SEC=300`: live opens → 3 seats → 4-slice spin → wrong solve locked → correct solve wearable
5. Weekly board updates; no `$WIP` on gold sign
6. Cam: spin + letter board

**Playtest script:** [bay-qa-checklist.md](bay-qa-checklist.md) §6 — live-round rows apply when Steps 1–5 are shipped (they are).

---

## What's next (not more V1 scope)

**V1 code is landed.** Remaining work is **verification and Bay**, not new pitch features:

1. `npm run verify:v1-preview`
2. Solo script [v1-solo-playtest.md](v1-solo-playtest.md) — include **live** with `ROUND_EVERY_SEC=120`
3. Log pass/fail in [MASTER.md](MASTER.md) playtest log
4. Optional two-wallet § sync
5. Bay session — [bay-qa-checklist.md](bay-qa-checklist.md) §6

Do **not** start Base $WIP or five-slice art until **V2** unless Bay replies asking for it in V1.

---

## Doc drift (fixed elsewhere)

- [roadmap-v0-v4.md](roadmap-v0-v4.md) V1b still says five slices — **pitch says four until $WIP**.
- [NOW.md](NOW.md) points here for execution order.
- **Nov 4 2026:** unified 4-slice show wheel (practice + live) — [show-wheel.md](show-wheel.md). Ignore any note that practice kept `PRIZES` / `wheel-face.png`.
