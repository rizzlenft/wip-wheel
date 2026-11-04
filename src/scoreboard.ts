/**
 * Used-letter board + three contestant scores under the puzzle.
 * Wheel of Fortune grammar: consonants, vowels in gold, called letters magenta.
 * Three pods, same layout. Player 1 tracks the round. 2 and 3 are empty chairs.
 */

import { engine } from '@dcl/sdk/ecs'
import { Color3 } from '@dcl/sdk/math'
import { STRIP } from './layout'
import { GLOW, LOOK, fontSizeForMeters, makeBox, makeFace, makeRule, makeText, setSign, tintFace } from './look'

type EntityRef = ReturnType<typeof engine.addEntity>

type Cell = {
  letter: string
  vowel: boolean
  plate: EntityRef
  glyph: EntityRef
}

type Pod = {
  name: EntityRef
  score: EntityRef
  prize: EntityRef
}

const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'
const VOWELS = 'AEIOU'
const TEXT_Z = STRIP.z - 0.12
const CELL_W = 0.64
const CELL_H = 0.58
/** Letter is 62% of the key. fontSize 10 = 1 m, so this stays inside the plate. */
const CELL_FONT = fontSizeForMeters(CELL_H * 0.62)
const POD_W = 4.7
const POD_H = 1.12

const DIM = Color3.create(0.12, 0.05, 0.1)

let cells: Cell[] = []
let playSign: EntityRef | null = null
let pods: Pod[] = []
let lastGuessed = '___'
let lastPlay = '___'

export function setupScoreboard() {
  const { x, y, z, w, h } = STRIP
  makeBox({ x, y, z: z + 0.06 }, { x: w, y: h, z: 0.1 }, LOOK.ink, GLOW.ink, 0.3)
  makeRule(x, y + h / 2 + 0.04, z, w + 0.08, LOOK.gold, GLOW.gold, 1.9)
  makeRule(x, y - h / 2 - 0.04, z, w + 0.08, LOOK.gold, GLOW.gold, 1.4)

  buildLetters(y + 0.88, CONSONANTS, false)
  buildLetters(y + 0.24, VOWELS, true)

  playSign = makeText({ x, y: y - 0.28, z: TEXT_Z }, 1.85, LOOK.cream, {
    serif: true,
    width: w - 0.6,
    height: 0.5,
    sharp: 3,
    outlineWidth: 0.05
  })
  setSign(playSign, 'SPIN TO START', LOOK.cream)

  const podY = y - 0.98
  const gap = 0.18
  const startX = x - (POD_W * 3 + gap * 2) / 2 + POD_W / 2
  pods = [makePod(startX, podY, 1, true), makePod(startX + POD_W + gap, podY, 2, false), makePod(startX + (POD_W + gap) * 2, podY, 3, false)]
  paintLetters('')
  setPlayerOne('PLAYER 1', 0, 0, '')
}

export function setShowPlay(play: string, _bank: string) {
  paintPlay(play)
}

export function setShowStats(guessed: string, play: string, _bank: string, _history: string) {
  paintLetters(guessed)
  paintPlay(play)
}

export function syncShowBoard(guessed: string, _history: string) {
  paintLetters(guessed)
}

export function setPlayerOne(name: string, wip: number, nfts: number, prize: string) {
  paintPod(0, name, wip, nfts, prize, true)
}

export function setPlayerTwo(name: string, nfts: number, prize: string) {
  paintPod(1, name, 0, nfts, prize, true)
}

export function setPlayerThree(name: string, nfts: number, prize: string) {
  paintPod(2, name, 0, nfts, prize, true)
}

