# Meetup stress test — 15 Oct 2026

**World:** `rizzle.dcl.eth`  
**Context:** First larger live hang after clarity + fulfill proofs.  
Companions: [fulfill-verify.md](fulfill-verify.md), [spin-mutex-audit.md](spin-mutex-audit.md), [v0-scorecard.md](v0-scorecard.md).

---

## What you reported

1. On **desktop**, other players often looked **invisible**, yet the wheel / daily still moved as if people were spinning.  
2. A bunch of people took the **daily** spin.  
3. At least **two** people won wearables.

---

## On-chain / treasury (facts)

Hot `0xd961…` after hang: **74** wearables, ~4.09 POL, nonce **21**.

| When (ET) | Winner | Tx | Notes |
|---|---|---|---|
| 09:20 | `0x81e5…` (pre-Meetup Rizzle smoke) | [`0x0f23…`](https://polygonscan.com/tx/0x0f23d2a10d67dd030a7037ac3362ea0c2caf93f8b62ca3f1dc8d1bb5c04f8845) | Morning smoke |
| **15:53** | `0x1def9b…` | [`0x0378…`](https://polygonscan.com/tx/0x0378978054e39d35df6a2b80f1ae02cc6ca618163e2e64ae649e5e6c55da3af3) | Meetup win — catalyst shows pool items |
| **15:58** | `0x797520…` | [`0x036b…`](https://polygonscan.com/tx/0x036b94907882c65c0f0e04e950e79fc121f8ac3cd2601bfe350ade88d2e17540) | Meetup win — tx success (heavy avatar; item may be buried in 200+ types) |

Accounting: 77 → (−1 morning) → (−2 Meetup) ≈ **74**. Autopilot kept up under crowd. Room dailyMax still **6**/UTC day — we did not burn the whole pool.

---

## Invisible avatars + spinning wheel — diagnosis

| Hypothesis | Verdict |
|---|---|
| Our scene hides avatars (`AvatarModifierArea`) | **No** — none in scene code / composite dress |
| Claim / CRDT broken | **No** — wheel + daily sign + fulfill all advanced |
| Explorer fails to **render** peers under load | **Likely** — known DCL issue ([unity-explorer#4828](https://github.com/decentraland/unity-explorer/issues/4828), forum/crowded Worlds): peers still in comms / server state, meshes missing |
| You only saw “ghost spins” | **Expected coupling** — show/daily state is **server CRDT**, not “avatar visible ⇒ may spin.” Invisible claimer can still own a gold-pad click; everyone else watches the shared `WheelRoot` + `dailyWinner` strip |

**Product read:** Stress test proved the **game** path under crowd. The **social** path (see who’s on the pad) failed for at least one desktop client because of avatar LOD/load — Foundation/Explorer domain, not a thaw of claim code.

**Host mitigations next hang (ops, not code):** ask crowded clients to soft-reload if people vanish; keep HUD `{name} · DAILY · WATCH` as the ownership cue when bodies don’t load; shout winners by display name from the daily sign.

**Scene mitigations later (V1 polish, freeze-safe):** stronger “who’s on the wheel” (already partially shipped); optional spotlight on gold pad while `dailySpinning`; do **not** invent fake visible NPCs.

---

## Daily under stress — did the mutex hold?

Intended design (and what the hang should feel like):

```text
Many wallets click gold
  → server wheelReserve + dailySpinning serializes the physical wheel
  → others get “wheel busy / try after land”
  → each successful claim: one day lock per wallet
  → WEARABLE → pending → autopilot (async, does not block tween)
```

Crowd of dailies is **success**, not a bug. Serialized wheel means you see a queue of spins, not 20 simultaneous tweens. Two Meetup WEARABLE lands ~5 minutes apart fits that pattern.

No evidence of double-pay to the same wallet from chain (distinct recipients).

---

## Scorecard impact

| Proof | Meetup |
|---|---|
| 2 Daily | **Crowd-proven** |
| 4 Spectator | **Partial** — people watched the wheel; avatar visibility hurt “who’s spinning” |
| 5 Rewards | **Crowd-proven** (2 live autopilot wins) |
| 3 Thursday | Soft — hang happened; title card still carries the ritual |

---

## Do / don’t from this hang

**Do**
- Log every hang with [fulfill-verify.md](fulfill-verify.md) (done for the two Meetup txs).  
- Treat invisible peers as Explorer load — report to Foundation with time + client if it recurs.  
- Keep freeze on claim/fulfill.

**Don’t**
- Add `AvatarModifierArea` “fixes” or thaw turns because ghosts spun.  
- Raise `dailyMax` mid-hang without a plan (stock is fine; pace is social).  
- Blame missing bodies on the daily pipeline — CRDT outran rendering.

---

## Next (after digest)

1. Optional Bay note: Conditional Pass mechanics held under Meetup load; avatar visibility is Explorer.  
2. Soft V1: amplify who’s-spinning (pad light / louder strip) when ready.  
3. Sightline pass still parked unless hang notes asked for it.
