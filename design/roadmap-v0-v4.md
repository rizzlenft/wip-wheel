# Roadmap — V0 paid, V1 → V4

**Updated 2 Nov 2026.** V0 is paid. **V1 scope for build + Bay:** [v1-bay-pitch-build.md](v1-bay-pitch-build.md) (4-slice live wheel until Base $WIP; wrong-solve wearable wipe + solve lock; one weekly solve board). This file stays the long-range map; if V1 text here disagrees with the pitch doc, **the pitch doc wins** until Bay replies.

The original pitch stays in [gdd.md](gdd.md). North star: [MASTER.md](MASTER.md). Next build: [NOW.md](NOW.md).

Creator Success funds a vertical slice (V0, $1,000, paid), then a four-week complete playable (V1, $3,100), then later rounds if retention holds (V2, $2,800, then V3). Our V4 is the scale horizon after that. Progression is earned with players, not assumed.

---

## What already exists

Use it. Do not rebuild it.

| Already in the world | Still the old Thursday shape |
|---|---|
| Gold daily, one claim per wallet per UTC day, guests blocked | One phrase for the whole server lifetime |
| Wearable autopilot from the hot wallet | Show wheel is 8 even slices, uniform roll |
| Shared show spin, letter pad, one spin at a time | Solve is “guess every letter” |
| Week card, show camera, sit, named strip, studio shell | Countdown is “next Thursday”, not “next round” |
| Server `Storage` for the daily lock | No roster, no escrow, no boards |

---

## How Decentraland wants this built

- **The server decides.** Phrase, clock, roster, weights, and scores live on the multiplayer server. Clients draw what `ShowState` says. A client never declares a win.
- **One shared board.** The scene is one room. Practice is the room’s puzzle, not a private copy per player. Late joiners read the same card.
- **The clock is server time.** `nextRoundAt` is written by the server and synced. Clients only format it. The gap between rounds starts at two hours and lives in an EnvVar, so it changes from the storage UI without a republish.
- **Storage is a checkpoint, not a live database.** Scores sit in memory during a round. Write `Storage` when a puzzle is solved, a live round ends, or the week rolls. A write on every letter will silently drop. `Storage.set` returns false when it did not persist.
- **Leaderboards match the official pattern.** The server keeps the totals, then syncs a small top-N component the wall renders. Players send “I solved” / “I joined”, never a score. Scene `90,-9` is the reference.
- **Live prizes escrow.** A wearable or a $WIP hit is a pending line on that player. The existing wearable autopilot runs on a **correct solve**, not on the spin. A wearable already sent cannot be taken back. $WIP is a recorded amount until a real transfer path exists. It is not a token send in V1.
- **Practice never pays.** The live table switches on only while the round is open.
- **Credits stay a score.** Weight stays 0. Week leaders are listed for Finance. Playtoearn advertising waits until one grant week actually pays. Bay was explicit: automation is not there yet.
- **The letter pad stays the pad that works.** Solve is one more row on it. A Decentraland text field does not clear like a web input, and focus takes the keyboard. Submit, then remove the field.
- **The wheel face must match the live table** before those labels pay ( **four** slices in pitched V1; fifth **$WIP** when Base hot wallet ships in V2). Weights can be tuned in Storage. Labels on the disc cannot be a lie.
- **Guests play practice.** A live seat and a paying board row require a connected wallet.

A wrong **letter** misses. A wrong **solve** is the wipe, and only that player’s live bank, and only before payout.

---

## V0 — Prove the room (paid)

**Goal:** Enter, understand, spin the daily, watch a show spin, and land at least one real wearable.

Done well enough to get paid: daily lock, guest gate, wearable autopilot, shared wheel, letter pad, Thursday on the title card, Meetup spectator moment (15 Oct, two live pays).

**Keep forever:** gold daily on its own table. Never show `$WIP` on gold. Never let a live round clear the daily lock.

---

## V1 — The complete playable (Bay pitch — Nov 2026)

**Goal:** Practice forever on shared puzzles, countdown to live, three wallets, **four-slice** live wheel, wearable on solve, wrong-solve penalty, weekly solve board, spin + letter cameras.

**Execution checklist and step order:** [v1-bay-pitch-build.md](v1-bay-pitch-build.md). Below is summary only.

Three ships, in order. Each one is playable before the next starts.

### V1a — Practice that does not die