function paintPod(
  index: number,
  name: string,
  wip: number,
  nfts: number,
  prize: string,
  live: boolean
) {
  const pod = pods[index]
  if (!pod) return
  const label = name.trim() ? name.toUpperCase() : `PLAYER ${index + 1}`
  const total = scoreLine(wip, nfts)
  const last = prize.trim().toUpperCase()
  setSign(pod.name, `${index + 1}   ${label}`, live ? LOOK.cream : LOOK.lilac)
  setSign(pod.score, total, live ? LOOK.gold : LOOK.lilac)
  setSign(pod.prize, last && last !== total ? last : '—', live ? LOOK.cream : LOOK.lilac)
}

function paintPlay(play: string) {
  if (play === lastPlay) return
  lastPlay = play
  setSign(playSign, play.toUpperCase(), LOOK.cream)
}

function paintLetters(guessed: string) {
  if (guessed === lastGuessed) return
  lastGuessed = guessed
  for (const cell of cells) {
    const used = guessed.indexOf(cell.letter) !== -1
    if (used) {
      tintFace(cell.plate, LOOK.ink, DIM, 0.2)
      setSign(cell.glyph, cell.letter, LOOK.magenta)
      continue
    }
    if (cell.vowel) {
      tintFace(cell.plate, LOOK.ink, GLOW.gold, 0.45)
      setSign(cell.glyph, cell.letter, LOOK.gold)
    } else {
      tintFace(cell.plate, LOOK.ink, GLOW.cream, 0.22)
      setSign(cell.glyph, cell.letter, LOOK.cream)
    }
  }
}

function buildLetters(y: number, row: string, vowel: boolean) {
  const { x, z } = STRIP
  const step = CELL_W + 0.06
  const width = row.length * step - 0.06
  const start = x - width / 2 + CELL_W / 2
  for (let i = 0; i < row.length; i++) {
    const letter = row.charAt(i)
    const cx = start + i * step
    const plateW = CELL_W - 0.08
    const plate = makeFace(
      { x: cx, y, z: z - 0.02 },
      plateW,
      CELL_H,
      LOOK.ink,
      vowel ? GLOW.gold : GLOW.cream,
      vowel ? 0.45 : 0.22
    )
    const glyph = makeText({ x: cx, y, z: TEXT_Z }, CELL_FONT, vowel ? LOOK.gold : LOOK.cream, {
      width: plateW,
      height: CELL_H,
      outlineWidth: 0.06
    })
    setSign(glyph, letter, vowel ? LOOK.gold : LOOK.cream)
    cells.push({ letter, vowel, plate, glyph })
  }
}

function makePod(x: number, y: number, seat: number, live: boolean): Pod {
  const z = STRIP.z
  makeBox({ x, y, z: z + 0.04 }, { x: POD_W, y: POD_H, z: 0.08 }, LOOK.ink, GLOW.ink, live ? 0.35 : 0.18)
  makeRule(x, y + POD_H / 2 + 0.03, z, POD_W, live ? LOOK.gold : LOOK.lilac, live ? GLOW.gold : GLOW.ink, live ? 1.8 : 0.35)
  const nameColor = live ? LOOK.cream : LOOK.lilac
  const scoreColor = live ? LOOK.gold : LOOK.lilac
  const name = makeText({ x, y: y + 0.34, z: TEXT_Z }, 1.4, nameColor, {
    serif: true,
    width: POD_W - 0.3,
    height: 0.4
  })
  const score = makeText({ x, y: y - 0.02, z: TEXT_Z }, 2.05, scoreColor, {
    serif: true,
    width: POD_W - 0.3,
    height: 0.5
  })
  const prize = makeText({ x, y: y - 0.4, z: TEXT_Z }, 1.05, nameColor, {
    width: POD_W - 0.3,
    height: 0.32
  })
  setSign(name, `${seat}   PLAYER ${seat}`, nameColor)
  setSign(score, '0 $WIP', scoreColor)
  setSign(prize, live ? '—' : 'LIVE', nameColor)
  return { name, score, prize }
}

function scoreLine(wip: number, nfts: number) {
  const nft = nfts > 0 ? `  ·  ${nfts} NFT` : ''
  return `${wip} $WIP${nft}`
}
