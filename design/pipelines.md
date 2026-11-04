# Pipelines — daily vs show (do not mix)

**Date:** 4 Nov 2026 (show wheel unified 4-slice)  
**Rule:** Two games, two pads, one physical wheel. Each pipeline has its own authority, labels, and end state. If a change touches both, stop and split the PR.

**Show wheel authority (single source):** [show-wheel.md](show-wheel.md) — do not reintroduce 8-slice show face or `PRIZES` roll for pad 1.

Companion: [MASTER.md](MASTER.md), [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md), [spin-mutex-audit.md](spin-mutex-audit.md), [learnings.md](learnings.md).

**Before any spin debug:** `npm run verify:preview-path` then confirm the Preview log path (below). If that script fails, **do not touch code** — fix the folder first.

---

## Never again (14 Oct scars)

These were expensive. Treat each as a hard stop.

| Mistake | Symptom | Rule |
|---|---|---|
| Previewing Hub `Scenes/WIP Wheel` while editing `Projects/wip-wheel` | “Fixes never stick”; gold wins `$WIP`; unlimited daily | Hub workspace = **only** `~/Projects/wip-wheel`. Delete/rename any `Scenes/WIP Wheel`. Proof = bundling path in the start log. |
| Mixing show prize table into daily | Gold sign shows `50 $WIP` / `payoutFor` | Daily labels only from `DAILY_CATALOG` / `landDailyPrize`. Never `payoutFor` on gold. |
| Show finish clearing daily flags | Daily tween dies mid-spin; land looks like show | `finishShowSpinOnServer` must not clear `dailySpinning`. Show CRDT must not clobber `anim.mode === 'daily'`. |
| Trusting Scene Storage alone in preview | Reclaim every click | Day lock = in-process `claimsByWalletDay` + Storage + client `dailyDoneHere`. |
| LOOK LEFT / STAGE-LEFT copy while spinning | Noise on the gold sign during the reel | Daily busy copy = calm `SPINNING` / `DAILY SPIN` only. No directional nag. |
| Debugging spin before proving the folder | Days lost on a dead tree | Path first, then pipelines, then code. |
| Treating room `dailyNonce` as “I won” | Guest/spectator YOU WON + sticky ALREADY CLAIMED | Claimer-only `landDailyPrize`; [daily-claim-audit.md](daily-claim-audit.md) |

---

## 0. P0 — which folder you are previewing

**14 Oct evidence:** Creator Hub was previewing a **stale Scenes mirror**, not this repo. That single mistake produced “infinite gold `$WIP`” while the real tree already had day lock + `WEARABLE`.

| Path | What it is |
|---|---|
| `/Users/rizzle/Projects/wip-wheel` | **Source of truth** — auth-server daily, `DAILY_CATALOG`, day lock, pipelines |
| `~/Library/Application Support/creator-hub/Scenes/WIP Wheel` | **Stale** (pre–auth-server). No `src/server/`. Gold pad uses `pickDailyPrize` + `payoutFor` → unlimited spins + `$WIP` |

Rename any stale mirror to `WIP-Wheel-STALE-DO-NOT-OPEN`. Never open it in Hub.

**Before every Preview**

1. `npm run verify:preview-path`
2. Creator Hub workspace = **`~/Projects/wip-wheel`** (`Settings/config.json` → `workspace.paths[0]`). If it points under `Application Support/creator-hub/Scenes/`, stop.
3. Start log must include `Bundling file …/Projects/wip-wheel/src/index.ts`

**14 Oct proof (correct folder):** bundling path correct → `[SERVER] WIP Wheel Multiplayer Server starting` → `daily claim … WEARABLE` → second click already claimed. Autopilot OFF in preview without EnvVar is expected.

Proof strings in the preview log:
- Path contains `Projects/wip-wheel` (not `Scenes/WIP`)
- `[SERVER] daily claim … WEARABLE` or `TRY AGAIN`
- Not a client-only `pickDailyPrize` tree (those have no `src/server/` and no claim log)

---

## 1. One-page split

