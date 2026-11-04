# V0 closure checklist — no guesswork

**Date:** 13 Oct 2026 (status 14 Oct)  
**Rule:** Only close items with code or playtest evidence. V1 week card / camera / turns stay parked.

Companion: [MASTER.md](MASTER.md), [pipelines.md](pipelines.md), [ui-ux-audit.md](ui-ux-audit.md), [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md).

**15 Oct post-Meetup verdict:** Daily + show + clarity + guest gate + autopilot + **crowd stress** are proven. Proof 4 is a soft pass (people watched; Explorer ghosts hurt “who”). Remaining V0 gate is **political**: Bay + QA Conditional Pass sign-off — not more spin engineering.

---

## Closed (evidence)

| Item | Evidence |
|---|---|
| Daily miss → slice 7 | `dailyCatalog.ts` |
| Show cream label + `Spin the show` | `studio.ts` / `game.ts` |
| Pads 2/3 + pods `SOON` | honesty P1 publish |
| ResultText dead path | `hideNamed` |
| Daily must not steal show strip | F9 |
| Spin mutex + claimer ACK kick | preview + World smoke 9 Oct |
| Station busy hovers | P1 publish |
| Wearable face / PRIZES say WEARABLE (slice 5) | `wheel-face.png` + `prizes.ts` 13 Oct |
| Show finish cleared `dailySpinning` (cross-talk) | Fixed 13 Oct — `finishShowSpinOnServer` + client anim mutex |
| Late-join daily full-replays last win | Fixed 13 Oct — snap + `LAST DAILY` |
| Wrong Hub folder → fake infinite `$WIP` daily | Fixed 14 Oct — workspace + rename Scenes mirror + `npm run verify:preview-path` |
| Preview day lock + server WEARABLE claim | 14 Oct Preview: `[SERVER] daily claim … WEARABLE` then already claimed |
| LOOK LEFT nag while spinning | Removed 14 Oct — calm `SPINNING` / `DAILY SPIN` |
| Desktop wallet daily TRY AGAIN + day lock + show spin | 14 Oct human smoke |
| Mobile feel (wallet path) | 14 Oct — appeared OK |
| Guest / spectator fake YOU WON + local lock | Code + honesty settle (CHECKING… / claimer-only) |
| World day lock (mobile) | 14 Oct: CHECKING → ALREADY CLAIMED for `0xbd1…dd4df` (wallet already claimed today) |
| Station clarity + come-back + LETTER IN PLAY · OPEN | 14 Oct publish + Preview |
| Guest CONNECT messaging (live World) | 14 Oct playtest — worked as intended |
| **Wearable → backpack (World autopilot)** | 14 Oct: Idol Jacket → `0xd90a…` tx `0x1c3ac02b…` — [fulfill-verify.md](fulfill-verify.md) |
| True-guest CONNECT smoke | Soft-closed via live guest messaging; edge `isGuest` cases still fail-closed |

## Must close before calling V0 “confident”

| Item | Status | How |
|---|---|---|
| Wearable → backpack in World | **Done 14 Oct** | See playtest + [fulfill-verify.md](fulfill-verify.md) |
| Leave/re-enter day lock (World) | Soft-pass | Same wallet → still COME BACK |
| Phone first-frame (3 things) | Soft-pass | MASTER phone checklist once after latest publish |
| Proof 4 Spectator | **Soft pass 15 Oct Meetup** | Crowd watched; ghosts = Explorer — [playtest-15oct-meetup.md](playtest-15oct-meetup.md) |
| Proof 3 Thursday live window | Soft OK / Meetup | Title card + hang happened; refine ritual in V1 week card |
| Bay + QA Conditional Pass sign-off | **Open — next gate** | [bay-qa-checklist.md](bay-qa-checklist.md) |

## Soft (OK for V0 — do not block)

| Item | Notes |
|---|---|
| True guest / no-address sessions | Parked; gate remains for `isGuest` / `no_web3` if DCL still emits them |
| `SHOW_OPEN_ALWAYS` practice show | HUD says practice; title card still THURSDAYS |
| Stub puzzle / `NEXT GUEST · TBA` | V1 week card |
| Crowd chaos / no turns | V2 |
| Credits / crypto weights | Off until Finance |

## Explicitly not V0 (do not “fix” mid-closure)

VirtualCamera, movePlayerTo ritual, 3-contestant turns, vowels/bankrupt, second wheel, letter-pad restyle, public prize log.
