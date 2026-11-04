# Prize fulfillment workflow

How a spin becomes a wearable in someone’s wallet.

**Rule:** the scene never moves assets. The **Multiplayer Server** decides the prize and opens a claim in **DCL Storage**. **You** (later: a bot you control) move assets from the prize treasury to the winner.

Treasury (operating hot): `0xd9618C06458e98a831F503194cC8b62fB0384d45` (Polygon).  
Staging / Bay deposit: `0x351764F8Ef0A80953F80885Fa0f7a7c5F097fC29`.

External `rewards-api/` is legacy/optional — V0 uses Storage only. See [SHIP.md](SHIP.md).

---

## The loop (one picture)

```text
1. Player spins (gold pad)
2. Scene → Multiplayer Server message (wallet from connection)
3. Server: wallet OK? already claimed today? → NO → weighted roll
4. Server writes claim to Storage {
     claimId, wallet, label, type, wheelIndex,
     actionHint, status: pending | none_needed
   }
5. Scene spins physical wheel to wheelIndex, shows label
6. Ops: open pendingFulfillment → transfer wearable
7. Ops: remove that row from Storage (or clear after a batch)
```

Steps 1–5 are automatic after publish.  
Steps 6–7 are **manual for V0** (Thursday). Automate only after volume hurts.

---

## How the spin “corresponds” to the prize

| Piece | Who owns truth |
|---|---|
| Odds / which prize | `src/shared/dailyCatalog.ts` + server inventory in Storage |
| Which wallet won | Multiplayer `context.from` (wallet) |
| What the wheel shows | `wheelIndex` from the same claim |
| Whether they already played today | Player Storage key `dailyClaim:YYYY-MM-DD` |
| Whether they got paid | Row still in `pendingFulfillment` until you clear it |

If the wheel lands on “WEARABLE”, that is cosmetics aligned to `wheelIndex`. **Payout is the pending row**, not the texture.

---

## Wearables (pool in treasury → winner)

**Stocking:** Bay or you send DCL wearables into `0x3517…fC29`. Catalog `inventory` (currently **30**) counts down on the server.

**On win:** transfer **any one** wearable treasury → winner; remove that pending row. No collection contract required.

---

## Marketplace Credits (off-chain)

Rows exist with **`weight: 0`**. When Finance confirms:

1. Set `weight` > 0 in `src/shared/dailyCatalog.ts` and set `inventory` to your credit budget.
2. Republish.
3. Pending queue says: apply N credits to wallet — fulfill off-chain; note ticket id when clearing.

Credits never sit in the Polygon treasury.

---

## Crypto (same treasury, later)

Rows stay at **`weight: 0`** until funded + policy OK. Same pending queue pattern as wearables.

---

## Thursday ops (short)

1. Before Meetup: skim `pendingFulfillment` in [decentraland.org/storage](https://decentraland.org/storage) (Scene tab).
2. During: daily spins keep writing pending rows; show pad 1 is separate (manual log if you award show prizes).
3. After: batch-transfer wearables; clear fulfilled rows; tune weights if TRY AGAIN / WEARABLE feel wrong.

Full publish + Storage CLI notes: [SHIP.md](SHIP.md).  
Scorecard: [v0-scorecard.md](v0-scorecard.md).

---

## Automation (you should not babysit wins)

| Layer | What |
|---|---|
| **Inventory** | Server boot syncs on-chain treasury count minus pending rows. |
| **Check stock** | `npm run treasury-status` |
| **Send NFT** | **In-server autopilot:** EnvVar `FULFILLER_PRIVATE_KEY` → Multiplayer Server signs Polygon `safeTransferFrom` (`src/server/onchainTransfer.ts`). No Railway. |
| **Clear pending** | Server removes the row after tx hash; retries ~45s while World is live. |

Optional external worker only if you want the key off DCL EnvVar. See [fulfill-worker/README.md](../fulfill-worker/README.md).

**Bay stock:** operating hot wallet holds smoke-test stock; staging `0x3517…` holds the rest for refill.
