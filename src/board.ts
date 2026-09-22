import { engine, MeshRenderer, TextShape, Transform } from '@dcl/sdk/ecs'
import { Color3 } from '@dcl/sdk/math'
import { AUDIENCE_FACING } from './facing'
import { ALIGN_CENTER, GLOW, LOOK, makeBox, makeText, moveNamed, paintSolid, setSign } from './look'
import { WEEKLY_PUZZLE, puzzleRows } from './puzzle'

type Tile = {
  letter: string
  plate: ReturnType<typeof engine.addEntity>
  textEntity: ReturnType<typeof engine.addEntity>
}

const tiles: Tile[] = []
let categorySign: ReturnType<typeof engine.addEntity> | null = null
let bankSign: ReturnType<typeof engine.addEntity> | null = null
let lastGuessed = ''

export const BOARD_X = 16.8
const BOARD_Z = 31.05
const TILE_W = 1.14
const TILE_H = 1.28
const TILE_GAP = 0.12
const ROW_Y = [8.15, 6.7, 5.25]

export function setupBoard() {
  moveNamed('Ticker', { x: BOARD_X, y: 2.82, z: 31.18 }, { x: 0.01, y: 0.01, z: 0.01 })

  const plaque = makeBox({ x: BOARD_X, y: 9.85, z: BOARD_Z + 0.04 }, { x: 8.4, y: 0.95, z: 0.08 }, LOOK.gold, GLOW.gold, 1.8)
  void plaque
  categorySign = makeText({ x: BOARD_X, y: 9.85, z: BOARD_Z - 0.08 }, 2.4, LOOK.navy, {
    serif: true,
    width: 8,
    height: 0.7
  })
  setSign(categorySign, WEEKLY_PUZZLE.category)

  makeBox({ x: BOARD_X, y: 6.7, z: BOARD_Z + 0.1 }, { x: 12.4, y: 5.05, z: 0.12 }, LOOK.gold, GLOW.gold, 1.7)
  makeBox({ x: BOARD_X, y: 6.7, z: BOARD_Z + 0.06 }, { x: 11.95, y: 4.6, z: 0.1 }, LOOK.ink, GLOW.ink, 0.45)

  makeBox({ x: BOARD_X, y: 3.35, z: BOARD_Z + 0.04 }, { x: 11.6, y: 1.05, z: 0.1 }, LOOK.ink, GLOW.gold, 0.5)
  makeBox({ x: BOARD_X, y: 3.82, z: BOARD_Z + 0.05 }, { x: 11.6, y: 0.07, z: 0.06 }, LOOK.gold, GLOW.gold, 2.0)
  makeBox({ x: BOARD_X, y: 2.88, z: BOARD_Z + 0.05 }, { x: 11.6, y: 0.07, z: 0.06 }, LOOK.gold, GLOW.gold, 2.0)
  bankSign = makeText({ x: BOARD_X, y: 3.35, z: BOARD_Z - 0.1 }, 2.4, LOOK.gold, {
    mono: true,
    width: 11,
    height: 0.75
  })
  setBankSign(0, 0, false)

  const rows = puzzleRows(WEEKLY_PUZZLE.answer)
  rows.forEach((row, rowIndex) => {
    const letters = row.split('')
    const width = letters.length * (TILE_W + TILE_GAP) - TILE_GAP
    const startX = BOARD_X - width / 2 + TILE_W / 2
    letters.forEach((letter, col) => {
      if (letter === ' ') return
      const x = startX + col * (TILE_W + TILE_GAP)
      const y = ROW_Y[rowIndex] ?? ROW_Y[ROW_Y.length - 1]
      tiles.push(makeTile(letter, x, y))
    })
  })
}

export function setBankSign(wip: number, nfts: number, solved: boolean) {
  const nftBit = nfts > 0 ? `  ·  ${nfts} NFT` : ''
  setSign(bankSign, solved ? `BANKED  ${wip} $WIP${nftBit}` : `BANK  ${wip} $WIP${nftBit}`, solved ? LOOK.mint : LOOK.gold)
}

export function refreshBoard(guessed: string) {
  if (guessed === lastGuessed && tiles.length > 0) return
  lastGuessed = guessed
  for (const tile of tiles) {
    const revealed = guessed.indexOf(tile.letter) !== -1
    paintSolid(tile.plate, LOOK.cream, revealed ? GLOW.cream : Color3.create(0.7, 0.55, 0.45), revealed ? 1.7 : 0.7)
    if (!TextShape.has(tile.textEntity)) continue
    const text = TextShape.getMutable(tile.textEntity)
    text.text = revealed ? tile.letter : ''
    text.fontSize = revealed ? 5.6 : 0.2
    text.textColor = LOOK.navy
  }
}

function makeTile(letter: string, x: number, y: number): Tile {
  const plate = engine.addEntity()
  Transform.create(plate, {
    position: { x, y, z: BOARD_Z },
    scale: { x: TILE_W, y: TILE_H, z: 0.1 },
    rotation: AUDIENCE_FACING
  })
  MeshRenderer.setBox(plate)
  paintSolid(plate, LOOK.cream, Color3.create(0.7, 0.55, 0.45), 0.7)

  const textEntity = engine.addEntity()
  Transform.create(textEntity, {
    position: { x, y, z: BOARD_Z - 0.08 },
    rotation: AUDIENCE_FACING
  })
  TextShape.create(textEntity, {
    text: '',
    fontSize: 5.6,
    font: 1,
    textAlign: ALIGN_CENTER,
    width: 1.5,
    height: 1.5,
    textColor: LOOK.navy,
    outlineWidth: 0.06,
    outlineColor: { r: 0.25, g: 0.16, b: 0.08 }
  })

  return { letter, plate, textEntity }
}
