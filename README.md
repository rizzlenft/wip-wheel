# The WIP Wheel

Weekly game-show studio for [The WIP Meetup](https://thewipmeetup.com), built as a Decentraland SDK7 scene.

Two games, one room. Gold pad: daily chance. Pink pad: Thursday Wheel of Fortune.

**Accepted into Decentraland Creator Success (September 2026).**

**Working doc (read first):** [`design/MASTER.md`](design/MASTER.md)

- GDD (frozen pitch): [`design/gdd.md`](design/gdd.md)
- This week's guest card in the running scene: [`src/week.ts`](src/week.ts)

**World:** `rizzle.dcl.eth` — in Explorer, `/world rizzle.dcl.eth`

## What you can play right now

You spawn as studio audience, facing the puzzle wall. Gold **DAILY** pad stage-right; contestant pads and the wheel stage-left.

- **Gold pad or the DAILY sign — daily chance.** Tap. Small prize flashes on the DAILY sign. Does not turn the wheel. Does not open letters.
- **Pad 1 or the wheel itself — Wheel of Fortune.** Wheel spins, call a letter on the HUD, bank the slice. Jackpot and NFT live here. Pads 2 and 3 are empty chairs for the later three-person show.
- **Title card.** THE WIP WHEEL + Thursdays 12 PM PT.
- **Under the puzzle.** Used-letter board and three contestant scores. Player 1 tracks the round.

Floor plan lives in [`src/layout.ts`](src/layout.ts).

Test scene prizes are labels (`50 $WIP`, `JACKPOT`, `NFT DROP`, …). Nothing leaves a wallet.

## Open in Creator Hub

1. Creator Hub → **Scenes** → **Open Scene**.
2. Choose this folder: `~/Projects/wip-wheel`.
3. Hit **Preview**.

Or from the terminal:

```bash
cd ~/Projects/wip-wheel
npm run start
```

## Preview and publish

Creator Hub → **Open Scene** → this folder → **Preview**. Or `npm run start` from the repo.

Hub's copy of `src/` goes stale. Rsync this `src/` into the Hub scene (or quit Hub fully and reopen) before Preview/Publish. Live World is already `rizzle.dcl.eth`.

```bash
npm run deploy -- --target-content https://worlds-content-server.decentraland.org
```

## Repo layout

```
assets/scene/main.composite   stage, wheel, pads, signs
src/index.ts                  scene entry
src/layout.ts                 floor plan: wheel, pads, signs, board, banner
src/game.ts                   show spin, letters, daily request
src/dailyWall.ts              DAILY sign + gold pad
src/countdown.ts              SHOW sign (countdown, guest, bank) + set dressing
src/week.ts                   live guest / puzzle / clock
design/MASTER.md              working doc (read first)
design/gdd.md                 accepted pitch (frozen)
```

## Brand

The WIP Meetup — weekly web3 metaverse hang since 2019. Thursdays, 12 PM PT. https://thewipmeetup.com
