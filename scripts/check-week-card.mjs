#!/usr/bin/env node
/**
 * Validate design/week.json (+ optional src/week.json) for the week-card ritual.
 * Puzzle must pack into 3×14 (same rules as src/puzzle.ts puzzleFitsBoard).
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MAX_ROWS = 3
const MAX_LEN = 14

function puzzleRows(answer) {
  const words = String(answer || '')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return ['']
  if (words.length <= MAX_ROWS) return words
  const rows = []
  let current = ''
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const next = current.length === 0 ? word : `${current} ${word}`
    const rowsLeft = MAX_ROWS - rows.length
    if (current.length > 0 && next.length > MAX_LEN && rowsLeft > 1) {
      rows.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current.length > 0) rows.push(current)
  while (rows.length > MAX_ROWS) {
    const last = rows.pop()
    rows[rows.length - 1] = `${rows[rows.length - 1]} ${last}`
  }
  return rows
}

function fits(answer) {
  const rows = puzzleRows(answer)
  if (rows.length > MAX_ROWS) return { ok: false, rows, reason: `too many rows (${rows.length})` }
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length > MAX_LEN) {
      return { ok: false, rows, reason: `row ${i + 1} length ${rows[i].length} > ${MAX_LEN}: "${rows[i]}"` }
    }
  }
  return { ok: true, rows }
}

function load(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'))
}

const design = load('design/week.json')
const src = load('src/week.json')
const weekTs = readFileSync(resolve(root, 'src/week.ts'), 'utf8')
const liveAnswer = (weekTs.match(/puzzleAnswer:\s*'([^']*)'/) || [])[1]

const keys = [
  'guestName',
  'guestKicker',
  'prizeHype',
  'whenLine',
  'puzzleCategory',
  'puzzleAnswer',
  'showWeekday',
  'showHour',
  'showMinute',
  'showDurationHours',
  'timeZone'
]

let failed = false
if (liveAnswer !== design.puzzleAnswer) {
  console.error('MISMATCH src/week.ts puzzleAnswer vs design/week.json')
  console.error(`  week.ts: ${JSON.stringify(liveAnswer)}`)
  console.error(`  design:  ${JSON.stringify(design.puzzleAnswer)}`)
  failed = true
}

for (const k of keys) {
  if (design[k] !== src[k]) {
    console.error(`MISMATCH design vs src/week.json: ${k}`)
    console.error(`  design: ${JSON.stringify(design[k])}`)
    console.error(`  src:    ${JSON.stringify(src[k])}`)
    failed = true
  }
}

const answer = design.puzzleAnswer
if (/[^A-Za-z ]/.test(answer)) {
  console.error('FAIL puzzleAnswer has non A–Z/space characters:', answer)
  failed = true
}

const bankFile = readFileSync(resolve(root, 'src/puzzle.ts'), 'utf8')
const bankAnswers = []
const bankRe = /answer:\s*'([^']*)'/g
let bankMatch
while ((bankMatch = bankRe.exec(bankFile))) bankAnswers.push(bankMatch[1])
if (!/answer:\s*WEEK\.puzzleAnswer/.test(bankFile)) {
  console.error('FAIL puzzle bank card 0 is not WEEK.puzzleAnswer')
  failed = true
}
if (bankAnswers.length < 1) {
  console.error('FAIL puzzle bank is missing practice cards')
  failed = true
}
for (const card of bankAnswers) {
  if (/[^A-Za-z ]/.test(card)) {
    console.error('FAIL bank card has non A-Z/space characters:', card)
    failed = true
    continue
  }
  const cardFit = fits(card)
  if (!cardFit.ok) {
    console.error('FAIL bank card fit:', card, cardFit.reason)
    failed = true
  }
}

const check = fits(answer)
console.log(`Guest: ${design.guestKicker} · ${design.guestName}`)
console.log(`Puzzle [${design.puzzleCategory}]: ${answer}`)
console.log('Rows:', check.rows.map((r) => `[${r.length}] ${r}`).join(' | '))
if (!check.ok) {
  console.error('FAIL board fit:', check.reason)
  failed = true
}

if (failed) {
  console.error('\ncheck:week FAILED — fix week.json mirrors + phrase, see design/week-ritual.md')
  process.exit(1)
}
console.log('\ncheck:week OK — sync the same fields into src/week.ts card, then Preview → publish')
