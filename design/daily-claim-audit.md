# Daily claim pipeline — audit (source of truth)

**Date:** 14 Oct 2026  
**Rule:** Prefer this file over ad-hoc chat memory when touching daily identity, claim, room sync, or fulfillment. Companion: [pipelines.md](pipelines.md), [rewards-architecture.md](rewards-architecture.md), [SHIP.md](SHIP.md).

**Stay on:** DCL Multiplayer Server + Scene/Player Storage (MASTER Option A). External `rewards-api/` is reference only.

---

## 1. Verdict

The pipeline is the right architecture for V0 and can scale to more prize types **without a second spin system**. Recent pain came from conflating three jobs and patching them separately:

| Job | Question | Must not mix with |
|---|---|---|
| **A. Eligibility** | May this peer claim today? | Room cosmetics, gold sign copy |
| **B. Claim ledger** | What did this wallet win? | Spectator UI |
| **C. Presentation** | Is *this* client the claimer? | Server day lock |

**Do not republish another micro-fix until eligibility is one function, claimer-only UI is stable, and this doc matches the code.**

---

## 2. As-built flow

```text
Gold click (client)
  │  local: busy? guest UX? dailyDoneHere cache?
  ▼
room.send('dailySpin')  ── context.from = peer address (trusted)
  │
  ▼
Server assertDailyClaimant (eligibility)
  │  fail → dailySpinResult { error } to sender only
  ▼
performDailySpin(wallet)
  │  memory day lock → Storage.player dailyClaim:YYYY-MM-DD
  │  roll DAILY_CATALOG → DailyClaim row
  │  if paid type → pendingFulfillment + async fulfill
  ▼
ShowState: dailyNonce++, dailyPrize, dailySpinning   (room CRDT)
dailySpinResult ACK → claimer only
  │
  ├─ Claimer: tween → landDailyPrize (YOU WON) → dailyDoneHere = true
  └─ Spectators: tween → showDailyRoomLast (LAST DAILY) → still eligible
```

| Stage | Authority | Files |
|---|---|---|
| Eligibility | Server | `src/server/claimant.ts` (`assertDailyClaimant`) |
| Day lock + RNG | Server | `src/server/dailyClaims.ts`, `src/shared/dailyCatalog.ts` |
| Room cosmetics | Server CRDT | `ShowState` in `src/state.ts` |
| Claimer vs spectator | Client only | `src/game.ts` (`claimerOwnsThisDailyLand`) |
| Gold copy | Client | `src/dailyWall.ts` |
| Fulfillment | Server | `src/server/fulfill.ts`, `onchainTransfer.ts` |

Messages: `src/shared/messages.ts` (`dailySpin`, `dailyStatus`, `dailySpinResult`, `dailyStatusResult`).

---

## 3. Identity contract (closed knowledge)

DCL facts (SDK docs / `PlayerIdentityData` / Catalyst):

1. Guests often present as `0x` + 40 hex — **shape check alone is useless**.
2. Server messages trust **`context.from` only** — never client-reported wallet.
3. Iterate **`PlayerIdentityData`**: require row for `context.from`; if missing → **reject** (same pattern as proximity anti-cheat: sender not found → reject).
4. Require **`!identity.isGuest`**.
5. Require Catalyst **`hasConnectedWeb3: true`** via  
   `GET https://peer.decentraland.org/lambdas/profile/<addr>`  
   Empty `avatars` or missing flag → **reject** (ephemeral / never-connected).
6. Client `getPlayer().isGuest` is **UX only** — not trust.

Ordered fail-closed checks (single function, one log reason):

| Order | Check | Reason code |
|---|---|---|
| 1 | `isWalletAddress` | `not_wallet` |
| 2 | `PlayerIdentityData` found | `identity_missing` |
| 3 | `!isGuest` | `is_guest` |
| 4 | Catalyst `hasConnectedWeb3` | `no_web3` |
| 5 | Day lock / roll | `already_claimed` / ok |

Client must **not** set `dailyDoneHere` until `dailySpinResult.ok` or `dailyStatusResult.claimed`.

---

## 4. Claimer vs spectator (closed knowledge)

`ShowState.dailyNonce` is **room theatre**. It is not “I claimed.”

| Client role | How known | Land copy | `dailyDoneHere` |
|---|---|---|---|
| Claimer | Own `dailySpin` ACK / own in-flight send when nonce bumps | `YOU WON` / miss via `landDailyPrize` | Set true on success |
| Spectator / late join mid-spin | Nonce bump or `dailySpinning` without own send | `LAST DAILY` via `showDailyRoomLast` | **Unchanged** |
| Late join after land | First sync snap | `LAST DAILY` | Unchanged |

