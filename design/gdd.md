# The WIP Wheel

Game Design Document for Decentraland Creator Success  
Working title: **The WIP Wheel**  
Creator: **Rizzle** (host of [The WIP Meetup](https://thewipmeetup.com))  
Scene: this repository  
Status: application test scene — daily chance game + Thursday Wheel of Fortune show

---

## 1. What this game is

The WIP Wheel is a live studio built for **The WIP Meetup**, the weekly web3 metaverse hang I have run since 2019. We already gather builders, creators, and artists every Thursday at 12 PM PT, and we already visit Decentraland as part of that circuit. This scene is the set: two games, one room, a reason to drop in on a weekday and a reason to show up on Thursday.

They are not the same game.

- **Daily spin (left wall, gold pad).** A one-shot game of chance. Anyone logged into Decentraland can take a spin for a small prize. The result flashes on the left jumbotron. It does not turn the wheel. It does not open the letter board. Jackpot and NFT stay off this table.
- **Wheel of Fortune (center board, pink pad).** The Thursday live show. Contestant stands on the pink pad, the wheel spins, they call a letter, the cream puzzle board pays the slice into the round bank. Jackpot, NFT, and heavy $WIP live here. The right wall is the show board: countdown to Thursday 12 PM PT, this week's guest, prize hype, the letters already called, last contestant scores, and the round bank.

This is not a casino you wander into to extract tokens. It is a weekly appointment with a daily reason to come back.

## 2. Why this belongs in Decentraland

Decentraland is a shared 3D room. People walk in, see each other, and talk. A wheel is a terrible single-player game and a great crowd game. The fun is not the math of the slice. The fun is standing next to other avatars when the wheel slows down.

The WIP Meetup already has the hard part: a reason for people to show up on a schedule. The show gives that room a center of gravity. The daily spin keeps the World from going dark for six days.

## 3. Player fantasy, in one sentence

You walk into a lit game-show studio whose left wall will pay you a small prize today, and whose center board is counting down to Thursday 12 PM PT, when the real wheel, the guest, and the jackpot come on.

## 4. Core loop

**Between-show loop (why you come back tomorrow)**

1. Drop into the World any day.
2. See the show wall counting down to Thursday 12 PM PT, plus this week's guest, called letters, and live scores.
3. Stand on the **gold pad**. One daily chance spin. Small prizes flash on the left wall.
4. Leave knowing the live show is on a clock you can see.

**Live-show loop (the hype moment)**

1. Arrive for The WIP Meetup (Thursday, 12 PM PT). The show wall flips to **LIVE**.
2. See this week's guest and this week's puzzle on the cream board.
3. A contestant stands on the **pink pad**. The whole room watches the wheel stop.
4. Call a letter. Hits bank the slice. Miss, spin again. Solve the phrase. The right wall lights called letters and posts who spun what.
5. Hang out, talk to the guest, come back next week because the board, the guest, and the slices will be different.

The question Creator Success asks is: *why will somebody come back and play this again tomorrow?*

Answer: because the daily spin is a one-play habit, the countdown makes Thursday feel like an event, and The WIP Meetup is already a weekly appointment.

## 5. Social play

Other players make this better in ways a solo wheel cannot:

- **Spectating is play.** The show spin is slow on purpose. People emote, voice chat, and pile onto the stage.
- **The countdown is public.** Everyone in the room is watching the same clock to the same guest.
- **Contestants come from the live audience.** V1 format: I pick 3 attendees from that week's meetup.
- **The guest is a character.** Puzzle text and prize hype are themed to that week's speaker (`src/week.json`).
- **Host presence.** I am in the room. That is the WIP Meetup model. The game is designed around a host, not around an empty slot machine.

What we are testing first: do strangers stop walking, take a daily spin on the gold pad, and can they tell the pink pad is Thursday's show.

## 6. What the test scene proves

This repository is the **application test scene**, not a live-payout casino. It is small on purpose.

It already has:

- Two distinct stations: gold **DAILY** pad → left jumbotron; pink **SHOW** pad → physical wheel + letter board
- Daily chance table (5 / 10 / 25 / 50 $WIP, shoutout, bonus, miss) that never opens the puzzle
- Show wheel with $WIP / NFT / jackpot / shoutout slices and a cream letter-reveal board
- A live show board on the right wall: countdown to next Thursday 12 PM PT, guest/prize hype, called-letter grid, last spin scores, round bank
- Guest / prize / puzzle card in `src/week.json` (no spin-code edits to change the week)
- Shared show spin (late joiners see the last result; everyone watches the same wheel)
- Audio on click / spin / win / miss
- Audience benches and a live room

It does **not** pay real $WIP. That is intentional. Creator Success asked us not to build the vertical slice before funding, and real token payouts need an authoritative server plus a contract. The slices are labeled for the fantasy. The two loops and the countdown are real.

Daily one-per-day lock is off in this build so reviewers can try it indefinitely. Flip `DAILY_ONCE_PER_DAY` on before a public World.

## 7. Progression of the product

### Now — application test scene
Daily chance + Thursday show + countdown + letter board. Show spins stay available any day so reviewers can try the wheel. Daily claim is unlimited in this build. Guest, hype, and puzzle live in `src/week.json`.

### Funded V0 — the $1,000 slice
What we would agree after selection, measured with actual WIP Meetup attendees:

- Persist the daily spin by wallet / day (not just this visit).
- Load `src/week.json` (or a tiny host endpoint) so I can swap guest, hype, and puzzle before Thursday without a client rebuild.
- Keep the countdown and live-window flip as the hype instrument.
- Playtest one real Thursday: time-to-first-daily, time-to-first-show-spin, how many people are in the scene when the wheel stops, whether they come back the next day, whether they come back the following Thursday.

Host lock (only the pink pad / host can spin the show wheel during the live window) is in this slice if we still have room after the retention loop is solid.

### V1 — first complete playable show
- 3 contestants picked from the live meetup.
- Guest-themed puzzles every week.
- House bank of $WIP and optional NFTs, paid after the spin by a server-authoritative contract. Guests without wallets still get the in-scene prize.
- Public **wheel address** so a guest speaker can load $WIP or an NFT onto a slice before the show. Not in V0.

### Later
- Daily streak rewards.
- Clip-able spin moments for the WIP YouTube / Twitch archive.
- Wearable that marks past contestants.

## 8. Prizes (daily vs live vs later)

| | Daily chance (left wall) | Thursday show (wheel) | After V1 |
|---|---|---|---|
| Small $WIP | 5 / 10 / 25 / 50 labels | 50 / 100 / 250 labels | Paid from the house $WIP bank |
| JACKPOT | Not on the daily table | 1000 $WIP label | Whatever the host or guest loaded that week |
| NFT DROP | Not on the daily table | NFT label | Wearable or guest NFT |
| SHOUTOUT | Flashed on the left wall | Announced in-world | Host reads it on the live meetup |
| BONUS / FREE SPIN | Extra daily spin | Extra show spin | Extra spin for that contestant |
| TRY AGAIN | Flavor miss | Flavor miss | Flavor miss — still a moment |

Freemium on purpose. Most people in Decentraland are guests or have empty wallets. If the only way to enjoy the room is to receive crypto, we exclude the room. The show has to be fun if you never get paid.

## 9. Onboarding (30-second test)

A new player should understand the first action without a tutorial:

1. They spawn facing the studio. The right wall already counts down to Thursday and will fill with called letters and scores once the show starts. The left wall says **DAILY**. The cream board is the Wheel of Fortune puzzle.
2. Gold pad on the left: daily prize. Pink pad by the wheel: the show.
3. Daily: prize flashes on the left wall. Show: wheel moves, then they call a letter.

If that fails in playtest, the pads are too small or the camera target is wrong — not the design of the loop.

## 10. Platforms and Decentraland constraints

Desktop and mobile. Each game starts from its own podium pointer tap. No keyboard required; show letters are a HUD pad.

Built against how Decentraland actually works:

- **Drop-in / drop-out.** There is no start screen and no game over. You can walk in mid-show-spin and still see the result.
- **Shared room.** The show spin is synced. Late joiners snap to the last result. Spectating is the default mode.
- **Guests are first-class.** Most players have no wallet. The test scene never asks for a transaction. $WIP payouts stay behind funding.
- **Voice stays on.** The weekly meetup is a conversation with a studio in the middle of it.
- **Two games.** The gold pad never drives the wheel. The pink pad never drives the daily jumbotron.

## 10b. What this test scene is measuring

1. A stranger understands gold pad vs pink pad within 30 seconds.
2. They can tell Thursday is the event (countdown + guest hype + the actual wheel).
3. There is a reason to come back tomorrow that is not “hope you wander in.”
4. Other avatars make the show spin better (shared result, benches to watch from).

## 11. Scope we are refusing for V0

- No real token transfers
- No betting, no player-funded house edge
- No smart-contract wheel address yet
- No 3-contestant live draft yet
- No anti-cheat server yet (daily claim is client-side in this test scene)

Those are the pieces later funding is for. V0 is the retention loop: daily chance, countdown, Thursday show, playtest.

## 12. Why this has a shot at retention

Most Decentraland games hope people wander back. We already have a weekly show with a few thousand members, a Thursday slot, guests, and a habit of meeting in the metaverse. The daily spin is the weekday habit. The countdown is the billboard. Thursday is the episode.

If the wheel is fun in a room of people, we have a live show. If the daily drop is not enough reason to return, we will know after one week of playtest, which is exactly what V0 is for.
