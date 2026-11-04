# Thursday playtest runbook — real rewards

Use with [SHIP.md](SHIP.md), [v0-scorecard.md](v0-scorecard.md), and [fulfillment-workflow.md](fulfillment-workflow.md).

For an imminent crowd test with **no code changes**, use the short host card: [demo-tomorrow.md](demo-tomorrow.md).

## Treasury model (no Bay co-ownership)

Bay is **not** a project partner on the wallet. She (or Finance) can **send / mint prizes to Rizzle**.

1. Prize treasury: `0x351764F8Ef0A80953F80885Fa0f7a7c5F097fC29`. Empty is fine until stock moves in.
2. Move **your** test wearables into that address (or fulfill from a wallet you control).
3. When Bay responds: give her **only that address** — “mint/transfer prize stock here.” She never needs keys.
4. Marketplace Credits never live in the wallet — Finance applies them off-chain when unlocked (`weight: 0` until then).

## Build without waiting on Bay

| Done without Bay | Needs Bay / Finance later |
|---|---|
| Auth-server one-claim-per-wallet | Extra wearables she mints |
| Daily → physical wheel | Marketplace Credits weights > 0 |
| TRY AGAIN + WEARABLE catalog | Confirm credit fulfillment process |
| Meetup CTA + honest wearables copy | — |
| Preview smoke (no stock) | End-to-end transfer once stocked |

## Before Meetup

1. Wearables in treasury (target ~30).
2. Catalog live in `src/shared/dailyCatalog.ts` (wearable weight on; credits/crypto off).
3. World published with `authoritativeMultiplayer: true` (see [SHIP.md](SHIP.md)).
4. Smoke: one wallet spins once → Storage `pendingFulfillment` → second spin → already claimed → transfer one wearable → clear that row.
5. Marketing: pin `/goto rizzle.dcl.eth` in Meetup chat; say gold pad = daily wearable chance.

## During Meetup

- Daily: wallet required, gold pad → wheel, one claim / UTC day.
- Show wheel: pad 1; spectator moment when it slows.
- Fulfill from **your** treasury. Credits only after weights turn on.
- Meetup plaque: players can open thewipmeetup.com in-world.

## Do not

- Add Bay as a co-signer just to receive donations.
- Promise auto-crypto or live Credits before Finance confirms.
- Commit private keys.
- Rely on client-only daily lock — server Storage is truth.

## After

- Clear fulfilled rows from Storage.
- Tune weights if needed.
- Log checklist answers in [MASTER.md](MASTER.md) + [v0-scorecard.md](v0-scorecard.md).
