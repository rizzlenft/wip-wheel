import { engine, TextShape } from '@dcl/sdk/ecs'
import { GLOW, LOOK, hideNamed, makeBox, makeRule, makeText, marqueeRect, moveNamed, paintSolid, setSign, setupMarquee } from './look'
import { parseLastSpins } from './history'
import { ALPHABET } from './puzzle'
import { clockParts, pad2 } from './week'
import { physicsOnly } from './interact'

type EntityRef = ReturnType<typeof engine.addEntity>

type Cell = { value: EntityRef }
type LetterChip = { ch: string; plate: EntityRef; text: EntityRef }

const X = 28.85
const Z = 30.28
const W = 5.5
const TICKER_Z = 31.08
const LABELS = ['D', 'H', 'M', 'S']

let headline: EntityRef | null = null
let whenSign: EntityRef | null = null
let hypeSign: EntityRef | null = null
let cells: Cell[] = []
let guestKicker: EntityRef | null = null
let guestName: EntityRef | null = null
let playLine: EntityRef | null = null
let bankLine: EntityRef | null = null
let tickerSign: EntityRef | null = null
let scoreLines: EntityRef[] = []
let chips: LetterChip[] = []
let lastPaint = ''
let lastLetters = ''
let lastHistory = ''
let playCopy = 'STAND ON THE PINK PAD'
let bankCopy = 'BANK  0'
let tick = 0
let pulse = 0

export function setupShowWall() {
  dressSet()
  buildTicker()
  buildRightWall()
  setupMarquee()
  paintShow(true)
  paintLetters('')
  paintScores('')
  engine.addSystem(showWallSystem)
}

export function setCrowdLine(_count: number) {}

export function setShowPlay(lastLine: string, bank: string) {
  playCopy = lastLine
  bankCopy = bank
  setSign(playLine, playCopy, LOOK.cream)
  setSign(bankLine, bankCopy, LOOK.gold)
}

export function setShowStats(guessed: string, play: string, bank: string, history: string) {
  setShowPlay(play, bank)
  syncShowBoard(guessed, history)
}

export function syncShowBoard(guessed: string, history: string) {
  if (guessed !== lastLetters) {
    lastLetters = guessed
    paintLetters(guessed)
  }
  if (history !== lastHistory) {
    lastHistory = history
    paintScores(history)
  }
}

function dressSet() {
  moveNamed('Backdrop', { x: 16, y: 7.2, z: 31.58 }, { x: 28.8, y: 14.4, z: 0.32 })
  moveNamed('WingLeft', { x: 3.15, y: 7.2, z: 30.9 }, { x: 6.5, y: 14.4, z: 0.4 })
  moveNamed('WingRight', { x: 28.85, y: 7.2, z: 30.9 }, { x: 6.5, y: 14.4, z: 0.4 })
  moveNamed('Banner', { x: 16, y: 13.25, z: 31.2 }, { x: 13.6, y: 3.4, z: 1 })
  hideNamed('Bezel')
  hideNamed('CrowdText')
  hideNamed('Ticker')
  physicsOnly('Backdrop')
  physicsOnly('WingLeft')
  physicsOnly('WingRight')
  physicsOnly('Banner')
  physicsOnly('Stage')
  physicsOnly('Floor')
}

function buildTicker() {
  makeBox({ x: 16, y: 10.85, z: TICKER_Z + 0.04 }, { x: 13.8, y: 0.82, z: 0.08 }, LOOK.ink, GLOW.gold, 0.45)
  makeRule(16, 11.24, TICKER_Z, 13.8, LOOK.gold, GLOW.gold, 2.0)
  makeRule(16, 10.46, TICKER_Z, 13.8, LOOK.gold, GLOW.gold, 2.0)
  tickerSign = makeText({ x: 16, y: 10.85, z: TICKER_Z - 0.1 }, 1.85, LOOK.cream, { width: 13.4, height: 0.55 })
}

