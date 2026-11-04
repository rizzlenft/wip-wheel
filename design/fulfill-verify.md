# Fulfill / scale ops — verify a WEARABLE win

**Why:** Claim UX can look finished before the NFT is in backpack. Scale = same checklist every win, not vibes.

Companion: [SHIP.md](SHIP.md), [fulfillment-workflow.md](fulfillment-workflow.md), [playtest-14oct.md](playtest-14oct.md).

---

## Happy path (proven 14 Oct)

```text
Wallet spins gold → server rolls WEARABLE → pendingFulfillment
→ Multiplayer Server EnvVar FULFILLER_PRIVATE_KEY
→ Polygon safeTransferFrom (hot 0xd961… → winner)
→ clear pending row; catalyst indexes wearable
```

Player should stay in World ~1–2 min after land (retry tick ~45s). Guests never enter this path.

---

## Verify without guessing (order)

| # | Check | Pass |
|---|---|---|
| 1 | Hot wallet outbound `Transfer` on Polygon | Tx from `0xd9618C06458e98a831F503194cC8b62fB0384d45` to winner |
| 2 | Catalyst lambdas | `https://peer.decentraland.org/lambdas/users/<wallet>/wearables` includes the item |
| 3 | Explorer backpack | Same wallet; allow index lag after (1) |
| 4 | Scene Storage (needs wallet sign) | `pendingFulfillment` empty for that claim; or `lastFulfillError` if stuck |

**CLI (Storage — interactive sign):**

```bash
npx sdk-commands storage scene get pendingFulfillment
npx sdk-commands storage scene get lastFulfillError
npm run treasury-status   # hot stock + POL
```

**On-chain (no Storage login):** scan recent ERC-721 `Transfer` logs from hot across treasury collection contracts (see playtest 14 Oct method), or Polygonscan token NFT txs for `0xd961…`.

---

## Stock vs catalog (do not confuse)

| Layer | Role |
|---|---|
| Hot wallet NFTs (`npm run treasury-status`) | What autopilot can send |
| Server `dailyInventory.wearable` | Synced from hot lambdas (on wake + ≥1/min before spins) |
| Catalog `inventory` in `dailyCatalog.ts` | **Seed only** if Storage empty — not live stock |
| `dailyMax: 6` (or EnvVar `DAILY_WEARABLE_MAX`) | Max WEARABLE awards / UTC day for the whole room |

14 Oct: hot had **77** wearables while the catalog seed still said 30 — chain sync is truth after the re-sync fix.

## Scale habits (before each hang)

1. `npm run treasury-status` — enough wearables + ≥~5 POL on hot.  
2. Wake World ~15 min early so autopilot process is alive (triggers inventory sync).  
3. After first WEARABLE of the day: confirm one tx (table above) before promising more.  
4. Cap awareness: `dailyMax` wearables / UTC day across the room — rest are TRY AGAIN even if hot still has stock.  
5. If `lastFulfillError` appears: fix EnvVar / stock / POL; do **not** thaw claim RNG. Manual transfer + clear pending row is OK.

---

## Known failure modes (do not relearn)

| Symptom | Likely cause | Fix |
|---|---|---|
| WEARABLE on sign, no NFT | Autopilot off / key missing / left World too fast | EnvVar; stay in room; check `lastFulfillError` |
| Every transfer throws | No `crypto.getRandomValues` in isolate | Already polyfilled in `onchainTransfer.ts` (8 Oct) |
| Fat eth blank Explorer | `viem` in scene bundle | Keep lean `micro-eth-signer` only |
| Guest “won” | Identity gate fail-open | Fail closed — guests watch only |
| Preview never pays | No local FULFILLER key | Expected — prove on World |

---

## Evidence log template

```text
Date / UTC:
Winner wallet:
Claim label: WEARABLE
Tx hash:
Item name:
Day lock on second spin: Y/N
pendingFulfillment after: empty / still pending / error:
```
