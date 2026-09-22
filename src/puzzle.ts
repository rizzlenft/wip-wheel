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

export const WEEKLY_PUZZLE: Puzzle = {
  category: WEEK.puzzleCategory,
  answer: WEEK.puzzleAnswer
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

export function puzzleRows(answer: string): string[] {
  const words = answer.split(' ')
  if (words.length <= 2) return words
  return [words.slice(0, -1).join(' '), words[words.length - 1]]
}
