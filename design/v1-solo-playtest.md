# V1 Preview — solo playtest (one wallet)

**You do not need two wallets** to prove the Bay V1 pitch. Two clients are only for roster / sync stress.

Full build plan: [v1-bay-pitch-build.md](v1-bay-pitch-build.md).

---

## Preflight

```bash
npm run verify:v1-preview
```

Hub workspace must be `~/Projects/wip-wheel`. Preview log must bundle `Projects/wip-wheel/src/index.ts`.

---

## Fast live rounds (Preview storage env)

Set once on the scene (Creator Hub storage UI or CLI):

| EnvVar | Solo value | Purpose |
|--------|------------|---------|
| `HOST_WALLETS` | `0xYourWallet` (comma-separated for co-hosts later) | Shows **START LIVE** / **END LIVE** on HUD; server gates host actions |
| `ROUND_EVERY_SEC` | `120` | Auto live opens every 2 minutes (optional if you host manually) |
| `LIVE_ROUND_MAX_SEC` | `600` | Live window lasts 10 minutes |

Defaults without env: 2 h between slots, 15 min max live.

Wearable on solve still needs `FULFILLER_PRIVATE_KEY` + `PRIZE_TREASURY` in Preview if you want backpack proof.

**Host live (Preview + World):** set `HOST_WALLETS` in Scene Storage to your connected wallet — see hint under countdown if missing.

**Leaderboard:** Bay V1 = **weekly solve board** on the backdrop (**WEEKLY SOLVES**, stage-left wall). Solve a puzzle as a connected wallet to rank. Not the separate “live winners” board (V2).

---

## Solo script (~10 min)

1. **Enter** — spawn reads as studio; HUD shows **NEXT LIVE ROUND** countdown (or **LIVE ROUND** timer when open).
2. **Daily** — gold once; result clears ~6s; no `$WIP` on gold.
3. **Practice** — pad 1 spin → letters or **Solve** → phrase advances after solve; **WEEKLY SOLVES** on backdrop updates.
4. **Wait for live** — or set `ROUND_EVERY_SEC=120` and wait 2 min. HUD flips to **LIVE ROUND** + time left.
5. **Join** — spin from **pad 1** (auto-joins seat 1) or **Join live** on pads 2–3. One wallet alone is valid.
6. **Show spin (practice or live)** — main stage wheel is always **4 slices** (LETTER / WEARABLE / LOSE TURN / BANKRUPT). Live adds roster turns, banks, and wearable fulfill on **correct solve**; practice is the same face and slice math without live roster rules.
7. **Letter cam** — letter pad frames the puzzle (VirtualCamera).
8. **Solve** — correct phrase → wearable fulfill (if env set) → live ends → countdown returns.
9. **Wrong solve (optional)** — open solve, type garbage → **MISSED SOLVE · OUT**; you cannot solve again until live ends.

Pass = daily (2) + practice spin/solve/board (3) + **live round** (4–5) + letter cam (7) + live solve (8). Step 9 optional. If you skip live in a session, note it in [MASTER.md](MASTER.md) — Bay §6 still requires live before publish.

---

## Two-client sync (when you have a second wallet)

Same env. Second Preview instance (other account or guest for watch-only):

| Check | Pass |
|-------|------|
| Both see same phrase index after a solve | |
| Live opens on both at same `liveEndsAt` | |
| Third wallet joins roster; fourth cannot spin in live | |
| Only **active seat** can spin; turn advances on lose-turn | |
| Weekly board rank matches server after solve | |

Guest can **watch** live but cannot join roster or earn board rows.

### If something fails

| Symptom | Check |
|---------|--------|
| Countdown never flips to LIVE | Preview log: `[SERVER] live round every` — set `ROUND_EVERY_SEC`; wait full interval |
| Spin does nothing in live | Wallet connected (not guest); strip says **YOUR SPIN** or **JOIN**; log `[SERVER] live spin rejected` |
| Wheel wrong slice count / labels | Show is **always** 4 slices — see [show-wheel.md](../design/show-wheel.md). Regenerate: `npm run generate:wheels`. Hub `WheelDisc` needs albedo **and** emissive update in code |
| Board stuck solved after live | Should clear in ~6s (`roundResetEndsAt`); if not, note log after `live round ended` |
| Weekly board empty | First solve as wallet; guest solves do not rank |
| Wearable no backpack | Preview needs `FULFILLER_PRIVATE_KEY` + treasury; live uses same autopilot as daily |

Server grep in Preview log: `live round open` · `live spin` · `live land` · `live puzzle solved` · `live round ended`

---

```bash
python3 scripts/generate-assets.py --wheels-only
```

Show wheel (practice + live): `wheel-face-live-4.png` — must match `src/livePrizes.ts`. Gold daily cabinet still uses its own catalog/face.