| | **Daily** | **Show** |
|---|---|---|
| **Pad** | Gold · stage-right | Magenta · pad 1 · stage-left |
| **Hover** | `Spin the daily` | `Spin the show` |
| **Message** | `dailySpin` / `dailySpinResult` / `dailyStatus` | `showSpin` / `guessLetter` |
| **Authority** | Server `Storage.player` + in-process day map | Server `ShowState` (CRDT) |
| **RNG / table** | `shared/dailyCatalog.ts` only | `src/livePrizes.ts` `LIVE_PRIZES` only (4 slices) |
| **Allowed land labels** | `WEARABLE`, `TRY AGAIN` (credits later, weight 0) | `LETTER`, `WEARABLE`, `LOSE TURN`, `BANKRUPT` |
| **Day lock** | **One claim per wallet per UTC day** | None — practice spins OK while `SHOW_OPEN_ALWAYS` |
| **Letter pad** | Never | After letter or wearable land (`canGuess`) |
| **Fulfillment** | Wearable → `pendingFulfillment` + autopilot | **Live:** wearable on **correct solve** → `fulfillLiveWearable`. **Practice:** no treasury fulfill |
| **UI owner on land** | Gold daily sign (`landDailyPrize`) | Scoreboard / letter HUD — **not** the gold sign |
| **Wheel mesh** | Cabinet disc only (`spinDailyWheel`). Never `WheelRoot`. | `WheelRoot` only. Never the cabinet disc. |
| **Shared** | Mutex only: `wheelReserve` + `dailySpinning` / `spinning`. Angles are separate. | same |

`$WIP` on the gold sign = **bug**. Daily never uses `payoutFor()` for copy.

---

## 2. Daily pipeline (happy path)

```
Gold click
  → requestDailySpin (client UX gates only)
  → room.send dailySpin
  → server assert claimant (wallet + PlayerIdentityData + !guest + hasConnectedWeb3)
  → wheelReserve = 'daily'
  → performDailySpin(wallet)
       · reject if memory or Storage already has claim for utcDay
       · roll from DAILY_CATALOG only
       · persist Storage.player[wallet][dailyClaim:YYYY-MM-DD]
       · if wearable → pending queue + void fulfill
  → ShowState: dailyNonce++, dailyIndex, dailyPrize, dailySpinning
  → dailySpinResult ACK → claimer tween only
  → spectators follow dailyNonce → LAST DAILY (not YOU WON)
  → claimer landDailyPrize(label); set dailyDoneHere on ACK only
  → dailySpinning clears on timer; wheelReserve clears
```

**Integrity checks**

- Label ∈ { WEARABLE, TRY AGAIN } (+ future credits ids when weight > 0).
- Second click same wallet/day → `already_claimed` (server); client `dailyDoneHere` is a cache of ACK/status only.
- Guests / no Web3 → CONNECT copy; never claim; never YOU WON from room CRDT.
- Spectators → `showDailyRoomLast`; must not set `dailyDoneHere`.
- Preview: in-process memory must still block repeats even when Scene Storage is empty/flaky.
- Live World: Storage is source of truth across sessions; memory is a same-process guard.

Full identity + multi-prize model: [daily-claim-audit.md](daily-claim-audit.md).

---

## 3b. Live round pipeline (V1 Bay pitch)

```
nextRoundAt → openLiveRound (phase LIVE, 4-slice table)
  → takeLiveSeat / showSpin auto-join (max 3 wallets)
  → showSpin (active seat only) → livePrizes roll
  → finishShowSpin → letter/wearable/bankrupt/lose-turn
  → guessLetter / solvePuzzle (solve lock on wrong solve)
  → correct solve + wearable pending → fulfillLiveWearable → endLiveRound
  → practice again; nextRoundAt scheduled
```

**Integrity**

- Live wearable **never** uses `performDailySpin` — `fulfillLiveWearable` → `requestWearableFulfillment`.
- Show wheel: **4-slice** `LIVE_PRIZES` / `wheel-face-live-4.png` for practice and live (`roundPhase` gates roster + fulfill only).
- Gold daily mutex unchanged — daily can run when show wheel idle.
- **Host live:** `HOST_WALLETS` EnvVar → `hostOpenLive` / `hostEndLive` ([v1-ops-backlog.md](v1-ops-backlog.md) P1).

---

## 3. Show pipeline (happy path)

