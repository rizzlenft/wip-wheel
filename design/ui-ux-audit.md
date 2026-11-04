# UI/UX audit — freeze before we add

**Date:** 9 Oct 2026  
**Why:** Demos worked; feedback said janky/confusing. Before station-clarity *adds* cues, inventory what is already wrong, dead, or lying — and lock change safeguards so we do not repeat the 7 Oct breakages.

**Related:** [station-clarity.md](station-clarity.md) (next build pass), [learnings.md](learnings.md), [MASTER.md](MASTER.md), [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md).

**Nov 2026 (post-audit):** Main show wheel is always 4-slice Bay art — [show-wheel.md](show-wheel.md). Rows below that mention 8-slice `$WIP` on the stage wheel are **historical** unless marked updated.

---

## Method

Walked every player-facing surface in code (not Hub guesswork):

- 3D dress: `studio.ts`, `dailyWall.ts`, `countdown.ts`, `board.ts`, `scoreboard.ts`, `game.ts`
- HUD: `ui.tsx` + `hudCopy()` / `puzzleHud()`
- Hover/proximity: `interact.ts` binds
- Copy sources: `week.ts`, `prizes.ts`, `shared/dailyCatalog.ts`
- Spawn: `scene.json` + `layout.ts`

Severity:

| Tag | Meaning |
|---|---|
| **LIE** | What you see disagrees with what the server did |
| **CONFUSE** | Two true messages fight each other |
| **DEAD** | Present but invisible / unused |
| **CLUTTER** | Takes attention without helping the next action |
| **OK** | Keep; do not “improve” without a playtest reason |

---

## 1. Surface inventory

### A. First frame (spawn)

| Surface | What it shows | Status |
|---|---|---|
| Title card | THE WIP WHEEL · THURSDAYS 12 PM PT | **OK** — proof 3 |
| Puzzle board | Category + `WORK IN PROGRESS` tiles | **CLUTTER** — forever stub puzzle |
| Score strip | Letters + play line + 3 pods | **CONFUSE** — see §2 |
| Wheel stage-left | `wheel-face-live-4.png` (LETTER / WEARABLE / LOSE TURN / BANKRUPT) | **OK** for show — [show-wheel.md](show-wheel.md). Gold daily still uses its own cabinet disc |
| Pad 1 | Magenta disc + gold `SHOW SPIN` | **CONFUSE** — color grammar |
| Pads 2–3 | Dim + `2` / `3` + COMING SOON pods | **CLUTTER** |
| Gold pad + DAILY SPIN sign | WIN A WEARABLE / one per wallet | **OK** (daily column) |
| Meetup text | THE WIP MEETUP (clickable) | **OK** |
| Audience label | STUDIO AUDIENCE | **OK** / low priority |
| Objective HUD strip | Rotating status (daily / show open / live) | **CONFUSE** — see copy list |
| Letter pad | Only when `canGuess` | **OK** — do not restyle |

### B. Interactions

| Control | Hover | Does |
|---|---|---|
| Gold pad + daily sign | `Spin the daily` | Daily claim → shared wheel | **OK** verb |
| Pad 1 hit + wheel face | `Spin the wheel` | Show spin → letters | **CONFUSE** verb |
| Meetup line | `Open The WIP Meetup` | External URL | **OK** |
| Pads 2–3 | (none) | Physics only | **OK** if captions stop looking playable |

### C. Hidden / vestigial

| Thing | Status |
|---|---|
| Hub `ResultText` | **DEAD** — `styleResultSign` scales to `0.01` |
| Hub `HostPad` / `HostLabel` / `Seat1*` | **DEAD** — hidden in `studio.ts` |
| Hub Banner / Wings / Ticker / CrowdText / Bezels | **DEAD** — hidden in `countdown.ts` |
| `rewardsClient.ts` daily API path | Legacy; live path is auth-server | Don’t revive in UI |
| `DAILY_ONCE_PER_DAY` in `daily.ts` | Client flag **off**; real lock is server | Don’t trust client flag for copy |

---

## 2. Highest-severity findings (fix or remove before adding chrome)

### F1 — **LIE: Daily miss lands on the wrong wheel slice** (critical)

Server daily catalog (`dailyCatalog.ts`):

| Prize | `wheelIndex` | Face label on `wheel-face.png` / `PRIZES[]` |
|---|---|---|
| TRY AGAIN | **7** | TRY AGAIN — OK |
| TRY AGAIN (b) | **1** | **SHOUTOUT** — LIE |
| TRY AGAIN (c) | **3** | **FREE SPIN** — LIE |
| WEARABLE | **5** | **WEARABLE** — fixed 13 Oct (face + `PRIZES` label) |

Animation aims the pointer at `wheelIndex` (`startWheelAnim`), then the daily sign shows the **server label**. Players watch the wheel stop on SHOUTOUT and get TRY AGAIN on the sign. That alone can explain “janky / unintuitive.”

**Fix direction (pick one, do not invent a third mid-build):**

1. **Map all daily misses to index 7** (and wearable to a slice that says WEARABLE — may need face art), or  
2. **Retarget face art** so indices 1/3/5 literally say TRY AGAIN / WEARABLE for the daily-facing story, or  
3. **Separate daily visual** (rejected for now by Bay physical-wheel lock — only if F1 cannot be fixed by 1–2).

