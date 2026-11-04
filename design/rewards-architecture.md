# Rewards & anti-abuse architecture (V0 → production)

**Status:** Multiplayer Server path (6 Oct 2026). Daily claims + prize roll run on DCL-hosted auth-server `Storage`. No third-party host for V0.  
**Code:** `src/server/`, `src/shared/dailyCatalog.ts`, `src/shared/messages.ts`. External `rewards-api/` kept as reference only.  
**Ship:** [SHIP.md](SHIP.md).

---

## Executive recommendation

| Layer | What | Why |
|---|---|---|
| **Identity** | Player **wallet** (`getPlayer().userId`), not display name | Names collide; guests are not prize-eligible |
| **Anti-cheat** | **Server-authoritative** daily claim (not scene-only) | Scene code is untrusted; `Map` in `src/daily.ts` is trivial to bypass |
| **DCL integration** | **`signedFetch`** + ADR-44 verification on your API | Official pattern; one wallet sign per session, not per spin |
| **Odds & inventory** | **Off-chain** prize service (DB + admin) | Weights, caps, wearable stock, credit budgets change weekly |
| **Treasury** | **Rizzle-owned** Polygon prize wallet (solo EOA or Safe with only your signers). Bay/Finance **send assets to that address** — they are donors, not co-owners. |
| **Smart contracts (V0)** | **Zero** for daily lock / RNG | ethskills ship: MVP needs 0–2 contracts; game ledger ≠ trustless value transfer yet |
| **Fulfillment** | **Queue** (manual → semi-auto) | Wearables: mint/transfer to winner on Polygon; credits: Finance manual; shoutout: host |

This is the lowest-risk way to hit **Thursday with real rewards** while leaving room for on-chain vouchers later if compliance wants a public audit trail.

---

## What we have today (as-built, 14 Oct)

```text
gold click → room.dailySpin → Multiplayer Server
  → identity gate (context.from + PlayerIdentityData + hasConnectedWeb3)
  → Storage.player day lock + DAILY_CATALOG roll
  → ShowState CRDT (room theatre) + dailySpinResult (claimer ACK)
  → pendingFulfillment → wearable autopilot (EnvVar) or manual
```

- Daily eligibility and RNG are **server-authoritative** (`src/server/`). Client `src/daily.ts` is dead for locks — ignore.
- Show spin RNG is also server-side (`showSpin`); client only animates.
- Guests must not claim; spectators must not get YOU WON. Details: [daily-claim-audit.md](daily-claim-audit.md).

**Historical wrong path (do not revive):** client `pickDailyPrize` / Hub Scenes mirror without `src/server/`.

---

## Decentraland-specific facts (chain & assets)

