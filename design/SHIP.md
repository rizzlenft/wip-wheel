# Ship checklist — Multiplayer Server (Option A)

Daily prizes run on **Decentraland’s hosted Multiplayer Server**. No Railway/Render/Vercel required for V0.

## What you need

1. A walleted Decentraland account (same as publishing the World).
2. Creator Hub or `npm run start` for preview; `npm run deploy` for `rizzle.dcl.eth`.
3. Wearables in operating treasury `0xd9618C06458e98a831F503194cC8b62fB0384d45` (Bay deposit stays `0x3517…`; sweep to hot as needed).

**Your laptop does not stay on.** After publish, DCL hosts the server while players are in the World.

## Preview (local)

```bash
npm run start
# or Creator Hub Preview
```

The SDK starts a **local** headless server in the background. Sign in with a wallet (not guest). Spin the gold pad once → wheel lands → check Storage:

- Local file: `node_modules/@dcl/sdk-commands/.runtime-data/server-storage.json`
- Or CLI: `npx sdk-commands storage player get <your-0x> dailyClaim:YYYY-MM-DD`

Second spin same UTC day should show already claimed.

## Publish

```bash
npm run build
npm run deploy -- --target-content https://worlds-content-server.decentraland.org
```

Leave and re-enter `rizzle.dcl.eth`. Cold start can take ~15s (“CONNECTING TO SHOW SERVER…”).

## Fulfill wearables (in-server autopilot)

Wins go to Storage `pendingFulfillment`. The Multiplayer Server transfers NFTs itself using a hot-wallet key in **EnvVar** (DCL Storage → Environment). No third-party host.

```bash
npx sdk-commands storage env set FULFILLER_PRIVATE_KEY --value "0x…hot-wallet-key"
npx sdk-commands storage env set PRIZE_TREASURY --value "0xd9618C06458e98a831F503194cC8b62fB0384d45"
# optional
npx sdk-commands storage env set POLYGON_RPC_URL --value "https://polygon-bor-rpc.publicnode.com"
```

Key file (local only, gitignored): `fulfill-worker/data/HOT_WALLET.txt` / `hot-wallet.env`.

On WEARABLE win the server: lists hot-wallet wearables → `safeTransferFrom` on Polygon → clears the pending row. Retries ~every 45s while players are in the World.

**Bundle note:** signing uses lean `micro-eth-signer` in `src/server/onchainTransfer.ts`. Do **not** reintroduce `viem` into the scene — it bloated `bin/index.js` and blanked Explorer. Keep a size gate (~+200KB max over lean baseline) before publish.

Optional fallback (not required): `FULFILL_URL` + `FULFILL_SECRET` → external [fulfill-worker](../fulfill-worker/README.md).

Without a key or worker, wins stay in `pendingFulfillment` for manual transfer.

Optional: `scene.json` → `logsPermissions` for `npm run server-logs`.

## Marketing (exceed the bar)

- World description already sells daily + Thursday Meetup.
- Tags: `game`, `social`, `meetup`, `prizes`, `wearables`.
- In-world Meetup plaque opens https://thewipmeetup.com.
- Pin `/goto rizzle.dcl.eth` in Meetup chat the morning of show.

Scorecard: [v0-scorecard.md](v0-scorecard.md).

## Credits

Still **off** (`weight: 0`). Enable later in `src/shared/dailyCatalog.ts` when Finance process is clear.

## If something wedges

- Guest / no wallet → daily sign says connect wallet.
- Server waking → wait ~15s after first entrant.
- Stale claim → Storage → Player tab → clear `dailyClaim:YYYY-MM-DD` for that wallet (support only).
- Wearable win but no NFT → check server logs / `pendingFulfillment`; confirm EnvVar key + hot stock + POL.  
- Full verify checklist (on-chain + lambdas + Storage): [fulfill-verify.md](fulfill-verify.md).
