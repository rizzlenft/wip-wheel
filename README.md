# The WIP Wheel

Weekly game-show studio for [The WIP Meetup](https://thewipmeetup.com), built as a Decentraland SDK7 scene.

This repo is the **Creator Success application package**: a Game Design Document plus a playable test scene. Two games, one room.

- GDD: [`design/gdd.md`](design/gdd.md) (PDF: [`design/The-WIP-Wheel-GDD.pdf`](design/The-WIP-Wheel-GDD.pdf))
- How to apply: [`design/apply.md`](design/apply.md)
- This week's guest card: [`src/week.json`](src/week.json)

## What you can play right now

Walk in facing the studio.

- **Gold pad, left wall — daily chance.** One spin. Small prize flashes on the left jumbotron. Does not turn the wheel. Does not open letters.
- **Pink pad, center — Wheel of Fortune.** Thursday live show. Wheel spins, call a letter, bank the slice. Jackpot and NFT live here.
- **Right wall — show board.** Countdown to Thursday 12 PM PT, guest/prize hype, called letters, contestant scores, round bank.

Test scene prizes are labels (`50 $WIP`, `JACKPOT`, `NFT DROP`, …). Nothing leaves a wallet. Daily one-per-day lock is off so reviewers can try it.

## Open in Creator Hub

1. Creator Hub → **Scenes** → **Open Scene**.
2. Choose this folder: `~/Projects/wip-wheel`.
3. Hit **Preview**.

Or from the terminal:

```bash
cd ~/Projects/wip-wheel
npm run start
```

## Publish to a World (needed for the application)

You need a wallet that owns a Decentraland NAME or an ENS name.

1. Open the scene in Creator Hub.
2. **Publish** → **Publish to World** → pick your NAME.
3. Paste the World name into the application form (section 3.3).

CLI equivalent, after you set `worldConfiguration.name` in `scene.json`:

```bash
npm run deploy -- --target-content https://worlds-content-server.decentraland.org
```

## Repo layout

```
assets/scene/main.composite   stage, wheel, pads, signs
assets/Images/                wheel face + WIP logo
src/index.ts                  scene entry
src/game.ts                   show spin, letters, daily request
src/week.json                 this week's guest, hype, puzzle
src/countdown.ts              right-wall show board
src/dailyWall.ts              left-wall daily jumbotron
src/prizes.ts                 show table + daily table
design/gdd.md                 game design document
```

## Brand

The WIP Meetup — weekly web3 metaverse hang since 2019. Thursdays, 12 PM PT. https://thewipmeetup.com
