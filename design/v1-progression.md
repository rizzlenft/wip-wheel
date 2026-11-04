# V1 — progression / week ritual (after V0 freeze)

**Superseded 28 Oct 2026.** V0 is paid. The shipping plan is [roadmap-v0-v4.md](roadmap-v0-v4.md) and the next build is [NOW.md](NOW.md). The checklist below is the 14 Oct snapshot. Do not treat “host ritual” or “park the turns” as the current order.

Shipping order: [roadmap-v0-v4.md](roadmap-v0-v4.md). Freeze map: [V0-FREEZE.md](V0-FREEZE.md).

Foundation: concept + social design are strong. Progression is the known hole — **not** solved by touching daily claim again.

**14 Oct evening:** V0 spin/claim **frozen**. Proof 5 backpack **closed** (autopilot on World). Safe prep = Meetup ops + week-card swaps + docs. Do **not** start 3-contestant automation or WoF turns until a Meetup proves the floor.

### V1 checklist vs now

| V1 item (roadmap / this doc) | Status 14 Oct | Next |
|---|---|---|
| Real week card (guest/puzzle swap) | **Ritual shipped** — staging `NEXT GUEST`; late swap via [week-ritual.md](week-ritual.md) | Fill guest 1–2 days out; `npm run check:week` → publish |
| Sit on benches | **Done** | Sightline polish optional |
| Wearable autopilot default | **Done** (in-server EnvVar) | Scale via [fulfill-verify.md](fulfill-verify.md) |
| Host contestant ritual (`movePlayerTo`) | Not started | After Meetup honesty |
| Spectator `VirtualCamera` beat | **Done** (`showCam.ts`, show only) | Preview → one World publish |
| “In the room this week” board | Not started | After presence feels valuable |
| Credits weight > 0 | Off | Finance / studio-operator grant |

### What we can do now (without thawing V0)

| Work | Risk to daily/show | Notes |
|---|---|---|
| Week card content | Low | Swap only between hangs |
| Host runbook + Meetup pin links | None | [demo-tomorrow.md](demo-tomorrow.md) |
| Docs / fulfill verify log | None | [fulfill-verify.md](fulfill-verify.md) |
| VirtualCamera beat (show spin) | Low — additive; cancels on daily | Preview: pad 1 spin → cut → land → letter |
| Audience sightline (`layout.ts`) | Low | After Meetup if seats still clip board |

### What waits (Bay / Meetup / proof)

- Bay + QA sign-off + proof 3–4 crowd ticks  
- `movePlayerTo` contestant ritual, 3-pad automation  
- Vowels / bankrupt / turn machine (V2)  
- Endless random puzzles + Thursday lock switch  
- Any edit to `claimant.ts` / `dailyClaims.ts` / letter-pad layout unless P0 playtest bug

---

## DCL-native paths (use the platform, don't invent a second one)

These are features Decentraland already ships. They fit a game-show / meetup better than a custom meta-game. Ranked by how well they serve the locked V0 proofs and the GDD, not by how shiny they are.

### Serve the show (do these first when we un-pause)

| Capability | Why it belongs here | When |
|---|---|---|
| **`VirtualCamera` + `InputModifier`** | Cut to the wheel while it slows down. Spectating is the product. A 4-second camera beat is closer to Wheel of Fortune than any XP bar. | Next slice, proof 4 |
| **`sittingChair1` on the benches** | Audience seating is already on the floor. Binding the built-in sit emote is the missing "I am watching." | Cheap, next slice |
| **`movePlayerTo` contestant pads** | Host (or a "you're up") moment slides a player onto pad 1/2/3. Three-person show without a new game loop. | With 3 contestants |
| **`VideoPlayer` / `AudioStream`** | Thursday Meetup already happens. A studio monitor playing the live stream (or just the audio) makes the World the set, not a copy of the hang. | When the Meetup has a stable stream URL |
| **`openExternalUrl`** | Banner / daily sign open thewipmeetup.com. One click to the hang that funds the room. | Tiny, whenever |
| **`SkyboxTime` / fixed noon** | Show lighting that doesn't depend on DCL's day cycle. Thursday should always look like showtime. | Polish |

### Persistence and the week card (the actual V0 hole after playtest)

| Capability | Why it belongs here | When |
|---|---|---|
| **`signedFetch` + a tiny host endpoint** | Swap guest / puzzle / hype without republishing. GDD already promised this. `src/week.ts` is the stub. | First real Thursday habit |
| **Wallet-day daily lock** | `getPlayer().userId` + server. Current `DAILY_ONCE_PER_DAY` is client-side and off for the demo. | After we know people return |
| **`NftShape`** | Frame last week's prize NFT or the guest's art on the back wall. OpenSea-backed, no minting. | When a real NFT drop exists |
| **`openNftDialog`** | Let people inspect the drop instead of a label that says `NFT DROP`. | With the NFT |

### Marks, not spreadsheets (progression that isn't homework)