```
Pad 1 / wheel face click
  → requestShowSpin (reject if daily owns wheel)
  → room.send showSpin
  → server: reject if wheelReserve / dailySpinning / spinning / canGuess
  → roll livePrizes index (4); ShowState spinNonce++, wheelSlices=4, spinning, lastPrize
  → clients tween mode 'show' on wheel-face-live-4.png (always)
  → finishShowSpinOnServer: spinning=false, canGuess if letter/wearable
  → letter pad → guessLetter (live: roster bank; practice: no PRIZES $WIP bank)
```

**Integrity checks**

- `finishShowSpinOnServer` must **not** clear `dailySpinning`.
- Show CRDT must **not** replace an in-flight daily tween (`anim.mode === 'daily'`).
- Show table is **never** `PRIZES[]` / `wheel-face.png` on `WheelDisc` — see [show-wheel.md](show-wheel.md).

---

## 4. Shared wheel mutex (both)

| Lock | Owner | Cleared when |
|---|---|---|
| `wheelReserve` `'daily'\|'show'` | Server, set **before** any await | Daily/show timer end |
| `ShowState.dailySpinning` | Server daily path only | Daily timer only |
| `ShowState.spinning` | Server show path only | Show finish only |
| Client `anim.mode` | Local tween | Tween end; show cannot clobber daily |

---

## 5. What preview proves vs World

| Check | Preview | Published World |
|---|---|---|
| Gold vs magenta feel / tween | Yes | Yes |
| One daily per wallet per UTC day | **Same-session** via memory + client gate; Storage may 404 when empty | Storage across sessions |
| Wearable in backpack | No (needs EnvVar key + POL) | Yes if autopilot ON |
| Crowd chaos / no turns | Yes | Yes — turns are V2 |

Do not treat “I reclaimed after restarting preview” as a live day-lock failure. Do treat “two claims in one preview session without restart” as a **P0 daily integrity bug**.

---

## 6. File ownership (where to edit)

| Concern | Files |
|---|---|
| Daily odds / labels / treasury address | `src/shared/dailyCatalog.ts` |
| Daily claim + day lock | `src/server/dailyClaims.ts` |
| Daily room messages + reserve | `src/server/server.ts` (`dailySpin` only) |
| Daily gold UI | `src/dailyWall.ts` |
| Daily client send / ACK / tween mode | `src/game.ts` (daily* helpers only) |
| Show prize table + face | `src/livePrizes.ts`, `assets/Images/wheel-face-live-4.png`, `src/game.ts` `paintShowWheelFace` |
| Legacy 8-entry table (daily math only) | `src/prizes.ts` `PRIZES` — **not** show spin |
| Show spin / letters | `src/server/server.ts` (`showSpin` / `guessLetter`), `src/game.ts` show helpers |
| Live round / roster / 4-slice | `src/server/liveRound.ts`, `src/livePrizes.ts`, `src/server/liveClaims.ts` |
| Live UX / board cam | `src/boardCam.ts`, `src/liveJoin.ts`, `src/leaderboardWall.ts` |
| Shared timing | `src/shared/spinTiming.ts` |
| Wearable autopilot | `src/server/fulfill.ts`, `src/server/onchainTransfer.ts` |

**Forbidden shortcuts**

- Calling `payoutFor()` to label a daily land.
- Writing `dailyPrize` / gold sign from `lastPrize` or round bank.
- Clearing `dailySpinning` from show finish.
- Starting show tween while `anim.mode === 'daily'` or `isDailyWatching()`.
- Using client `daily.ts` / `DAILY_ONCE_PER_DAY` as the real lock (dead path — ignore).

---

## 7. Regression (run after any pipeline touch)

0. `npm run verify:preview-path` + bundling path is `Projects/wip-wheel`.  
1. Gold → land label is WEARABLE or TRY AGAIN only (not `$WIP`).  
2. Gold again same session → COME BACK / already claimed (no second tween).  
3. While daily spins: gold sign stays calm (`SPINNING` / `DAILY SPIN`) — no LOOK LEFT.  
4. Magenta → `$WIP` / shoutout / etc. OK; letter pad on non-miss.  
5. Gold then magenta after daily lands → show works.  
6. Magenta does not fire while daily tween is running.
