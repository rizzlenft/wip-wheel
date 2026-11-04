# Playtest log — 14 Oct 2026

Companion: [MASTER.md](MASTER.md), [v0-closure.md](v0-closure.md), [pipelines.md](pipelines.md).

---

## Environment

| | |
|---|---|
| Tree | `/Users/rizzle/Projects/wip-wheel` (Hub workspace confirmed; `npm run verify:preview-path` green) |
| Preview | Creator Hub desktop + phone |
| World | `rizzle.dcl.eth` (smoke after publish — see below) |
| Autopilot in Preview | OFF (EnvVar 404 expected) |

---

## What worked

| Check | Platform | Result |
|---|---|---|
| Correct bundling path | Desktop Preview | `Bundling …/Projects/wip-wheel/src/index.ts` |
| Daily claim + day lock | Desktop Preview (earlier) | `[SERVER] daily claim … WEARABLE` → second click already claimed |
| Show spin, no black diamond | Desktop Preview | `show spin → SHOUTOUT`; face alpha fixed |
| Daily TRY AGAIN + already claimed | Desktop (post-publish / Hub) | One spin → TRY AGAIN → cannot reclaim |
| Show wheel spin | Desktop | Worked as intended |
| Mobile daily + show feel | Mobile | Appeared to work as intended |
| Day lock after a “win” | Mobile guest | Could not spin again (lock fired) |

---

## What did not work / open integrity

| Issue | Severity | Notes |
|---|---|---|
| **Guest “won a WEARABLE”** | **P0** | Unlogged-in guest on mobile saw WEARABLE then already claimed. Two causes: (1) server guest gate failed open when `PlayerIdentityData` missing; (2) **every client** treated room `dailyNonce` as YOU WON + `dailyDoneHere` — spectators/guests locked after watching someone else’s claim. |
| Guest prize delivery | By design | Wearables only go to a connected wallet. Guests may **watch**; they must not claim. Copy: CONNECT TO SPIN / GUESTS WATCH. |
| Preview autopilot | Expected | No local `FULFILLER_PRIVATE_KEY` → pending queue only. |
| Hud React `key` warning | Soft | Letter pad list keys — non-blocking. |
| Soft V0 leftovers | Soft | `SHOW_OPEN_ALWAYS`, stub puzzle — V1. |

### Guest / spectator fix (same day, three passes)

1. Server fail-closed: wallet shape + `PlayerIdentityData` + `!isGuest` + Catalyst **`hasConnectedWeb3`**.  
2. Client: only claimer lands `YOU WON` + day lock; spectators get `LAST DAILY`.  
3. Client: **no optimistic `dailyDoneHere`** before ACK (sticky ALREADY CLAIMED after fake win).

**Republish required.** Phone guest must see `CONNECT TO SPIN` / `GUESTS WATCH`, never YOU WON WEARABLE. If still wrong, confirm Explorer is fully quit after publish and that Hub published `Projects/wip-wheel`.

---

## How guest vs wallet prize delivery works (intended)

```
Guest (no wallet)  → watch studio / show spins OK
                   → daily gold → CONNECT TO SPIN (no claim, no WEARABLE land)
Wallet connected   → one daily claim / UTC day
                   → WEARABLE → pendingFulfillment → autopilot (EnvVar) → backpack
                   → TRY AGAIN → day locked, come back tomorrow
```

A guest “win” is a **lie** — nothing can be delivered. Treat any guest WEARABLE land as a bug.

---

## Later 14 Oct — Desktop Preview (post–claimant module)

- Path: `Projects/wip-wheel`. Autopilot OFF (EnvVar 404) expected.
- Logged-in wallet: daily already claimed → no second spin; show spin → `WEARABLE` (show table, OK).
- Guest not testable in Hub Preview on phone (user constraint).

### Guest / IP (knowledge)

DCL does **not** day-lock by IP. Guests get an ephemeral `0x` peer address per session. Our gate is `PlayerIdentityData.isGuest` + Catalyst `hasConnectedWeb3` — not IP. Re-entering as guest may mint a new ephemeral address; they still fail eligibility. A mistaken guest claim only sticks to that address in Storage, not the IP.

## World publish — mobile “WIN A WEARABLE then already claimed”

Likely **same wallet already claimed today** (not a guest). Idle lied with WIN A WEARABLE before status / after celebration. Honesty fix: CHECKING… → eligible WIN A WEARABLE only / claimed COME BACK. See audit §7.

## Afternoon 14 Oct — Fractilians week card + board clearance

Preview log (Hub desktop) checked green before publish:

| Signal | Verdict |
|---|---|
| Bundles `Projects/wip-wheel` (scene_id path under that tree) | Correct tree |
| Typecheck 0 errors | OK |
| `wearable inventory synced: onChain=78 pending=2 available=76` | Healthy; 2 pending expected without Preview EnvVar |
| `wearable autopilot OFF` + EnvVar 404s | **Expected in Preview** — World EnvVars still pay on publish |
| `show spin → Rizzle FREE SPIN` | Show path + letter pad OK |
| Dotfile Audio loader noise (`.gameover.mp3` etc.) | Hub composite leftovers — ignore |
| Hud React `key` warning | Soft / known — do not touch letter pad layout under freeze |