Prefer **(1)** for code-only: weight can stay; force `wheelIndex: 7` for all try-again rows; change wearable index only if we update face art to WEARABLE.

### F2 — **CONFUSE: Show pad label is gold**

`SHOW SPIN` uses `LOOK.gold` while the disc is magenta (`studio.ts`). Gold = daily everywhere else. Fix: cream/magenta label (station-clarity D2).

### F3 — **CONFUSE: Hover `Spin the wheel`**

Same physical wheel daily just used. Fix: `Spin the show` (station-clarity D3).

### F4 — **CONFUSE: Stub week card still on the set**

`SURPRISE GUEST` · `WORK IN PROGRESS` · prize hype about wearables. Reads as broken content, not “coming Thursday.” Either hide guest line until real, or ship a real week card (V1) — do not leave forever-stub as hero puzzle.

### F5 — **CONFUSE: Show always open vs Thursday branding**

`SHOW_OPEN_ALWAYS = true` → HUD `SHOW WHEEL OPEN · SPIN AT PAD 1` any day, while title says THURSDAYS. Demo-intentional; still teaches the wrong mental model. After demos: either keep with clearer copy (`PRACTICE SHOW · THURSDAY IS LIVE`) or gate show to Thursday and say so.

### F6 — **CLUTTER: Fake $WIP economy on the face + pods**

Show face and P1 pod show `$WIP` that is not paid. Freemium fantasy is fine for V0, but stacked on F1 it looks like a broken casino. Soften later; **do not** add more $WIP chrome before F1 is honest.

### F7 — **CLUTTER: Pads 2/3 + COMING SOON pods**

Three contestant UI without three players. Captions `2`/`3` look broken. Prefer `SOON` / empty dash (station-clarity D6).

### F8 — **DEAD: ResultText**

Still written every spin, scaled invisible. Either delete writes or restore as a real eye-height show line — invisible state = future bug magnet.

### F9 — **CONFUSE: Dual daily feedback paths**

Daily sign (`LOOK LEFT` / `WATCH THE WHEEL`) **and** scoreboard play line (`DAILY · LOOK AT THE WHEEL`) **and** (invisible) ResultText. One surface should own “watch the wheel.” Prefer **daily sign** for daily; keep scoreboard for **show** play line only.

---

## 3. Copy that competes in the first 10 seconds

Too many simultaneous truths:

1. THURSDAYS 12 PM PT (title)  
2. DAILY SPIN / WIN A WEARABLE (gold column)  
3. SHOW WHEEL OPEN (HUD)  
4. SPIN TO START / letter board (strip)  
5. WORK IN PROGRESS puzzle  
6. Wheel face $WIP / JACKPOT  

MASTER allows **three** first-frame messages. Today we exceed that. **Cut or demote** stub puzzle prominence and “show always open” before adding more signs.

---

## 4. Ranked plan — remove / fix / keep

### Do first (honesty + subtract)

| Priority | Action | Risk |
|---|---|---|
| P0 | Fix daily `wheelIndex` ↔ face alignment (F1) | **Done** — misses → 7 (9 Oct); wearable face/label → WEARABLE (13 Oct) |
| P0 | Show label color + hover verb (F2–F3) | **Done 9 Oct** — `SHOW SPIN` cream; hover `Spin the show` |
| P1 | Pads 2/3 → `SOON`; soften COMING SOON if needed (F7) | **Done 9 Oct** — spare pads + score pods `SOON` |
| P1 | Stop painting show scoreboard with daily “LOOK AT THE WHEEL” (F9) | **Done 9 Oct** — daily skips show strip |
| P1 | Decide ResultText: delete path or un-hide (F8) | **Done 9 Oct** — hideNamed + no-op writes |
| P2 | Stub puzzle/guest treatment (F4) — hide or real card | **Softened 13 Oct** — `NEXT GUEST · TBA`; real week card = V1 |
| P2 | `SHOW_OPEN_ALWAYS` copy honesty (F5) | **Softened 13 Oct** — PRACTICE SHOW HUD; Thursday stays on title |

### Do not do yet

- VirtualCamera, second wheel mesh, letter-pad restyle, jumbotron revival, $WIP payout UI, 3-contestant logic, “helpful” HUD tutorials.

### Keep frozen (working)

- Letter-pad flex column (`ui.tsx`)  
- Auth-server daily claim + autopilot path  
- `bindUse` wipe-before-bind + proximity 4 m  
- Title card Thursday line  
- Gold pad without billboard label  

---

## 5. Suggested order vs station-clarity.md

1. **This audit’s P0–P1 honesty pass** (subtract lies)  
2. **Then** station-clarity ownership cues (add gold/magenta grammar, busy hovers)  
3. **Then** V1 week card / ritual  

Do not skip to (2) while the wheel still lies on daily misses.

---

## 6. Acceptance after honesty pass

- Daily TRY AGAIN → pointer visibly on a TRY AGAIN (or blank miss) slice, sign matches.  
- Daily WEARABLE → slice art/words do not say a different prize class (or art updated).  
- Show pad does not read as a second gold daily.  
- Hover on pad 1 says show.  
- Phone checklist in MASTER still passes.  
- Letter pad still appears on show letter calls.
