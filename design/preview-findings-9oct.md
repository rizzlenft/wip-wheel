# Preview findings — 9 Oct (spin mutex session)

**Source:** Rizzle desktop preview against local `npm run start` + Multiplayer Server log.  
**Rule:** Evidence only.

---

## What happened (observed)

| Observation | Verdict | Evidence |
|---|---|---|
| Could spin daily again | **Not a bug in local preview** | Server log: `dailyClaim:2026-10-09` **404** before claim — empty local Storage. Live World day-lock is separate. |
| “Won a wearable” | **Claim succeeded locally** | `[SERVER] daily claim … WEARABLE` at 11:01:18. Label came from catalog. |
| Wearable did **not** arrive in inventory | **Expected in preview** | No `FULFILLER_PRIVATE_KEY` / `FULFILL_URL` in local EnvVar → `fulfill failed … pending queue only`. |
| Daily did **not** feel like it spun the WoF wheel | **Real product gap** | Gold pad is stage-right; wheel is stage-left. Same gap logged 7 Oct (“hard to tell the wheel was moving”). “Won wearable” implies `landDailyPrize` after tween — motion likely ran, FOV/attention missed it; also claimer anim depended only on ShowState CRDT (fragile). |
| Show wheel spun independently afterward | **Mutex pass succeeded** | Log: show spins at 11:01:32 and 11:01:45 after daily; user confirmed show felt correct. |

---

## What this means for the stuck-show bug

The original “daily then show dead” report is **addressed** in this preview: show was usable after daily. Do not reopen that as open unless it reproduces after the visibility fix.

---

## Path forward (ordered)

1. **Ship claimer-side daily kick + louder daily motion** (done this session): `dailySpinResult.dailyNonce` starts the tween without waiting on CRDT; longer/hotter daily spin; sign says `LOOK LEFT →` / `STAGE-LEFT WHEEL`.  
2. **Re-preview A2 with eyes on the stage-left wheel** while clicking gold. Confirm face moves + land label.  
3. **Only then Worlds publish** (Mainnet linker).  
4. **Do not** start station-clarity chrome until A2 passes while looking at the wheel.  
5. **Ops later:** restore `DAILY_WEARABLE_MAX`; preview cannot prove autopilot without EnvVar keys.

---

## Do not confuse

- Local preview reclaim ≠ live “one per wallet per UTC day” broken.  
- Preview WEARABLE ≠ on-chain transfer.  
- GDD’s old “gold pad never drives the wheel” is **superseded** by Bay/MASTER physical-wheel lock — daily *must* drive `WheelRoot`.