Week card: guest FRACTILIANS, phrase packs 3×14. Board row-3 strip clip fixed (see learnings).

**Published same afternoon** to `rizzle.dcl.eth`. Desktop + mobile: board, show spin, room feel OK. Spin/claim freeze remains.

## Pre-Meetup smoke — Rizzle daily (15 Oct ~09:20 ET)

| Step | Result |
|---|---|
| Gold pad → WEARABLE land | **Pass** (user report) |
| Come-back / second spin blocked | **Pass** (user report) |
| Autopilot on-chain | **Pass** — hot → `0x81e5cd19323ce7f6b36c9511fbc98d477a188b13` |
| Tx | [`0x0f23d2a1…8845`](https://polygonscan.com/tx/0x0f23d2a10d67dd030a7037ac3362ea0c2caf93f8b62ca3f1dc8d1bb5c04f8845) @ **2026-10-15 13:20:04 UTC** |
| Catalyst | Winner shows pool items (Idol Aura Headset / Jacket / Spooky Wings) |
| Hot after | **76** NFTs, ~4.18 POL, nonce 19 (was 77 / nonce 18) |

Flow matches intent for today’s larger demo. Remaining demo risk is **crowd ops** (wake early, pin, host line, shout winners), not claim/fulfill plumbing.

## World live — guest gate + WEARABLE delivery (14 Oct ~15:00 ET)

Real players on published `rizzle.dcl.eth` (post-clarity publish):

| Check | Result |
|---|---|
| Guest on daily | **Pass** — saw connect / need-wallet messaging; no claim |
| Wallet daily → WEARABLE | **Pass** — land + **COME BACK TOMORROW** + day lock |
| Wearable in backpack | **Pass** — on-chain + catalyst (see below) |

**Fulfill proof (autopilot):** hot `0xd961…4d45` → winner `0xd90a559bca605b5a1c861f7b290a7604c584896f`  
- Tx: [`0x1c3ac02b…91ce`](https://polygonscan.com/tx/0x1c3ac02b4b182c3e42540fd6cce11508d25e6d4e75ccda680bb321e5dd8d91ce) @ **2026-10-14 19:01:49 UTC**  
- Item: **Idol Cropped Jacket** (collection `0x45c2…389`)  
- Catalyst lambdas: winner inventory includes Idol Cropped Jacket  

(Same day earlier: another jacket out to `0xbd11b2c1…d4df` @ 13:42 UTC — prior smoke/ops.)

Hot still healthy: ~4.23 POL, nonce 18, ~77 wearables remaining after these outs.

**Learning:** Claim UX can look “done” before backpack indexes — verify with Polygon tx from hot **or** Storage `pendingFulfillment` / `lastFulfillError`, not vibes. Today autopilot cleared the row (no pending needed).

## Clarity Preview — sit aisle + letter HUD (14 Oct afternoon)

- Sit cue (`SIT · WATCH`) in aisle: **better on spawn** (3rd person). Accept for now; full sightline widen still parked.
- Room feel / pads / daily come-back: **working correctly** (user check).
- HUD `LETTER IN PLAY · OPEN`: lives on the **letter-pad title** (top strip hides while `canGuess`). First Preview missed it because copy was only on the hidden strip — fixed same afternoon.
- Follow-up: “can’t spin at all” after show — almost certainly **letter window open** (`canGuess`), not bind regression. See [spin-preview-diag.md](spin-preview-diag.md). Hardened UI root `pointerFilter: 'none'` always (build-ui best practice).

## Clarity Preview — audience FOV / sit cue (14 Oct, post–copy pass)

Screenshot from spawn/back aisle (tiger onesie). Clarity copy reads OK: HUD `COME BACK TOMORROW · PRACTICE SHOW AT PAD 1`, daily sign `COME BACK` / `TOMORROW` / `ONE SPIN USED`, SpinLabel grammar intact.

| Finding | Severity | Goal it touches | Verdict |
|---|---|---|---|
| Had to **turn around or walk back** to notice `SIT · WATCH THE SHOW` | Soft UX | Meetup hang / proof 4 spectator | Label sits on benches (`AUDIENCE` z≈11); spawn looks at the board (z≈30). First frame never shows the sit cue. |
| **Seated:** wheel + daily sign **occlude** the puzzle board | Soft → Meetup P1 | Proof 4 shared watch | Three-column block (wheel z≈23, daily z≈21, board z≈30) is intentional for spawn clarity — from seats those props sit *in* the sightline to the board. |

**Do not fix mid–backpack-smoke.** This is a [LAYOUT-MOVE.md](LAYOUT-MOVE.md) pass (widen columns / nudge benches / aisle-facing sit cue), not more HUD copy. Clarity pass already did its job (gold vs pad 1 + come-back). Sightlines are the next *floor* concern after World reward proof.

## Next

1. World backpack smoke (proof 5) if a fresh/eligible wallet can spin.
2. Crowd / Meetup host ops ([demo-tomorrow.md](demo-tomorrow.md)).
3. **Audience sightline pass** (layout only): sit cue discoverable without U-turn; seated view of board+wheel clear enough for Meetup.
4. Bay credits: Rizzle as studio operator → smoke-grant 5 → catalog weight 0 until then.
