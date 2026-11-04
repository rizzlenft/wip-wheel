# Wearable fulfill worker (optional fallback)

**V0 primary path is in-server** — Multiplayer Server + EnvVar `FULFILLER_PRIVATE_KEY` in the scene (`src/server/onchainTransfer.ts`). No Railway required. See [design/SHIP.md](../design/SHIP.md).

This package is an **optional** external webhook if you ever want the hot key off DCL EnvVar:

```text
FULFILL_URL + FULFILL_SECRET  →  this worker  →  Polygon transfer
```

## Wallets

| Role | Address | Key where? |
|---|---|---|
| **Hot (pays winners)** | `0xd9618C06458e98a831F503194cC8b62fB0384d45` | Scene EnvVar **or** worker `.env` |
| Staging / Bay deposit | `0x351764F8Ef0A80953F80885Fa0f7a7c5F097fC29` | Never |

Local key file (gitignored): `fulfill-worker/data/HOT_WALLET.txt`

## Prefer in-server (default)

```bash
npx sdk-commands storage env set FULFILLER_PRIVATE_KEY --value "0x…"
npx sdk-commands storage env set PRIZE_TREASURY --value "0xd9618C06458e98a831F503194cC8b62fB0384d45"
```

## Optional webhook

1. Deploy this worker with `FULFILL_SECRET` + `FULFILLER_PRIVATE_KEY`.
2. `npx sdk-commands storage env set FULFILL_URL --value "https://YOUR-HOST/v1/fulfill"`
3. Same secret as `FULFILL_SECRET`.

## Security

- Never commit `.env` / `data/`.
- Never put the hot key in the scene source — EnvVar only.