function buildRightWall() {
  makeBox({ x: X, y: 7.2, z: Z + 0.06 }, { x: 6.1, y: 14.0, z: 0.08 }, LOOK.ink, GLOW.screen, 0.45)
  makeBox({ x: X - 3.12, y: 7.2, z: Z + 0.1 }, { x: 0.18, y: 14.2, z: 0.16 }, LOOK.gold, GLOW.gold, 2.3)
  makeBox({ x: X + 3.12, y: 7.2, z: Z + 0.1 }, { x: 0.18, y: 14.2, z: 0.16 }, LOOK.gold, GLOW.gold, 2.3)
  makeBox({ x: X, y: 14.2, z: Z + 0.1 }, { x: 6.4, y: 0.18, z: 0.16 }, LOOK.gold, GLOW.gold, 2.3)
  makeBox({ x: X, y: 0.22, z: Z + 0.1 }, { x: 6.4, y: 0.18, z: 0.16 }, LOOK.gold, GLOW.gold, 1.6)
  marqueeRect(X, 7.2, Z + 0.14, 6.35, 14.05, 0.5)

  makeBox({ x: X, y: 13.05, z: Z + 0.02 }, { x: 5.5, y: 1.45, z: 0.08 }, LOOK.gold, GLOW.gold, 2.0)
  headline = makeText({ x: X, y: 13.32, z: Z - 0.12 }, 2.8, LOOK.navy, { serif: true, width: W, height: 0.8 })
  whenSign = makeText({ x: X, y: 12.55, z: Z - 0.12 }, 1.3, LOOK.navy, { width: W, height: 0.38 })
  hypeSign = makeText({ x: X, y: 12.08, z: Z - 0.12 }, 1.15, LOOK.gold, { width: W, height: 0.32 })

  cells = []
  const cellW = 1.18
  const gap = 0.12
  const total = 4 * cellW + 3 * gap
  const startX = X - total / 2 + cellW / 2
  for (let i = 0; i < 4; i++) {
    const cx = startX + i * (cellW + gap)
    makeBox({ x: cx, y: 11.02, z: Z + 0.02 }, { x: cellW, y: 1.28, z: 0.07 }, LOOK.ink, GLOW.gold, 0.7)
    const value = makeText({ x: cx, y: 11.08, z: Z - 0.12 }, 2.85, LOOK.gold, {
      led: true,
      width: 1.12,
      height: 1.05
    })
    const tag = makeText({ x: cx, y: 10.18, z: Z - 0.12 }, 1.1, LOOK.cream, { width: 1.12, height: 0.32 })
    setSign(tag, LABELS[i])
    cells.push({ value })
  }

  guestKicker = makeText({ x: X, y: 9.72, z: Z - 0.12 }, 1.1, LOOK.gold, { width: W, height: 0.3 })
  guestName = makeText({ x: X, y: 9.36, z: Z - 0.12 }, 1.65, LOOK.cream, { serif: true, width: W, height: 0.45 })
  makeRule(X, 9.02, Z - 0.02, 5.1, LOOK.gold, GLOW.gold, 1.8)

  const used = makeText({ x: X, y: 8.7, z: Z - 0.12 }, 1.2, LOOK.gold, { width: W, height: 0.32 })
  setSign(used, 'CALLED LETTERS')
  buildLetterBoard()

  makeRule(X, 6.92, Z - 0.02, 5.1, LOOK.gold, GLOW.gold, 1.6)
  const scores = makeText({ x: X, y: 6.62, z: Z - 0.12 }, 1.2, LOOK.gold, { width: W, height: 0.32 })
  setSign(scores, 'SCORES')
  scoreLines = []
  for (let i = 0; i < 4; i++) {
    const line = makeText({ x: X, y: 6.18 - i * 0.55, z: Z - 0.12 }, 1.35, LOOK.cream, { width: W, height: 0.42 })
    scoreLines.push(line)
  }

  makeBox({ x: X, y: 3.05, z: Z + 0.02 }, { x: 5.5, y: 1.5, z: 0.08 }, LOOK.ink, GLOW.gold, 0.7)
  bankLine = makeText({ x: X, y: 3.38, z: Z - 0.12 }, 2.2, LOOK.gold, { led: true, width: W, height: 0.65 })
  playLine = makeText({ x: X, y: 2.68, z: Z - 0.12 }, 1.4, LOOK.cream, { width: W, height: 0.42 })
  setSign(playLine, playCopy)
  setSign(bankLine, bankCopy)
}

