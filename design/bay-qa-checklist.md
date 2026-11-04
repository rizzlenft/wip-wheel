# Bay + QA acceptance checklist (V0 Conditional Pass)

**Use after:** clarity publish is live on `rizzle.dcl.eth` **and** World backpack smoke (§2 in [NOW.md](NOW.md)).  
**Do not use as a build ticket** — this is the script for the follow-up with Bay / QA.

Companions: [bay-v0-eval-response.md](bay-v0-eval-response.md), [v0-scorecard.md](v0-scorecard.md), [demo-tomorrow.md](demo-tomorrow.md).

World: `rizzle.dcl.eth` · Play: https://decentraland.org/play/?realm=rizzle.dcl.eth

---

## 0. Prep (host, 10 min before)

- [ ] Open World on **desktop** first (~15s if cold) so Multiplayer Server wakes.
- [ ] Confirm HUD is not stuck on `CONNECTING TO SHOW SERVER…`.
- [ ] Say once: **gold pad = daily (once/day)** · **pad 1 = show** · **Thursday 12 PM PT = Meetup**.

---

## 1. Cold onboarding (Bay Priority 1)

Cold wallet (or fresh eyes). No guide talking over them for 30s.

| Check | Pass if |
|---|---|
| First glance | Names wheel, puzzle/Thursday, gold daily without being told |
| Gold pad | Hovers `Spin the daily` (or `Come back tomorrow` if already claimed) |
| Pad 1 | Label reads show / pad 1; hover `Spin the show` (or busy/watch) |
| After daily | Sign/hover pushes **come back tomorrow**, not only “already claimed” |
| Thursday | Can point at title card `THURSDAYS · 12 PM PT` |

---

## 2. Daily lock + reward (her “needs verification”)

| Check | Pass if |
|---|---|
| Wallet A | One daily → physical wheel → land on daily sign |
| Wallet A WEARABLE | NFT appears in **Backpack** (Polygon) within a few minutes; stay in World briefly — **proven 14 Oct** (Idol Jacket / `0xd90a…`); re-check any new win via [fulfill-verify.md](fulfill-verify.md) |
| Wallet A second spin | Blocked same UTC day — **proven** with come-back copy |
| Guest daily | Connect / need-wallet messaging — **proven 14 Oct** |
| Wallet B (optional) | Same day can still claim; or TRY AGAIN → come-back copy |

---

## 3. Shared wheel / “don’t disrupt” (V0 substitute — not turns)

| Check | Pass if |
|---|---|
| Mutex | Second spin while wheel turning gets busy/watch hover — not a second tween |
| Whose spin | HUD can name who is on daily/show while spinning |
| Letter moment | Strip shows `LETTER IN PLAY · OPEN` (honest free-for-all until V1/V2) |
| Daily while show idle | Other wallets can still take **daily** when show is not holding the wheel |

**Not in scope for V0 pass:** contestant locks, only-one letter picker, pad rewrite.

---

## 4. Week card swap (no rebuild)

| Check | Pass if |
|---|---|
| Content path | Guest/puzzle live in `src/week.ts` (+ mirror `design/week.json`) |
| Demo | Host shows changing guest/phrase → Preview → (optional) publish — not a code rewrite |

---

## 5. Meetup / spectator (soft)

| Check | Pass if |
|---|---|
| Sit | Benches offer Sit; walk >1.5 m stands |
| Watch | At least two people can watch a show spin slow together |
| Pin | Meetup chat has `/goto rizzle.dcl.eth` + play link |

Sightline polish (wheel/daily vs board from seats) may still be open — note it; do not fail V0 solely on that.

---

## 6. V1 live round (solo — one wallet)

Script: [v1-solo-playtest.md](v1-solo-playtest.md). Preflight: `npm run verify:v1-preview`.

| Check | Pass if |
|---|---|
| Countdown | **NEXT LIVE ROUND** ticks; flips to **LIVE ROUND** when slot opens |
| Join | **Join live** on a pad or spin from pad 1 joins seat 1 |
| Live wheel | Four labeled slices (practice + live); lands match strip | [show-wheel.md](show-wheel.md) |
| Wearable | Not in backpack on spin; on **solve** if fulfill env set |
| Wrong solve | **OUT THIS ROUND**; cannot solve again until live ends |
| Daily | Still one/day; gold never `$WIP` |
| Board | **WEEKLY SOLVES** moves after a solve |

Two-wallet roster/turn stress: same doc § Two-client sync — optional.

---

## Sign-off line (copy for Bay)

> Cold user completed daily without a guide; day lock + wearable backpack verified on World; stations/busy/return copy honest; week card is a content swap. Turns / host / prize bank stay V1+.

When all of §1–§2 are checked, update [v0-scorecard.md](v0-scorecard.md) proof 5 and book the follow-up.