1. **Player address:** `getPlayer().userId` (check `isGuest` — block daily/show paid prizes for guests).
2. **Wearables (Bay’s mints):** Default DCL collections are **ERC-721 on Polygon**; mint/transfer on Polygon is the normal path (no mainnet gas for players). Legacy collections may exist on Ethereum with bridge — treat inventory by **chain + contract + tokenId** per item.
3. **Marketplace Credits:** Treat as **off-chain / internal DCL ops** until Finance documents an API. Scene shows “Marketplace Credits”; fulfillment = manual ticket to Finance, not a tx hash.
4. **Scene → backend:** `signedFetch` from `~system/SignedFetch` requires **`USE_FETCH`** in `scene.json` `requiredPermissions`. Verify with [`decentraland-crypto-middleware`](https://github.com/decentraland/decentraland-crypto-middleware) or the [`validate-player-authenticity`](https://github.com/decentraland-scenes/validate-player-authenticity) server patterns (auth chain + optional Catalyst “player is in this realm/parcel”).
5. **Polygon vs Ethereum:** User-facing payouts for this game = **Polygon-first**. Ethereum mainnet only if Bay ships bridged/L1 wearables you explicitly list in inventory.

---

## Target architecture

```text
┌─────────────────┐     signedFetch POST      ┌──────────────────────────┐
│  DCL Scene      │  /v1/daily/spin          │  WIP Wheel API           │
│  (SDK7)         │ ───────────────────────► │  - verify ADR-44         │
│  - animate wheel│ ◄─────────────────────── │  - 1 claim / wallet / day│
│  - show result  │  { prizeId, angle, ... } │  - weighted roll         │
└─────────────────┘                          │  - fulfillment queue     │
         │                                   └───────────┬──────────────┘
         │ CRDT sync (spectator spin)                    │
         ▼                                               ▼
   Other players watch                         ┌──────────────────────────┐
                                               │  Postgres (or SQLite V0)   │
                                               │  + admin (Bay / Rizzle)    │
                                               └───────────┬──────────────┘
                                                           │
                                               ┌───────────▼──────────────┐
                                               │  Prize treasury (Polygon)│
                                               │  Rizzle-owned address    │
                                               │  Bay sends TO it only    │
                                               └──────────────────────────┘
```

### Daily spin flow (authoritative)

1. Player on gold pad / daily wheel → scene calls **`POST /v1/daily/spin`** via `signedFetch` with body `{ mode: 'daily' }` (optional nonce).
2. API verifies signature → resolves **wallet** → rejects if guest.
3. API checks **`claims(wallet, utc_day)`** unique index → `409` if already claimed.
4. API loads **active prize table** (weights + remaining inventory + max EV per day).
5. API rolls outcome **server-side**, decrements inventory in a transaction, inserts claim row `pending_fulfillment`.
6. API returns `{ claimId, prizeId, label, wheelIndex, spinNonce }`.
7. Scene drives **wheel animation** to `wheelIndex` (same as show spin), updates daily sign, syncs cosmetic state for room.

**Idempotency:** Client sends `Idempotency-Key: <uuid>` so retries do not double-claim.

### Thursday show spin

Two acceptable V0 modes:

| Mode | Who rolls | Abuse surface |
|---|---|---|
| **A — Host authority** | Host button or host-only API; audience wheel is **cosmetic sync** | Low; trust host + log |
| **B — Server roll, proximity** | API roll + optional Catalyst parcel check | Medium; needs position in signed payload |

For Bay’s first playtest, **A + server log** is enough; move to B when you automate contestant pick.

---

## Treasury — Rizzle owns it, Bay can donate

Bay is helping with assets and Finance intros. She is **not** a co-owner of the prize wallet.

1. **Create a dedicated Polygon address you alone control** (fresh MetaMask account labeled “WIP Wheel Prizes”, or a Safe with only your signers). Record it in `rewards-api/catalog/treasury.json`.
2. **Stock it yourself first** with wearables you already have — enough to playtest the loop without waiting on anyone.
3. **When Bay is ready:** give her that address only. She mints/transfers stock **to** you. No shared keys, no co-sign.
4. **Marketplace Credits:** never onchain in this wallet; Finance ticket when they unlock. Catalog weights stay 0 until then.
5. **Fulfillment:** you (or a later automated hot wallet you control) transfer from the treasury to winners. Optional later: a small hot wallet refilled from a solo Safe — still no Bay co-sign.

Never put the private key in git, the scene, or chat.

### Prize types & fulfillment

| Type | V0 fulfillment | On-chain? |
|---|---|---|
| Wearable | Operator mints/transfers from collection to winner **on Polygon**; API marks `fulfilled` + tx hash | Yes (transfer) |
| Marketplace credits | Finance applies credits; API marks `fulfilled` + ticket id | No |
| Shoutout | Host sheet; API marks `fulfilled` | No |
| Try again | Auto `fulfilled` | No |

### Valuation & odds (off-chain config)

Keep a **prize catalog** table (JSON/YAML in repo for defaults; DB for live):

```yaml
# example shape — not wired yet
- id: wearable-common-01
  type: wearable
  label: "WIP Cap"
  weight: 5
  ev_usd: 12
  chain: polygon
  collection: "0x..."
  token_id: null          # mint on win vs pre-minted pool
  daily_max: 3
  inventory: 50
- id: credits-5
  type: marketplace_credits
  label: "5 Marketplace Credits"
  weight: 20
  ev_usd: 5
  daily_max: 10
```

Server algorithm:

1. Filter prizes with `inventory > 0` and under `daily_max`.
2. Weighted random over remaining.
3. Optional: cap **sum(ev_usd)** per UTC day for budget control.

Scene **only displays** labels returned by API — do not trust local `pickDailyPrize()` for real rewards.

---

## On-chain later (optional, not V0)

Add contracts only when you need **trustless** guarantees:

| Need | Pattern |
|---|---|
| Public “we committed to these odds” | Merkle root / hash onchain, reveals off-chain |
| Player redeemable voucher | ERC-721 “prize ticket” minted by API relayer |
| Automated MANA/USDC micro-pay | Polygon ERC-20 transfer from hot wallet; Safe refills |

Until then, **0 contracts** matches ethskills ship guidance and reduces audit surface before Thursday.

---

## Alternative: DCL Authoritative Multiplayer Server

Pros: player identity + validation inside DCL hosting; no external URL.  
Cons: `@dcl/sdk@auth-server` branch, `authoritativeMultiplayer: true`, ops learning curve; fulfillment still off-chain for wearables/credits.

**Judgment:** Use **external API + signedFetch** for V0 Thursday; revisit auth-server if you want zero external infra and accept SDK fork.

---

## Scene changes (when we implement)

1. `requiredPermissions`: add **`USE_FETCH`**.
2. Replace client `pickDailyPrize()` path with API response when `REWARDS_API_URL` configured (feature flag for local dev fallback).
3. Reject spin UI for `isGuest` with clear copy (“Connect wallet to play”).
4. Daily + Bay ask: route daily through **physical wheel** with server-chosen index (same as show).
5. Keep `ShowState` sync for **animation** only; treat server `claimId` as source of truth for payouts.

---

## Security checklist (minimum)

- [ ] Verify ADR-44 on every mutating endpoint
- [ ] Unique `(wallet, utc_day)` for daily
- [ ] Guests cannot claim
- [ ] Rate limit per wallet + IP
- [ ] Admin endpoints behind API keys you control (not Bay’s wallet)
- [ ] Audit log: who won what, when, fulfillment status
- [ ] No secrets in git; use env + secret manager
- [ ] CORS: only your API origin + DCL client pattern (follow validate-player-authenticity for production)

---

## Thursday timeline (realistic)

| When | Deliverable |
|---|---|
| **Now (no Bay)** | Prize treasury `0x3517…fC29` set; catalog with your wearables; API + scene flag; shoutout/try-again/wearable loop |
| **T-2 days** | API on HTTPS; `REWARDS_API_ENABLED`; one end-to-end test wallet |
| **When Bay replies** | She sends stock to treasury address; bump inventory / enable rare; Credits when Finance confirms |
| **Thursday** | Manual fulfill from your wallet; log everything |
| **Post** | Automate transfers later if volume justifies it |

---

## Open questions for Bay / Finance (need answers, not guesses)

1. **Marketplace Credits:** exact fulfillment mechanism (manual form vs internal tool)?
2. **Wearables:** collection contract address(es) on Polygon + who mints (Bay vs Rizzle relayer)?
3. **Legal/compliance:** any restriction on “random” rewards in-world (jurisdiction, KYC)?
4. **Budget cap:** max USD equivalent per day / per Thursday show?
5. **Guest policy:** block entirely vs “win but must connect wallet within 24h to claim” (second option is harder — avoid for V0).

---

## References

- [ADR-44 Signed Fetch](https://adr.decentraland.org/adr/ADR-44)
- [DCL signed requests (SDK7)](https://docs.decentraland.org/creator/scenes-sdk7/networking/network-connections)
- [Validate player authenticity (example server)](https://github.com/decentraland-scenes/validate-player-authenticity)
- [DCL wearables on Polygon](https://docs.decentraland.org/creator/wearables-and-emotes/wearables/)
- [ethskills ship](https://ethskills.com/ship/SKILL.md) — on-chain vs off-chain litmus test
- Project: `src/daily.ts`, `src/game.ts`, `agent/skills/nft-blockchain/SKILL.md`, `agent/skills/authoritative-server/SKILL.md`
