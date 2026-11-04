# Week-card ritual — Thursday differs without rebuilding the room

**Goal:** Each Meetup feels like a new episode. Guest + puzzle swap late (often **1–2 days** before the hang). Daily claim stays frozen.

**Live source of truth:** `src/week.ts` (`card` object)  
**Mirrors (keep identical):** `design/week.json` + `src/week.json`  
Do **not** import JSON into the scene (Hub tsconfig). Edit the three in sync, or edit `week.ts` first then copy fields into both JSON files.

Companion: [week-puzzle-bank.md](week-puzzle-bank.md), [V0-FREEZE.md](V0-FREEZE.md).

---

## Cadence (fits “I don’t know the guest until Tue/Wed”)

| When | What |
|---|---|
| After a hang | Leave last guest up **or** flip to staging card (`NEXT GUEST` / practice phrase) — see below |
| Guest + theme land (often Tue–Wed) | Fill `guestName`, `puzzleCategory`, `puzzleAnswer` (and optional `prizeHype`) |
| Same day | `npm run check:week` → Preview once → **one** publish → quit Explorer fully |
| Morning of Meetup | Do **not** republish unless the room is dead ([demo-tomorrow.md](demo-tomorrow.md)) |

You do **not** need the guest on Monday. Staging card keeps the room honest between reveals.

---

## Fields you touch

| Field | Example | Notes |
|---|---|---|
| `guestName` | `FRACTILIANS` / `NEXT GUEST` | Short; shows on week card |
| `guestKicker` | `THIS WEEK` / `COMING UP` | |
| `puzzleCategory` | `PHRASE` / `PERSON` / `THING` | Board header |
| `puzzleAnswer` | `A–Z` + spaces only | Must fit **3×14** — run `npm run check:week` |
| `prizeHype` | `WEARABLES · LIVE SPINS · …` | Optional flavor |
| `whenLine` | `THURSDAYS · 12 PM PT` | Leave unless Meetup moves |
| Schedule (`showWeekday`…) | Thu noon PT | Leave unless Meetup moves |

---

## Staging card (between known guests)

Use when next guest is TBA:

```text
guestName: NEXT GUEST
guestKicker: COMING UP
puzzleCategory: PHRASE
puzzleAnswer: THE WIP MEETUP
```

(Three words = safest board fit. More options in [week-puzzle-bank.md](week-puzzle-bank.md).)

Practice show (`SHOW_OPEN_ALWAYS`) can still spin; title card still says THURSDAYS.

---

## Checklist (every swap)

1. Phrase in bank or freshly written — A–Z + spaces only.  
2. `npm run check:week` exits 0.  
3. Preview: board category + tiles match; week card name reads.  
4. One publish; full quit Explorer.  
5. Note guest + date in playtest / Meetup chat if useful.

---

## Later (not this ritual)

- Host endpoint / `signedFetch` to swap without republish (V3).  
- Endless puzzle pool between Thursdays (V1/V3 — gated).  
- Lock board to featured card only during live window.