**Bug we hit (14 Oct):** every client ran `landDailyPrize` + `dailyDoneHere = true` on any nonce bump → guests saw WEARABLE and could not spin.

---

## 5. Preview vs World (do not mix)

| Check | Local Preview | Published World |
|---|---|---|
| Path proof | Log bundles `Projects/wip-wheel` | Same tree published |
| Day lock same session | Memory + client cache | Memory + **Storage** |
| Day lock across re-enter | Weak (Storage flaky/empty) | Storage is truth |
| Autopilot | EnvVar usually missing → pending only | Needs `FULFILLER_PRIVATE_KEY` |
| Guest / wallet gates | Same code | Same code |

`npm run verify:preview-path` before any spin debug.

---

## 6. Multi-prize ledger (scale without new pipelines)

One claim row per wallet per UTC day. Branch only at fulfillment.

```text
DailyClaim {
  claimId, wallet, displayName, utcDay,
  prizeId, label, prizeType, wheelIndex,
  status: none_needed | pending_fulfillment | fulfilled,
  actionHint, createdAt,
  txHash?, fulfilledUrn?        // wearable
  // later: ticketId? for credits; chain tx for crypto
}
```

| `prizeType` | Weight today | Fulfillment |
|---|---|---|
| `none` (TRY AGAIN) | ~60% | none |
| `wearable` | ~40% | Polygon ERC-721 from hot treasury |
| `marketplace_credits` | 0 | Finance ticket (later) |
| `crypto` | 0 | Transfer transfer (later) |
| shoutout / bonus | unused in daily | host / none |

Gold sign shows **`label` from the claim**. Enabling credits = `weight > 0` + fulfill handler — **not** a new gold-pad pipeline.

Treasury: operating hot `PRIZE_TREASURY`; Bay staging separate. Keys only in EnvVar.

---

## 7. Knowledge gap closed 14 Oct — “WIN A WEARABLE then already claimed”

**Symptom:** Enter gold sign says WIN A WEARABLE; click says ALREADY CLAIMED.

**What it usually is (not a guest bug):**

1. Mobile Explorer is still **signed in with the same wallet** that claimed earlier today (desktop Preview / prior World spins count).
2. Idle copy used to advertise WIN A WEARABLE **before** `dailyStatus` returned, and after a claim celebration **reset to WIN A WEARABLE** while `dailyDoneHere` stayed true.

**How to tell guest vs wallet on phone:** Settings / profile — if you see your name and wallet, you are not a guest. True guest → CONNECT TO SPIN after status. Wallet already claimed → COME BACK / ALREADY CLAIMED (day lock **working**).

**IP:** unused. Eligibility is peer identity + Catalyst Web3, not IP.

**UX fix:** Sign starts at CHECKING…; WIN A WEARABLE only after status says eligible; after claim celebration settle to ALREADY CLAIMED.

**True guests (14 Oct note):** DCL may always assign an `0x` address. V0 does not depend on a guest-without-address mode. Keep `isGuest` / `no_web3` gates; park CONNECT-only playtests. Day lock per address is the product.

## 8. Open risks (honest)

| Risk | Mitigation |
|---|---|
| Catalyst fetch fails → false reject of real wallets | Log `no_web3`; retry; do not fail open |
| Explorer “guest” actually has Web3 | Treat as wallet; COME BACK if already claimed |
| Pending wearable to bad address | Gate before claim; never fulfill guests |
| Doc drift | This file + pipelines; update same day as code |
| Unpublished local vs live World | Publish once per coherent pass; quit Explorer |

---

## 9. Regression (after any daily touch)

1. `npm run verify:preview-path`  
2. **Guest:** CONNECT / GUESTS WATCH — never YOU WON; never ALREADY CLAIMED from a spectator reel  
3. **Wallet:** one spin → WEARABLE or TRY AGAIN; second → already claimed  
4. **Spectator (second wallet or guest watching):** LAST DAILY; guest still CONNECT; other wallet still eligible  
5. Magenta show still works after daily lands  

World-only: leave/re-enter day lock; backpack if EnvVar ON.

---

## 10. What not to do

- Do not add a second daily lock on the client as source of truth.  
- Do not use `payoutFor` / show `$WIP` on gold.  
- Do not clear `dailySpinning` from show finish.  
- Do not revive `rewards-api` for V0.  
- Do not ship guest “wins” as marketing — undeliverable.  
- Do not debug spin before proving Hub path.
