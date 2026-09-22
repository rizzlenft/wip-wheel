import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { guessLetter, puzzleHud } from './game'
import { ALPHABET } from './puzzle'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(Hud)
}

const MAGENTA = Color4.create(1, 0.3, 0.65, 1)
const GOLD = Color4.create(1, 0.82, 0.4, 1)
const PANEL = Color4.create(0.04, 0.012, 0.08, 0.94)
const KEY = Color4.create(0.22, 0.08, 0.32, 0.95)
const KEY_USED = Color4.create(0.1, 0.05, 0.14, 0.7)
const WHITE = Color4.create(1, 1, 1, 1)

const Hud = () => {
  const puzzle = puzzleHud()
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <UiEntity uiTransform={{ flexGrow: 1, width: 1 }} />
      {puzzle.canGuess ? letterPad(puzzle.guessed, puzzle.lastPrize) : <UiEntity uiTransform={{ width: 1, height: 1 }} />}
      <UiEntity uiTransform={{ width: 1, height: 72 }} />
    </UiEntity>
  )
}

function letterPad(guessed: string, lastPrize: string) {
  const row1 = ALPHABET.slice(0, 13)
  const row2 = ALPHABET.slice(13)
  const title = lastPrize ? `CALL A LETTER  ·  ${lastPrize}` : 'CALL A LETTER'
  return (
    <UiEntity
      uiTransform={{
        width: 720,
        height: 168,
        padding: { top: 8, bottom: 8 },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label
        value={title}
        fontSize={20}
        color={MAGENTA}
        textAlign="middle-center"
        uiTransform={{ width: 700, height: 28 }}
      />
      {letterRow(row1, guessed)}
      {letterRow(row2, guessed)}
    </UiEntity>
  )
}

function letterRow(row: string, guessed: string) {
  const keys = []
  for (let i = 0; i < row.length; i++) {
    const letter = row.charAt(i)
    const used = guessed.indexOf(letter) !== -1
    keys.push(letterKey(letter, used))
  }
  return (
    <UiEntity
      uiTransform={{
        width: 700,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {keys}
    </UiEntity>
  )
}

function letterKey(letter: string, used: boolean) {
  return (
    <UiEntity
      uiTransform={{
        width: 48,
        height: 48,
        margin: { left: 3, right: 3 }
      }}
      uiBackground={{ color: used ? KEY_USED : KEY }}
      onMouseDown={() => {
        if (!used) guessLetter(letter)
      }}
    >
      <Label value={letter} fontSize={22} color={used ? GOLD : WHITE} textAlign="middle-center" uiTransform={{ width: 48, height: 48 }} />
    </UiEntity>
  )
}
