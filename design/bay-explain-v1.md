# Explaining V1 asks to Bay (simple + DCL-backed)

Use this when her eval asks for something that isn’t practical **right now**. Goal: same outcome she wants, honest sequencing, platform-native path.

**Her V0 bar we agree with:** cold player can finish the **daily** without a guide.  
**Her V1 list we agree with in spirit:** turns, host, prize bank, stage, more puzzles, contracts — after that bar.

Docs / skills we lean on: [Authoritative servers](https://docs.decentraland.org/creator/scenes-sdk7/networking/authoritative-servers.md), [Serverless multiplayer](https://docs.decentraland.org/creator/scenes-sdk7/networking/serverless-multiplayer.md), [Move the player](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/avatars/move-player.md), [Camera / VirtualCamera](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/camera.md), [Smart items / seats](https://docs.decentraland.org/creator/scene-editor/interactivity/smart-items.md), sdk-skills `multiplayer-sync`, `authoritative-server`, `npcs`, `camera-control`.

---

## How to say it (one pattern)

1. **What you’re aiming at** (her goal in one line)  
2. **Why not this week** (risk / missing foundation / wrong layer)  
3. **What we do instead for V0** (same goal, smaller)  
4. **How we build toward it in V1** (named DCL tool)

---

## Item-by-item

### 1. Three-contestant format + turn rotation

| | |
|---|---|
| **She’s aiming at** | Fair show: not a free-for-all; clear whose turn |
| **Why not now** | Needs **server-owned turn state** (who may spin / call letters). That’s a second game loop on the same wheel we just froze. Doing it half-way recreates the playtest chaos with more code. DCL: turn authority belongs on the [Multiplayer Server](https://docs.decentraland.org/creator/scenes-sdk7/networking/authoritative-servers.md) (`registerMessages` + `syncEntity`), not client spam. |
| **Instead (V0)** | One physical wheel **mutex** (already) + busy copy (“wheel in play — watch”). Daily stays open when show isn’t spinning. |
| **Toward V1→V2** | Host picks pad 1 → later pads 2–3 with **server turn index**. GDD already says contestants from the Meetup. |

**One liner for Bay:** *“Turns need an authoritative ‘whose turn’ flag; for V0 we’ll make busy state obvious. Full three-player rotation is the show product after sign-off.”*

---

### 2. “Prevent players disrupting each other” / letter pad vanishing

| | |
|---|---|
| **She’s aiming at** | My click shouldn’t cancel yours |
| **Why not now** | Same as turns. Her eval §4 already says turn management isn’t required for V0. Enforcing “only you may click letters” **is** turns. |
| **Instead (V0)** | Honest copy when free-for-all: practice show / open spin. Busy hover while mutex held. |
| **Toward V1** | Server: `currentActor` wallet; letter pad only interactive for that wallet ([authoritative servers](https://docs.decentraland.org/creator/scenes-sdk7/networking/authoritative-servers.md)). |

**One liner:** *“Stopping disrupt = turn lock. V0 = clear busy feedback; V1 = server-owned actor.”*

---

### 3. “Show who is spinning / who selected a letter”

| | |
|---|---|
| **She’s aiming at** | Social readability |
| **Why not full now** | Highlighting *your* key vs *theirs* on the letter pad means pad/UI work we froze after the 7 Oct break. Safe without thawing: one HUD line. |
| **Instead (V0)** | Strip / sign: `SPIN · RIZZLE` / `LETTER IN PLAY` from existing show state if cheap. |
| **Toward V1** | Sync a small `lastActor` / `lastLetter` on the auth server; optional key flash later. |

**One liner:** *“We’ll name the actor on the strip first; fancy letter highlights after the pad stays stable.”*

---

### 4. Full host controls + contestant selection

| | |
|---|---|
| **She’s aiming at** | You run the show like WoF |
| **Why not now** | Host UI + permissions + selection UX on top of unclear stations = more confusion before cold daily works. |
| **Instead (V0)** | **You** are the host in voice (Meetup model). Script: say gold vs pink once. |
| **Toward V1** | Host click → [`movePlayerTo`](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/avatars/move-player.md) onto pad 1 (DCL Restricted Action). Optional later: NPC host ([NPC toolkit](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/avatars/npc-avatars) / `dcl-npc-toolkit`) for “next contestant” lines — not required for ritual. |

**One liner:** *“Host controls are V1; V0 host is you in the room plus clear pads.”*

---

### 5. Prize banking + automated live-show payouts

| | |
|---|---|
| **She’s aiming at** | Show wins feel real |
| **Why not now** | Daily wearable path is the funded V0 proof. Show bank + auto payout duplicates treasury ops before daily backpack smoke is closed. |
| **Instead (V0)** | Show slices can stay labels / shoutouts; daily WEARABLE autopilot is the real money path. |
| **Toward V1–V2** | Same pattern as daily: server queue + fulfill ([rewards-architecture](rewards-architecture.md)). No new Solidity for V1. |

**One liner:** *“Bank the show after daily delivery is boring and reliable — same fulfill pipeline, second table.”*

---

### 6. Expanded stage / animated hosts

| | |
|---|---|
| **She’s aiming at** | TV-studio feel |
| **Why not now** | Entity/budget + art pass; doesn’t fix “where do I click.” Playtest said atmosphere was already OK. |
| **Instead (V0)** | Clarity copy + gold/pink grammar. Sit benches already give audience presence ([Seat.ts](https://github.com/decentraland/creator-hub/blob/main/packages/asset-packs/packs/smart_items/assets/classic_bench/Seat.ts) pattern). |
| **Toward V1** | Short [`VirtualCamera`](https://docs.decentraland.org/creator/scenes-sdk7/3d-content-essentials/camera.md) cut while the wheel slows (spectator beat). Art GLBs later — not blocking. |

**One liner:** *“Camera beat + sit first; big stage art after the show ritual works.”*

---

### 7. More puzzles / replay between Thursdays

| | |
|---|---|
| **She’s aiming at** | Stay after daily; retention |
| **Why not “endless show” now** | Open free-for-all puzzles without turns = more of the playtest chaos. Week card already swaps guest/puzzle via `week.ts` (no rebuild). |
| **Instead (V0)** | Prove week swap in QA; daily return copy (“come back tomorrow”). |
| **Toward V1** | Solo or host-gated puzzle after daily; pool of phrases. Her idea stays — sequenced after clarity. |

**One liner:** *“Love between-show puzzles — after stations are obvious and turns aren’t chaos.”*

---

### 8. Advanced rewards / smart contracts

| | |
|---|---|
| **She’s aiming at** | Trust + scale |
| **Why not now** | Creator Success V0 trust model is **server Storage + hot wallet**, not custom contracts (MASTER / GDD). Contracts add audit surface without fixing onboarding. |
| **Instead (V0)** | Verify EnvVar autopilot → backpack. |
| **Toward later** | Only if Foundation/Finance requires it; not V1 blocker. |

**One liner:** *“No custom contracts for V1; harden the hot-wallet path we already have.”*

---

## V0 prep vs V1 direction (one picture)

```text
Bay wants: people get it + come back + fair show

V0 (before Bay+QA sign-off)
  • Gold vs pink + how-to + come back tomorrow
  • Busy “watch the wheel” (not turn locks)
  • 2-wallet backpack smoke
  • Demo week.ts content swap + Thursday on title card

V1 (after Conditional Pass clears)
  • movePlayerTo contestant ritual
  • VirtualCamera spectator beat
  • Optional HUD “RIZZLE is spinning”
  • Between-show puzzle (gated)
  • Show fulfill queue (same as daily)

V2
  • Server turn index · pads 1–2–3 · letter ownership
```

---

## Short DM block (if she asks why something waits)

> For anything that needs “only this player may act,” DCL’s pattern is **authoritative server state** (syncEntity / messages), not more client UI. That’s why turns and disrupt-locks wait until after V0 clarity + daily backpack proof. Closest V0 stand-in is **busy feedback + the mutex we already have**. V1 we start with **movePlayerTo + VirtualCamera** (both first-party SDK) toward the show ritual, then full turns.
