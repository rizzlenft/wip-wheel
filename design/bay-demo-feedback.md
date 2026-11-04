# Bay Creator Success demo — feedback digest vs now

**Sources:** last-week playtest transcript (Virginia, Dafne, Nico, Swiss, Matt, Tom, Bay) + AI summary + Bay TLDR image (14 Oct).  
**Companion:** [MASTER.md](MASTER.md), [ui-ux-audit.md](ui-ux-audit.md), [station-clarity.md](station-clarity.md), [v1-progression.md](v1-progression.md), [V0-FREEZE.md](V0-FREEZE.md).

Bay TLDR: *almost there for V0 — basic UI so visitors know what to do, and that they should come back tomorrow for another reward.*

---

## Verdict

Backend / multiplayer / daily lock / shared wheel were the right V0 bet (and the room proves it). The playtest’s pain was almost entirely **orientation, ownership, and return copy** — not “does the wheel spin.” That matches Bay’s TLDR and our own [ui-ux-audit](ui-ux-audit.md) / [station-clarity](station-clarity.md) parking lot.

We have closed a lot of *mechanics* feedback since that demo. The **open V0 gap** is still: first 10 seconds + “come back tomorrow” + who is allowed to act during a show spin.

---

## Feedback → status (then vs now)

| Theme (who said it) | Then | Now (14 Oct) | Bucket |
|---|---|---|---|
| Multiplayer spin + letter pad appears for others (Rizzle goal) | Working, chaotic | Still works; mutex / pipelines hardened | **Done enough for V0** |
| Daily one-per-day + hot wallet (Rizzle / Matt) | Worked for Rizzle alone; multiplayer fulfill flaky | Day lock World-proven; autopilot EnvVar; guest gate closed | **Done** (backpack smoke still on scorecard) |
| Free-for-all letters / pad disappears / who clicked? (Virginia, Dafne, Nico, Tom) | Everyone spam-spins; pad vanishes | Still free-for-all by design until V2 turns | **V2** — do not fake mid-V0 |
| No instructions / step list (Dafne, Swiss, Matt) | Spawn unclear for cold users | Spawn grammar + HUD strip + verbs; still no “1→2→3” coach | **Open V0 UI** (Bay TLDR) |
| Am I spinning or is someone else? (Matt, Nico) | No ownership cue | Shared wheel + mutex; still weak “whose spin” feedback | **Open V0 / soft V1** |
| Daily pad hard to find; show spin blocks daily (Bay, Matt) | Gold unclear; continuous show blocked gold | Gold column clearer; hover verbs; still shared-wheel busy | **Mostly improved**; busy copy honesty better |
| Pads 2/3 / “bed” look playable (Tom) | Looked like seats | `SOON` placeholders | **Soft clutter** — station-clarity |
| Prize labels on wheel = real? (Tom) | Placeholder flavor | Same; daily vs show tables separated in code | **Honesty** — don’t claim prizes that aren’t wired |
| Atmosphere / sounds / “legs” (Nico, Swiss, Tom) | Liked | Sit benches work; studio read stronger | **Keep** |
| Zones / tribüne / host / prize belt (Swiss, Tom) | Missing | Audience sit done; no host ritual / prize showcase | **V1+** |
| Solo puzzle between Meetups (Bay) | Idea only | Week card / endless puzzles partly there | **V1** |
| Cooldown so one user can’t hog (Virginia / chat) | Needed | Show mutex helps; no per-user show cooldown | **V1/V2** |
| Letter highlight “you selected X” (Virginia, Nico) | Missing | Still missing | **V1 polish** (safe if it doesn’t rewrite pad layout) |
| FPS ~40 (Dafne) | Acceptable | Still watch entity count | **Monitor** |

---

## Bay TLDR mapped to concrete V0 UI (safe under freeze)

Do **not** thaw claim / show spin / letter-pad layout. Prefer copy + dress + hover:

1. **Know what to do in ~3s** — spawn frame already has title / Thursday / gold. Add or tighten one line that says the two games: gold = daily wearable chance (once / day); magenta = show spin. Host still says it out loud ([v0-scorecard](v0-scorecard.md) marketing checklist).
2. **Come back tomorrow** — after daily claim / TRY AGAIN / ALREADY CLAIMED, sign + hover must say **COME BACK TOMORROW** (or equivalent), not dead “already claimed” only. Aligns with Bay retention ask.
3. **Don’t lie about the free-for-all** — until V2 turns, HUD/hover can admit “open spin” rather than looking broken when the letter pad blips away.
4. **Leave V2 for V2** — turn structure, contestant pods, lineup, pay-to-play high roller = [v1-progression](v1-progression.md) / roadmap, not this freeze window.

---

## What we should *not* relearn from this transcript

- Spending another week on wheel↔board sync or daily lock “because UI felt broken” — those were solid; chaos was social rules + feedback.
- Building 3-contestant automation to fix “Matt was lost” — MASTER: not V0.
- Adding more billboards — MASTER: pads + hover + spawn camera.

---

## Ready for Bay’s next-step doc

When her doc lands, score each ask against:

| Filter | Rule |
|---|---|
| V0 UI / return copy | Prefer — matches her TLDR + freeze-safe lanes |
| V1 spectator / week ritual / sit | OK if additive |
| V2 turns / vowels / contestant lock | Park — say so explicitly |
| Touches frozen spin/claim | Require P0 playtest bug + regression checklist |

Update this file with a “Bay next-step → accepted / parked” table when that doc arrives.
