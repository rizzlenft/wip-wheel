import { engine, TextShape } from '@dcl/sdk/ecs'
import { Color3 } from '@dcl/sdk/math'
import { BANNER, BOARD, STRIP } from './layout'
import { GLOW, LOOK, fontSizeForMeters, makeBox, makeFace, makeText, setSign } from './look'
import { PUZZLE_MAX_ROW_LEN, PUZZLE_MAX_ROWS, Puzzle, WEEKLY_PUZZLE, puzzleRows } from './puzzle'

type Tile = {
  letter: string
  plate: ReturnType<typeof engine.addEntity>
  textEntity: ReturnType<typeof engine.addEntity>
}

const tiles: Tile[] = []
let categorySign: ReturnType<typeof engine.addEntity> | null = null
let lastGuessed = ''
let shownAnswer = ''

const BOARD_X = BOARD.x
const BOARD_Z = BOARD.z
/**
 * A called letter uses the documented scale: fontSize 10 is 1 meter tall.
 * 0.4 of the tile height keeps it inside the plate. The category line stays at 1.7.
 */
const TILE_W = 1.02
const TILE_H = 1.12
const TILE_GAP = 0.1
/** Edge-to-edge gap between stacked tiles (matches prior 2-row rhythm). */
const ROW_GAP = 0.1

/**
 * Evidence (14 Oct Preview): ROW_Y[2]=3.8 put tile bottoms at 3.24, inside the
 * scoreboard strip (ink top 3.48, gold rule 3.52 at STRIP.z in front of the board).
 * Visible stump of each plate looked "squashed." Derive centers from STRIP so a
 * strip move cannot re-bury row 3. Frame always spans 3 rows (empty slots OK).
 */
const STRIP_TOP = STRIP.y + STRIP.h / 2 + 0.04
const ROW_PITCH = TILE_H + ROW_GAP
const ROW_BOTTOM_Y = STRIP_TOP + 0.18 + TILE_H / 2
const ROW_Y = [ROW_BOTTOM_Y + 2 * ROW_PITCH, ROW_BOTTOM_Y + ROW_PITCH, ROW_BOTTOM_Y] as const

export function setupBoard() {
  const rows = puzzleRows(WEEKLY_PUZZLE.answer, PUZZLE_MAX_ROWS, PUZZLE_MAX_ROW_LEN)
  const longest = Math.max(
    PUZZLE_MAX_ROW_LEN,
    rows.reduce((max, row) => Math.max(max, row.length), 1)
  )
  // Always size the gold/ink frame for 3 rows so short puzzles leave empty slots.
  const top = ROW_Y[0] + TILE_H / 2 + 0.58
  const bottom = ROW_Y[ROW_Y.length - 1] - TILE_H / 2 - 0.22
  const centerY = (top + bottom) / 2
  const innerH = top - bottom
  const innerW = longest * (TILE_W + TILE_GAP) - TILE_GAP + 0.9

  makeBox({ x: BOARD_X, y: centerY, z: BOARD_Z + 0.1 }, { x: innerW + 0.5, y: innerH + 0.5, z: 0.12 }, LOOK.gold, GLOW.gold, 1.7)
  makeBox({ x: BOARD_X, y: centerY, z: BOARD_Z + 0.06 }, { x: innerW, y: innerH, z: 0.1 }, LOOK.ink, GLOW.ink, 0.45)
  buildChassis(innerW + 0.5)

  categorySign = makeText({ x: BOARD_X, y: top - 0.32, z: BOARD_Z - 0.08 }, 1.7, LOOK.gold, {
    serif: true,
    width: innerW,
    height: 0.5,
    sharp: 3,
    outlineWidth: 0.05
  })
  setSign(categorySign, WEEKLY_PUZZLE.category)
  placeTiles(WEEKLY_PUZZLE.answer)
}

