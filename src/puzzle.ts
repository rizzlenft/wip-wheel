/**
 * Letter-reveal loop used by hangman / Wheel of Fortune-style shows:
 * spin, call a letter, reveal hits, spin again until the phrase is solved.
 * Rules are public-domain. This is not a licensed Wheel of Fortune clone.
 */

import { WEEK } from './week'

export type Puzzle = {
  category: string
  answer: string
}

/** Board capacity — week-card answers must pack into this (see puzzleRows). */
export const PUZZLE_MAX_ROWS = 3
export const PUZZLE_MAX_ROW_LEN = 14

/**
 * Card 0 is this week's phrase. The rest play in order after each solve.
 * An empty room starts over at card 0, because the server only keeps the
 * index in memory. Solve counts are the part that persists.
 */
export const PUZZLE_BANK: Puzzle[] = [
  { category: WEEK.puzzleCategory, answer: WEEK.puzzleAnswer },
  { category: 'PHRASE', answer: 'THE WIP MEETUP' },
  { category: 'PHRASE', answer: 'NEXT GUEST SOON' },
  { category: 'PHRASE', answer: 'COME BACK TOMORROW' },
  { category: 'PHRASE', answer: 'THURSDAY IS SHOWTIME' },
  { category: 'PHRASE', answer: 'BUILD IN PUBLIC' },
  { category: 'PHRASE', answer: 'SPIN CALL SOLVE' },
  { category: 'PHRASE', answer: 'GOLD PAD DAILY' },
  { category: 'PHRASE', answer: 'REAL WEARABLE PRIZES' },
  { category: 'PHRASE', answer: 'LIVE STUDIO ENERGY' },
  { category: 'PHRASE', answer: 'METAVERSE GAME SHOW' }
]

export const WEEKLY_PUZZLE: Puzzle = PUZZLE_BANK[0]

export function puzzleAt(index: number): Puzzle {
  const n = PUZZLE_BANK.length
  const i = ((index % n) + n) % n
  return PUZZLE_BANK[i]
}

/** Uppercase, letters and single spaces. Used for a full-phrase solve. */
export function normalizePhrase(raw: string): string {
  return (raw || '')
    .toUpperCase()
    .replace(/[^A-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function phrasesMatch(guess: string, answer: string): boolean {
  const got = normalizePhrase(guess)
  const want = normalizePhrase(answer)
  if (!got || got.length > PUZZLE_MAX_ROWS * PUZZLE_MAX_ROW_LEN + 2) return false
  return got === want
}

/** Every unique letter in the answer, so the board can reveal a solved phrase. */
export function revealAll(answer: string): string {
  const norm = normalizePhrase(answer)
  let out = ''
  for (let i = 0; i < norm.length; i++) {
    const ch = norm.charAt(i)
    if (ch >= 'A' && ch <= 'Z' && out.indexOf(ch) === -1) out += ch
  }
  return out
}

// Fail loud in Preview logs if a late week-card swap blows the 3×14 budget.
for (let i = 0; i < PUZZLE_BANK.length; i++) {
  if (!puzzleFitsBoard(PUZZLE_BANK[i].answer)) {
    console.error('[WIP] puzzle bank card does not fit 3×14:', i, PUZZLE_BANK[i].answer)
  }
}

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function normalizeLetter(raw: string): string {
  const upper = raw.toUpperCase()
  if (upper.length === 0) return ''
  const ch = upper.charAt(0)
  if (ch < 'A' || ch > 'Z') return ''
  return ch
}

export function alreadyGuessed(guessed: string, letter: string): boolean {
  return guessed.indexOf(letter) !== -1
}

export function countHits(answer: string, letter: string): number {
  let hits = 0
  for (let i = 0; i < answer.length; i++) {
    if (answer.charAt(i) === letter) hits += 1
  }
  return hits
}

export function isSolved(answer: string, guessed: string): boolean {
  for (let i = 0; i < answer.length; i++) {
    const ch = answer.charAt(i)
    if (ch >= 'A' && ch <= 'Z' && guessed.indexOf(ch) === -1) return false
  }
  return true
}

/**
 * Pack words into up to `maxRows` board rows.
 * Soft-cap `maxRowLen` so phrases stay readable; overflow merges into the last row
 * (week card should stay within PUZZLE_MAX_ROWS × PUZZLE_MAX_ROW_LEN).
 */
export function puzzleRows(
  answer: string,
  maxRows = PUZZLE_MAX_ROWS,
  maxRowLen = PUZZLE_MAX_ROW_LEN
): string[] {
  const words = answer.split(' ').filter((w) => w.length > 0)
  if (words.length === 0) return ['']
  if (words.length <= maxRows) return words

  const rows: string[] = []
  let current = ''
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const next = current.length === 0 ? word : `${current} ${word}`
    const rowsLeft = maxRows - rows.length
    // Break while another row is still free. An empty row is allowed.
    // Requiring one leftover word per leftover row stuffed the tail past 14.
    if (current.length > 0 && next.length > maxRowLen && rowsLeft > 1) {
      rows.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current.length > 0) rows.push(current)

  while (rows.length > maxRows) {
    const last = rows.pop() as string
    rows[rows.length - 1] = `${rows[rows.length - 1]} ${last}`
  }
  return rows
}

/** True when every packed row is within the board character budget. */
export function puzzleFitsBoard(answer: string): boolean {
  const rows = puzzleRows(answer)
  if (rows.length > PUZZLE_MAX_ROWS) return false
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length > PUZZLE_MAX_ROW_LEN) return false
  }
  return true
}
