# Post-demo zoom-out — where we go next

**Date:** 9 Oct 2026  
**Context:** Bay / Creator Success demos proved wearable autopilot + shared show spin. Feedback: UI/UX janky; daily vs weekly layout confusing (expected). No new written Foundation brief yet — this file aligns [roadmap-v0-v4.md](roadmap-v0-v4.md), [v1-progression.md](v1-progression.md), classic Wheel of Fortune rules, and open clones.

Interactive summary: Cursor canvas `post-demo-zoom-out`.

---

## Verdict

**V0’s hard technical proof is done** (pay a wearable; people watch a wheel).  
**The next product proof is readability + Thursday ritual**, then **true turn-style WoF rules** (V2). Do not skip straight to vowels/bankrupt on a confusing floor.

---

## What DCL / Bay have already signaled

From the accepted GDD + Bay V0 contract + Foundation pause note:

| They like | They ask later |
|---|---|
| Two return hooks (daily + Thursday Meetup) | Why is the 3rd Thursday better than the 1st? |
| Social / spectator spin | How does daily build toward something? |
| Thin ops for Rizzle | Not: XP seasons, casino loops, betting |
| Guests still have fun unpaid | Progression that *serves the show* |

Until they send a new brief, **ship along the existing V1→V4 map**. Clarity work is in-bounds even without a new PO.

---

## Classic Wheel of Fortune (rules we are aiming at)

American TV show shape (not casino gacha):

1. **Three contestants**, turns clockwise.
2. On your turn: **spin** (then call a **consonant**), **buy a vowel** (~$250 flat from round bank), or **solve**.
3. Correct consonant → cash × count; **you keep control** (spin / vowel / solve again).
4. Miss letter, wrong solve, **Lose a Turn**, or timeout → next contestant.
5. **Bankrupt** → wipe *this round’s* bank for that player + end turn (prior rounds safe).
6. Solve correctly → bank that round’s winnings; new puzzle / next round.

**Board / electronic ports** (Hasbro instruct PDFs, Milton Bradley) match that core. Video-game ports add UI chrome; the state machine is the same.

### What we have vs that

| TV rule | WIP Wheel today |
|---|---|
| 3 contestants + turn order | Pink pad open; mostly P1 scoring |
| Hit keeps control | Spin → letter; no clear keep/pass |
| Buy vowel | Missing |
| Bankrupt / Lose a Turn | Labels ≠ turn wipe |
| Solve as explicit action | Thin |
| Multi-round house bank | Round $WIP labels only |

---

## Open source worth studying (logic, not art)

Prefer **Turing School “GameTime” WoF clones** — they encode `Game` / `Round` / `Player` / `Wheel` / `Puzzle`:

- https://github.com/b3an5/wheel-of-fortune (+ live demo)
- https://github.com/grimeyg/wheel-of-fortune
- https://github.com/jakelauer27/wheel-of-fortune
- https://github.com/ashtonkbailey/wheel-of-fortune-m2
- https://github.com/mikebrucker/Wheel-Of-Fortune — board UX + “must spin before letter”

**Skip for show rules:** Unity “fortune wheel” gacha assets (spin animation only).

Check licenses before copying assets; **patterns and state charts are the prize**.

Target server shape (sketch):

```text
ShowMatch {
  phase: idle | spinning | awaitingLetter | awaitingAction | solved
  contestants[3]: { wallet, displayName, roundBank, totalBank }
  activeIndex: 0|1|2
  puzzle: { category, answer, revealedMask, calledLetters }
  wheelValue: number | BANKRUPT | LOSE_TURN | …
  lastAction: spin | consonant | vowel | solve | pass
}
```

---

## Most logical next steps (order)

### 1. Spatial / UX clarity (immediate — addresses demo feedback)

**First:** [ui-ux-audit.md](ui-ux-audit.md) honesty pass (daily slice **lies**, stub puzzle, dead ResultText) + [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md).  
**Then:** [station-clarity.md](station-clarity.md) ownership cues.

Root cause closed: **one physical wheel serves both games** (Bay-locked) + broken color grammar + vague show hover + **daily `wheelIndex` landing on SHOUTOUT/FREE SPIN while the sign says TRY AGAIN**. Keep the shared wheel; make it honest before adding chrome.

### 2. Real week card (V1 — cheapest “third Thursday differs”)

Guest / puzzle / hype change each week (`week.ts` / host endpoint). Kill forever-`SURPRISE GUEST`.

### 3. Host contestant ritual (V1 → on-ramp to V2)

Visible “you’re on pad 1” moment (`movePlayerTo` when cheap). Status without contracts. Path to pads 2/3.

### 4. Spectator polish (V1)

Sit on benches; short `VirtualCamera` cut while the wheel slows. Proof 4 for real.

### 5. Turn-state machine (V2 — actual WoF)

Server-authoritative turns, vowels, bankrupt, three banks. Study Turing-style classes; implement in `src/server/` against `ShowState`, do not client-trust turn order.

### 6. Only then V3/V4

Daily “book,” streak flavor, archive, Credits, public prize log — after a Meetup where three players finish a puzzle and the room cares.

---

## Explicit non-goals right now

- Betting / player-funded pools
- Replacing the Meetup with a solo grind
- Fat eth libraries in the scene (autopilot stays lean)
- Full WoF rule parity before the floor reads cleanly
- Waiting forever for a new Foundation PDF when the roadmap already says what to build

---

## Ops remnant from demos

When the uncapped hang is over: set EnvVar `DAILY_WEARABLE_MAX` back to `6` (or delete). Catalog default is already `dailyMax: 6`. Autopilot stays on.
