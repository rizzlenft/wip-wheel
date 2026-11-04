# Week puzzle bank — examples that fit the board

**Budget:** max **3 rows × 14 characters** (`puzzleFitsBoard` in `src/puzzle.ts`).  
**Charset:** A–Z and spaces only.

**Safest pattern:** exactly **three words** → one word per row. Longer phrases can fit but must pass `npm run check:week` (the packer is picky).

---

## Staging / between guests

| Category | Answer |
|---|---|
| PHRASE | `THE WIP MEETUP` |
| PHRASE | `NEXT GUEST SOON` |
| PHRASE | `COME BACK TOMORROW` |
| PHRASE | `THURSDAY IS SHOWTIME` |
| PHRASE | `BUILD IN PUBLIC` |
| PHRASE | `SPIN CALL SOLVE` |

## Room / show flavor

| Category | Answer |
|---|---|
| PHRASE | `GOLD PAD DAILY` |
| PHRASE | `SHOW PAD ONE` |
| PHRASE | `WALLETS SPIN DAILY` |
| PHRASE | `GUESTS ALWAYS WELCOME` |
| PHRASE | `REAL WEARABLE PRIZES` |
| PHRASE | `LIVE STUDIO ENERGY` |
| PHRASE | `METAVERSE GAME SHOW` |
| PERSON | `WELCOME CREATORS ALL` |

## Guest templates (swap the name — keep ≤14 letters per word)

| Category | Pattern |
|---|---|
| PERSON | `WELCOME <NAME>` (two words — OK) |
| PERSON | `<NAME> DROPS IN` |
| PHRASE | `<NAME> IS HERE` |

Run `npm run check:week` after substituting a real name.

## Archive

| Guest | Category | Answer |
|---|---|---|
| FRACTILIANS | PHRASE | `FRACTILIANS IS SPAWNING SHIT IN REAL TIME` |

---

## Writing tips

- Prefer three short words.  
- No punctuation, emojis, or `$`.  
- After edit: `npm run check:week` → Preview board → one publish.
