# Bay — V1 World handoff (copy/paste)

**Play:** https://decentraland.org/play/?realm=rizzle.dcl.eth  
**What shipped:** Practice puzzle wheel, scheduled live rounds, **host can START LIVE** for demos, daily wearable (once/day), **weekly solve leaderboard** on the backdrop.

---

## For cold visitors (30 seconds)

1. **Gold pad (right)** — one daily spin per wallet per day. Outcome is **WEARABLE** or **TRY AGAIN** only (never `$WIP` on the gold sign).  
2. **Pad 1 (left)** — practice the show: spin the 4-slice wheel, letters, solve the phrase.  
3. **Countdown** — **NEXT LIVE ROUND** opens automatic live play (3 wallets, turns, solve to win pending wearable).  
4. **Leaderboard** — **WEEKLY SOLVES** on the wall behind the set (left side). Ranks **puzzles solved this week** with a connected wallet.

---

## Live round (3 players)

- Connect a wallet (guests can watch only).  
- When **LIVE ROUND** (or host starts): join on **pad 1** (spin) or **Join live** on pads **2–3**. Max **3** contestants.  
- Wheel: LETTER · WEARABLE · LOSE TURN · BANKRUPT.  
- **Wearable** lands in your bank on spin; it goes to your **backpack only after a correct solve** (not on spin).  
- Wrong full phrase → **OUT THIS ROUND** (can’t solve again until live ends).

---

## What is **not** in this V1 build

- Second board for “live round winners” (V2).  
- `$WIP` token payouts / 5th wheel slice (V2).  
- Host picking contestants with `movePlayerTo` (V2 polish).

---

## If something looks wrong

| Symptom | Likely cause |
|---------|----------------|
| Stuck “CONNECTING TO SHOW SERVER…” | Wait ~15s; refresh once |
| No host buttons | Operator must set `HOST_WALLETS` in Scene Storage |
| Live never opens | Default auto slot is ~2h; host uses **START LIVE** or ops sets `ROUND_EVERY_SEC` |
| Empty weekly board | Solve once with a **wallet** (guests don’t rank) |

Full QA script: [bay-qa-checklist.md](bay-qa-checklist.md) §6.