1. A phrase list in the scene. This week’s line is first. Letters and spaces only, three rows of fourteen.
2. The server stores the card index. On solve it waits the current six seconds, then advances. Every client, including a late joiner, draws that card.
3. Solve on the letter pad. The server compares the phrase. Correct fills the board. Wrong closes the window. The next spin is anyone’s.
4. A practice solve adds one to that wallet’s weekly count, written to Storage at the solve, not per letter.

**Exit:** Two clients solve a phrase and both see the next one. Gold still pays only from the daily table.

### V1b — The clock and the live round

1. A big countdown, in the world and on the strip, driven by the server’s `nextRoundAt`. Default gap two hours, EnvVar so the clip can change.
2. When the clock hits, practice pauses. The first three wallets to take a seat are the round. Guests and everyone else watch. Empty seats do not block the round.
3. The live wheel has **four** weighted outcomes until Base $WIP is wired: letter, wearable, lose a turn, bankrupt. Practice spins do not roll this table. **V2:** add $WIP slice + five-slice art + Base send on solve.
4. Wearable sits in that player’s round bank. Lose a turn skips them. Bankrupt zeros their bank. They stay in the round.
5. The solver who is correct keeps the bank. The wearable autopilot runs on solve. A **wrong solve** wipes that player’s pending wearable and **locks them from solving again** until the live round ends. Then the countdown starts again.

**Exit:** A two-client Preview where a wearable is **not** sent on the spin, and **is** sent on the solve. A wrong solve sends nothing.

### V1c — Weekly solve board (pitched scope)

1. Weekly puzzles solved (practice + live), on the wall, synced from the server.

**Exit:** A solve moves the board. Restarting the scene does not zero the week.

**V2 (not pitched V1):** second board (live winners), all-time panels, Base $WIP payout.

**Not in pitched V1:** credit transfers, $WIP token send, four full history panels, host picking contestants.

---

## V2 — The round feels fair, and the boards are the habit

**Goal:** People come back for the next clock without being told to. Retention is the funding argument.

1. Turn order among the three seats so a live round is readable when avatars vanish. Names on the strip, which we already started.
2. Bankrupt and lose-a-turn played in a real hang and tuned.
3. All-time puzzles solved, and all-time winnings, beside the weekly pair. Four panels, as Bay asked.
4. $WIP leaves the “recorded amount” state only if there is a documented transfer. No invented contract.
5. Round length and weights tuned from playtest via EnvVar / Storage, not a code change.

**Exit:** One week of rounds where strangers play practice between them, and at least one live round finishes with an audience.

---

## V3 — The week pays, once the pipe exists

**Goal:** Leaders of the puzzle board and the winner board receive Marketplace Credits, and people play when no live round is on.

1. Week roll writes a grant list: who led, which board, how many credits. A ticket Finance can pay.
2. The scene shows the grant. It does not call a credits API that does not exist.
3. After one week of grants actually arrives, a credits slice can be added to the live wheel, weight still tuned in Storage.
4. Playtoearn listing waits on that same proof. Bay’s condition: if regular credits work, then advertise.

**Exit:** One leaderboard week where the credited players can see the grant, and Finance confirms the send.

---

## V4 — Less babysitting

**Goal:** A month of prizes without sitting on every transfer. The room still reads in three seconds.

1. Public log a player can check: claim id, what was won, tx or credit ticket.
2. Hot-wallet limits, a low-stock alert, a staging sweep.
3. Automated credits only after the Foundation ships the automation Bay said is missing.
4. On-chain proof for a big prize only if compliance asks. No custom game contract before that.
5. A bigger parcel or a portable experience only if people will not come to the world.

**Exit:** Bay or Finance can fund the month from the log. Players still know what to do from the door.

---

## Dropped from the old roadmap

These were the path when Thursday was the only show. They are not the build.

- A host walking one person to pad 1. The live round fills itself, first come, three seats.
- Vowels as their own system. The five outcomes cover a letter, a wipe, and a skipped turn.
- An “in the room this week” name wall. The weekly boards are that memory.
- Thursday as the only moment prizes exist. Thursday stays the meetup on the poster. The game clock is the next round.

---

## Hard rules

- Two prize tables. Daily gold never rolls the live five.
- Practice is open to the room. Live seats are wallets, max three.
- Fulfill a live wearable on the solve, never on the landing.
- A wrong letter is a miss. A wrong solve wipes that player’s unpaid round bank.
- No betting, and no player-funded pool.
- Do not republish during a live round.
- Do not write Storage on every guess.
