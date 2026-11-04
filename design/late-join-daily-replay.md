# Late-join daily replay (13 Oct finding)

**Symptom:** Enter parcel → daily sign flashes LOOK LEFT → wheel spins → “YOU WON / WEARABLE” without intentionally claiming.

**Evidence (code):**

- Show spins: late joiners **snap** via `snappedFromNetwork` — no full replay (`game.ts` `syncSpinSystem`).
- Daily spins: **no snap path**. Any `dailyNonce > lastSeenDailyNonce` (starts at 0) runs `beginDailyWatch` + full tween + `landDailyPrize` with `state.dailyPrize`.
- Room `ShowState` keeps the last daily winner/prize forever for the Hammurabi session.

So this is usually a **spectator/late-join replay of the room’s last daily**, not a second claim. Real claim still requires `dailySpin` + wallet Storage day lock.

**Busy copy (14 Oct):** No LOOK LEFT / STAGE-LEFT nag while spinning. Gold sign stays `SPINNING` / `DAILY SPIN` until land. V1 spectator beat (`VirtualCamera`) can own “look at the wheel” later if needed.

**Fix (13 Oct code):**

1. `dailySyncedFromNetwork` on first `isStateSyncronized` ShowState read.
2. If `dailySpinning` → join mid-spin → animate (real live event).
3. Else if `dailyNonce > 0` → `snapToPrize` + `showDailyRoomLast` (`LAST DAILY`, not YOU WON).
4. Else animate only when `dailyNonce` increases after sync, or claimer `kickDailyWheelFromAck` (sets synced flag).