/** Swap the plates when the server moves to the next card. The gold frame stays. */
export function showPuzzle(puzzle: Puzzle) {
  if (puzzle.answer === shownAnswer && tiles.length > 0) return
  if (categorySign) setSign(categorySign, puzzle.category)
  clearTiles()
  placeTiles(puzzle.answer)
}

function clearTiles() {
  for (const tile of tiles) {
    engine.removeEntity(tile.plate)
    engine.removeEntity(tile.textEntity)
  }
  tiles.length = 0
  lastGuessed = '*'
}

function placeTiles(answer: string) {
  shownAnswer = answer
  const rows = puzzleRows(answer, PUZZLE_MAX_ROWS, PUZZLE_MAX_ROW_LEN)
  rows.forEach((row, rowIndex) => {
    if (rowIndex >= ROW_Y.length) return
    const letters = row.split('')
    const width = letters.length * (TILE_W + TILE_GAP) - TILE_GAP
    const startX = BOARD_X - width / 2 + TILE_W / 2
    letters.forEach((letter, col) => {
      if (letter === ' ') return
      const x = startX + col * (TILE_W + TILE_GAP)
      tiles.push(makeTile(letter, x, ROW_Y[rowIndex]))
    })
  })
}

/** Bank now lives on the SHOW sign at eye height (countdown.ts). Kept so callers stay untouched. */
export function setBankSign(_wip: number, _nfts: number, _solved: boolean) {}

export function refreshBoard(guessed: string) {
  if (guessed === lastGuessed && tiles.length > 0) return
  lastGuessed = guessed
  for (const tile of tiles) {
    const revealed = guessed.indexOf(tile.letter) !== -1
    if (!TextShape.has(tile.textEntity)) continue
    const text = TextShape.getMutable(tile.textEntity)
    text.text = revealed ? tile.letter : ''
    text.textColor = LOOK.navy
  }
}

/**
 * One cabinet behind the title, the phrase, and the letter strip.
 * Those three stay where they are. This only fills the gaps you see from the side.
 * The skin sits behind every letter, so it cannot cover the type.
 */
function buildChassis(frameW: number) {
  const top = BANNER.y + BANNER.h / 2
  const bottom = STRIP.y - STRIP.h / 2
  const height = top - bottom
  const centerY = (top + bottom) / 2
  const width = Math.max(frameW, BANNER.w, STRIP.w)
  const backZ = Math.max(BOARD_Z, BANNER.z) + 0.28
  const frontZ = STRIP.z - 0.06
  const midZ = (backZ + frontZ) / 2

  makeBox(
    { x: BOARD_X, y: centerY, z: backZ + 0.05 },
    { x: width + 0.7, y: height + 0.4, z: 0.08 },
    LOOK.gold,
    GLOW.gold,
    1.15
  )
  makeBox(
    { x: BOARD_X, y: centerY, z: backZ },
    { x: width + 0.28, y: height + 0.12, z: 0.1 },
    LOOK.ink,
    GLOW.ink,
    0.3
  )

  const postX = width / 2 + 0.16
  for (const side of [-1, 1]) {
    makeBox(
      { x: BOARD_X + side * postX, y: centerY, z: midZ },
      { x: 0.26, y: height + 0.12, z: backZ - frontZ },
      LOOK.navy,
      GLOW.magenta,
      0.4
    )
  }
}

function makeTile(letter: string, x: number, y: number): Tile {
  const plate = makeFace(
    { x, y, z: BOARD_Z - 0.02 },
    TILE_W,
    TILE_H,
    LOOK.cream,
    Color3.create(0.7, 0.55, 0.45),
    0.55
  )
  const textEntity = makeText({ x, y, z: BOARD_Z - 0.08 }, fontSizeForMeters(TILE_H * 0.4), LOOK.navy, {
    width: TILE_W,
    height: TILE_H,
    outlineWidth: 0.06
  })
  return { letter, plate, textEntity }
}
