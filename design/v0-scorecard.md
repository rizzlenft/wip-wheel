# V0 scorecard — Bay / Creator Success

Track against MASTER’s five proofs. Update after each preview / publish / Meetup.

| # | Proof | Built | Previewed | Published | Pass notes |
|---|---|---|---|---|---|
| 1 | **Enter** — phone + desktop land in studio; room reads in ~3s | Yes | **Yes 14 Oct** | **Yes** | Desktop + mobile OK |
| 2 | **Daily** — one spin / wallet / UTC day; physical wheel; server picks prize | Yes | **Yes 14 Oct** | **Yes** | World: CHECKING → ALREADY CLAIMED. Guest-only path parked. |
| 3 | **Thursday** — 12 PM PT is the main event; gold is not the show | Yes | Soft | Soft | Week card live (FRACTILIANS); still needs live Meetup window |
| 4 | **Spectator** — Meetup watches the wheel slow together | Yes (set) | **Show path OK** | **Partial 15 Oct** | Crowd watched wheel/daily; desktop invisible peers hurt “who’s spinning” (Explorer) — [playtest-15oct-meetup.md](playtest-15oct-meetup.md) |
| 5 | **Real rewards** — wearables winnable; autopilot from hot wallet | Yes | Soft | **Yes 14–15 Oct** | Solo + Meetup: 2 hang wins autopilot (`0x1def…`, `0x7975…`); see playtest |

## Exceed bar (not required, already in build)

| Extra | Status |
|---|---|
| Honest wearables copy (sign, HUD, hover, wheel face) | Done |
| Meetup link in-world (`openExternalUrl` → thewipmeetup.com) | Done |
| Discoverability tags (`game`, `social`, `meetup`, `prizes`, `wearables`) | Done |
| Strong World description (daily + Thursday Meetup) | Done |
| Ops path without new hosting accounts (Option A) | Done — [SHIP.md](SHIP.md) |
| In-server wearable autopilot (EnvVar hot key) | Code restored — smoke: spin → WEARABLE → backpack |
| Credits rail reserved, weight 0 until Finance | Done |

## Publish gate

1. [x] Hot treasury stocked + EnvVars (`FULFILLER_PRIVATE_KEY`, `PRIZE_TREASURY`)
2. [x] Publish in-server autopilot restore (lean `micro-eth-signer`, ~+199KB) — 7 Oct evening
3. [x] Smoke: wallet spin → WEARABLE → NFT in backpack; second spin blocked (14 Oct World — playtest + tx `0x1c3ac02b…`)
4. [x] Desktop + phone enter / daily feel (14 Oct) — optional re-check after any publish
5. [x] EnvVar assumed set (UI write-only). Confirm backpack after a WEARABLE land.

## Marketing checklist (Rizzle / Meetup)

- [ ] Tweet / Discord / Meetup agenda: `/goto rizzle.dcl.eth` + play link
- [ ] Pin World link in WIP Meetup chat the morning of show
- [ ] Host opens World ~15 min early to wake the Multiplayer Server (see [demo-tomorrow.md](demo-tomorrow.md))
- [ ] Say out loud once: gold pad = daily wearable chance; pad 1 = show spin
- [ ] After first wearable win: shout the winner in-room (spectator moment)

Hand-off link: https://decentraland.org/play/?realm=rizzle.dcl.eth  
World: `rizzle.dcl.eth`
