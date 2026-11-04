# Preview regression — spin mutex (9 Oct)

**Run this in Creator Hub Preview or `npm run start` from this repo — not the live World yet.**  
Live World still has the honesty pass without mutex fixes until we publish.

Companion: [spin-mutex-audit.md](spin-mutex-audit.md), [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md).

---

## Before you start

1. Preview is serving **this repo** (`~/Projects/wip-wheel`), not a stale Hub `Scenes/` copy.  
2. Wallet connected (not Guest) if you will claim daily.  
3. If you already claimed today on the **live** world, preview uses the **same** scene Storage when pointed at the auth-server world — for local preview without Hammurabi, daily may behave differently. Prefer desktop Explorer preview from `npm run start` / Creator Hub Preview of this folder.  
4. Fully quit Explorer after any later publish (reload ≠ new content).

---

## Checklist (pass / fail in order)

### A. Daily path

| # | Action | Expect | Pass? |
|---|---|---|---|
| A1 | Stand at gold pad; hover | `Spin the daily` | ☐ |
| A2 | Click daily | Daily sign → LOOK LEFT / WATCH THE WHEEL; **wheel face moves** | ☐ |
| A3 | During tween, click show pad or wheel face | Hover → `Wait — wheel busy`; scoreboard play line shows busy (not silence) | ☐ |
| A4 | After land | Daily sign shows prize / TRY AGAIN; show hover → `Spin the show` (or `Call a letter` if debt) | ☐ |
| A5 | **Immediately** click show (within 1s of land) | Show spin **starts** — no ~4s dead zone | ☐ |

### B. Show path

| # | Action | Expect | Pass? |
|---|---|---|---|
| B1 | Fresh show spin (no letter owed) | Wheel spins; letter pad appears for non–try-again | ☐ |
| B2 | While `canGuess` / pad up, click show again | Hover `Call a letter`; scoreboard nudges; **does not** start a second spin | ☐ |
| B3 | Call a letter | Pad closes; show hover back to `Spin the show` | ☐ |

### C. Mutex / honesty smoke

| # | Action | Expect | Pass? |
|---|---|---|---|
| C1 | Daily miss land | Pointer on **TRY AGAIN** slice (index 7), not SHOUTOUT/FREE SPIN | ☐ |
| C2 | Show pad label | Cream `SHOW SPIN` (not gold) | ☐ |
| C3 | Daily during show tween | Daily sign WAIT / SHOW WHEEL BUSY — no second tween | ☐ |

---

## After pass

1. Mark results in MASTER playtest log (one line).  
2. Then publish Worlds (Ethereum Mainnet linker — not Sepolia).  
3. Quit Explorer fully; re-enter `rizzle.dcl.eth`; spot-check A4–A5 + B1.

## If anything fails

Stop. Paste which row failed + what you saw. Do not publish. Do not start station-clarity chrome.