function buildLetterBoard() {
  chips = []
  const cols = 13
  const chipW = 0.36
  const chipH = 0.52
  const gapX = 0.05
  const gapY = 0.1
  const totalW = cols * chipW + (cols - 1) * gapX
  const startX = X - totalW / 2 + chipW / 2
  const topY = 8.08
  for (let i = 0; i < ALPHABET.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = startX + col * (chipW + gapX)
    const y = topY - row * (chipH + gapY)
    const plate = makeBox({ x, y, z: Z + 0.02 }, { x: chipW, y: chipH, z: 0.06 }, LOOK.ink, GLOW.ink, 0.4)
    const text = makeText({ x, y, z: Z - 0.1 }, 1.05, LOOK.cream, { width: 0.34, height: 0.4 })
    setSign(text, ALPHABET.charAt(i))
    chips.push({ ch: ALPHABET.charAt(i), plate, text })
  }
}

function paintLetters(guessed: string) {
  for (let i = 0; i < chips.length; i++) {
    const used = guessed.indexOf(chips[i].ch) !== -1
    paintSolid(
      chips[i].plate,
      used ? LOOK.gold : LOOK.ink,
      used ? GLOW.gold : GLOW.ink,
      used ? 1.8 : 0.35
    )
    if (TextShape.has(chips[i].text)) {
      TextShape.getMutable(chips[i].text).textColor = used ? LOOK.navy : LOOK.lilac
    }
  }
}

function paintScores(history: string) {
  const rows = parseLastSpins(history)
  for (let i = 0; i < scoreLines.length; i++) {
    if (i >= rows.length) {
      setSign(scoreLines[i], i === 0 ? 'NO SPINS YET' : '', LOOK.cream)
      continue
    }
    setSign(scoreLines[i], `${rows[i].winner.toUpperCase()}  ·  ${rows[i].prize}`, i === 0 ? LOOK.gold : LOOK.cream)
  }
}

function showWallSystem(dt: number) {
  tick += dt
  pulse += dt
  if (tick < 0.2) return
  tick = 0
  paintShow(false)
}

function paintShow(force: boolean) {
  const clock = clockParts()
  const key = `${clock.live}|${clock.days}|${clock.hours}|${clock.minutes}|${clock.seconds}|${playCopy}|${bankCopy}`
  const secondsOn = Math.floor(pulse * 2) % 2 === 0
  if (!force && key === lastPaint) {
    setSign(cells[3].value, pad2(clock.seconds), secondsOn ? LOOK.gold : LOOK.cream)
    return
  }
  lastPaint = key

  setSign(headline, clock.live ? 'LIVE' : 'SHOW', LOOK.navy)
  setSign(whenSign, clock.live ? 'ON AIR  ·  WIP MEETUP' : 'THURSDAYS  ·  12 PM PT', LOOK.navy)
  setSign(hypeSign, clock.prizeHype, LOOK.gold)
  setSign(guestKicker, clock.guestKicker, LOOK.gold)
  setSign(guestName, clock.guestName)
  setSign(
    tickerSign,
    clock.live
      ? `LIVE NOW   ·   ${clock.prizeHype}   ·   ${clock.guestName}`
      : `THURSDAYS 12 PT   ·   ${clock.prizeHype}   ·   ${clock.guestName}`
  )

  const values = [pad2(clock.days), pad2(clock.hours), pad2(clock.minutes), pad2(clock.seconds)]
  for (let i = 0; i < cells.length; i++) setSign(cells[i].value, values[i], LOOK.gold)
}

export function lastSpinLine(history: string, fallback: string) {
  const rows = parseLastSpins(history)
  if (rows.length === 0) return fallback
  return `${rows[0].winner.toUpperCase()}  ·  ${rows[0].prize}`
}
