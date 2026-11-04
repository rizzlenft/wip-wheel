# Prize rails

One spin system, **three payout rails** (+ miss). Same claim queue; different fulfillment.

| Rail | `type` | Where value lives | V0 fulfill | Enable by |
|---|---|---|---|---|
| **Wearable** | `wearable` | DCL NFTs in treasury `0x3517…fC29` | Transfer 1 NFT → winner | `inventory` + `weight` > 0 |
| **Credits** | `marketplace_credits` | DCL Marketplace Credits (off-chain) | Finance / Bay ticket | Set `weight` when Finance confirms |
| **Crypto** | `crypto` | MANA / USDC in same treasury | Token transfer → winner | Fund wallet + `inventory` + `weight` |
| Miss | `none` | — | Nothing | always |

Removed on purpose: shoutout (no real trigger), bonus spin (was a fake try-again).

## Current stock (Oct 2026)

- **Wearables:** `inventory: 30`, **active** (~28% weight).
- **Credits:** rows reserved, **`weight: 0`** until Marketplace Credits process is defined (not sent to treasury wallet).
- **Try again:** rest of the roll.
- **Crypto:** weight 0 until funded.

Plain-English flow: [`../../design/how-daily-prizes-work.md`](../../design/how-daily-prizes-work.md).  
Ship steps: [`../../design/SHIP.md`](../../design/SHIP.md).