| Capability | Why it belongs here | When |
|---|---|---|
| **Wearable / contestant mark** | GDD later: past contestants wear a thing. Foundation asked for progression; a mark you can see on an avatar is the hang version. | After 3-contestant show exists |
| **`AvatarAttach` halo / badge** | Scene-only mark for "I spun today" that doesn't need a contract. Vanishes when you leave. Good experiment, not a product. | Optional test |
| **Name wall via `signedFetch`** | Automatic "in the room this week" board. Daily feeds Thursday socially. No ops if it's automatic. | If playtest asks for a mark |
| **Portable Experience** | A tiny daily-spin companion you can take to Genesis. Risky: splits the studio. Only if people won't come to the World. | Last resort |

### Already on, don't dilute

Voice chat. Shared `ShowState`. Emotes on win (`clap` / `wave`). Guests with no wallet. Two games, two pads. Portable experiences *permission* is enabled; we are not shipping a PX.

### Explicitly later / Foundation-gated

Real $WIP, betting, public wheel address, season pass, Asset Packs (project constraint), per-frame particles on a flagged phone.

---

## The two questions they asked

1. **Why does someone who has already attended three Thursdays keep returning?**
2. **How can the daily wheel build toward something over time?**

Those are different problems. A weekday habit (daily) is not the same as a reason the third Meetup is better than the first. Do not smash them into one XP bar and call it progression.

---

## Filter (from the acceptance note)

Whatever we pick later has to keep the thing they already like:

- Two coherent return hooks
- **No operational overhead** for Rizzle
- Still a crowd show, not a spreadsheet
- Still fun if you never get paid (guests / empty wallets)

If a progression idea needs Rizzle to log in every morning and feed the machine, or needs a wiki to explain, it is the wrong idea.

---

## What we already have that is not progression

- Daily spin (same table every day, no memory)
- Thursday show (week card live: FRACTILIANS + phrase; still no memory across weeks)
- Countdown
- Called letters + scores on the right wall **this visit**
- Shared spectator spin

None of that knows you were here last week. That is the hole.

---

## Hypotheses to test in V0, not to build in V0

Listen for these during cold drops and the Meetup. Tick what people actually say. Ignore what we wish they said.

### Why the third Thursday?

| Hypothesis | What we would hear | Risk |
|---|---|---|
| **The hang is the product.** The wheel is the ritual in the middle of WIP. They come back for people, the guest, Rizzle. | "I come for the meetup; the wheel is a bonus." | True, and then "game progression" is the wrong lever. Lean into guests, contestant picks, archive. |
| **I might get on the wheel.** Being chosen is the status. Third week = I know how it works and I want a turn. | "When do I get to spin?" | 3-contestant draft (already in GDD V1). Needs a host moment, not a smart contract. |
| **This week's guest / puzzle is different.** Variety is the season. | They look at the right wall for the name. | Requires actually changing the week card. Cheap. Do this even before a progression system. |
| **I want a mark.** Wearable, seat, "past contestant" on a wall. | They ask if they can keep something. | Wearable is later (GDD). A wall of names might be enough and has no mint. |
| **I want the clip.** Spin moments for YouTube / Twitch. | They film, they emote for the camera. | Production, not code. Fits WIP as a show. |

### How daily builds toward something

| Hypothesis | Shape | Risk |
|---|---|---|
| **Stamp toward Thursday.** N daily spins this week = eligible for a show bonus or a contestant hat in the draw. | Daily means something on Thursday without paying tokens. | Must not punish people who only come Thursday. Meetup-first people are the core. |
| **Streak as flavor, not power.** "4 days" on the left wall. Maybe a shoutout. | Light. Visible. | Streaks die when people have jobs. Easy to feel like homework. |
| **In the book.** Daily visitors get their name on a weekday board; Thursday contestants come from the book + the live room. | Daily feeds the show socially. | Host still picks. Good: no extra ops if the board is automatic. Bad: if Rizzle has to curate the book. |
| **Daily chips that spend on Thursday.** | Classic live-ops. | Feels like a casino, needs persistence, excludes guests if it becomes the point. Last resort. |
| **Same daily, better Thursday.** Daily never "builds." It only reminds you the episode is coming. Progression lives entirely in the show (guests, 3 players, house bank). | Matches "no operational overhead." | Foundation asked how daily can build toward something. We should have an answer, even if the answer is "it doesn't, and that's ok." |

---

## Strong default (until playtest says otherwise)

Do **not** pick a system yet. If we had to bet:

1. Change the week card every Thursday (guest, puzzle, hype). That is already promised and currently fake (`SURPRISE GUEST`). It is the cheapest "third week is different."
2. Make contestant selection a visible host ritual at the Meetup (on the way to 3 pads). Status without a contract.
3. Let daily be a habit + a public "in the room this week" board, not a currency.

That trio adds almost no ops: Rizzle already books guests and already hosts. The scene just has to show it.

Revisit after one cold drop and one real Thursday. Replace this default if players tell us something else.

---

## Explicitly not V1 either unless Foundation asks

- Player-funded betting
- Daily that pays real $WIP before the show does
- A season pass with tiers
- Anything that makes the gold pad as long as the pink pad

V1 in the GDD is still the right shape for a complete show: 3 contestants, guest-themed puzzles, house bank with a server, optional public wheel address. Progression should **serve that show**, not replace it.
