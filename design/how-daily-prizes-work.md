# How daily prizes work (plain English)

**Full audit:** [daily-claim-audit.md](daily-claim-audit.md) — identity, claimer vs spectator, multi-prize ledger.

## One sentence

The **DCL Multiplayer Server** decides eligibility and prize; the **scene only animates**; **fulfillment** (wearable transfer, later credits) runs from a **pending queue** against the winner’s wallet. Guests watch; they cannot claim.

## Step by step

```text
You stand on gold / click daily
        │
        ▼
Scene → Multiplayer Server ("this peer wants today's spin")
        │  identity: context.from + PlayerIdentityData + Catalyst hasConnectedWeb3
        │
        ├─ Guest / no Web3? → CONNECT TO SPIN (no claim)
        ├─ Already spun today? → ALREADY CLAIMED
        └─ OK → server rolls DAILY_CATALOG
                │
                ▼
         Writes claim to Storage (player day key + pending if paid)
                │
                ▼
         Claimer: YOU WON + label · Spectators: LAST DAILY
                │
                ▼
         If WEARABLE: autopilot or ops transfers treasury → wallet
```

**“Tied to the spin” means:** one claim chooses `label` + `wheelIndex` together. The wheel does not roll a second time for payout.

## Live roll today

| Outcome | Chance (approx) | What happens |
|---|---|---|
| TRY AGAIN | ~60% | Day locked; nothing to send |
| WEARABLE | ~40% | Pending → Polygon wearable from hot treasury |
| CREDITS / crypto | **Off** (`weight: 0`) | Enable later; same claim shape |

Catalog: `src/shared/dailyCatalog.ts`. Hot treasury: `0xd961…`. Staging/Bay deposit: `0x3517…`.

## Preview vs World

| | Preview | World |
|---|---|---|
| Day lock same session | Yes | Yes |
| Day lock after leave/re-enter | Weak | Storage truth |
| Wearable in backpack | Needs local EnvVar (usually off) | Needs World EnvVar + POL |

## Docs

- Audit: [daily-claim-audit.md](daily-claim-audit.md)
- Pipelines: [pipelines.md](pipelines.md)
- Trust model: [rewards-architecture.md](rewards-architecture.md)
- Ops: [SHIP.md](SHIP.md) + [fulfillment-workflow.md](fulfillment-workflow.md)
