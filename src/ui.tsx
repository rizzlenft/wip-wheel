/**
 * Letter pad — restored to the layout that worked before the auth-server rewrite.
 *
 * What broke it (7 Oct): swapping to a centered full-screen root + screenInset:'interactable'
 * meant when canGuess flipped true we hid the objective strip and drew a pad that never
 * appeared on Explorer. 3D "CALL A LETTER" still painted. Revert to the proven flex column
 * (spacer → pad → bottom gutters), virtual 1920×1080, no interactable inset.
 */
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Input, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { isMobile } from '@dcl/sdk/platform'
import {
  guessLetter,
  hostControls,
  hostFlashBanner,
  hostOperatorHint,
  hudCopy,
  puzzleHud,
  roundClockHeading,
  roundClockText,
  sendHostEndLive,
  sendHostOpenLive,
  solvePuzzle
} from './game'
import { ALPHABET } from './puzzle'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(Hud, {
    virtualWidth: 1920,
    virtualHeight: 1080
  })
}

const MAGENTA = Color4.create(1, 0.3, 0.65, 1)
const GOLD = Color4.create(1, 0.82, 0.4, 1)
const PANEL = Color4.create(0.04, 0.012, 0.08, 0.94)
const STRIP = Color4.create(0.04, 0.012, 0.08, 0.82)
const KEY = Color4.create(0.22, 0.08, 0.32, 0.95)
const KEY_USED = Color4.create(0.1, 0.05, 0.14, 0.7)
const WHITE = Color4.create(1, 1, 1, 1)

let solveOpen = false
let solveClear = false
let solveDraft = ''

function commitSolve(phrase: string) {
  const text = (phrase || solveDraft).trim()
  if (!text) return
  solveOpen = false
  solveDraft = ''
  solveClear = true
  solvePuzzle(text)
}

const Hud = () => {
  const puzzle = puzzleHud()
  const copy = hudCopy()
  const mobile = isMobile()
  const round = roundClockText()
  const host = hostControls()
  const hostHint = hostOperatorHint()
  const hostFlash = hostFlashBanner()
  if (!puzzle.canGuess) solveOpen = false
  if (solveClear) solveClear = false

  // build-ui: full-canvas root MUST stay pointer-transparent always. Letter keys own
  // their small onMouseDown rects — never put handlers / block on this 100% wrapper
  // (symptom: world looks fine but pads/wheel never click). Idle vs letter only
  // changes children, not root pointer policy.
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        pointerFilter: 'none'
      }}
    >
      {round ? roundClock(round, mobile) : null}
      {hostFlash ? hostFlashStrip(hostFlash, mobile) : null}
      {hostHint ? hostSetupHint(hostHint, mobile) : null}
      {host.panel ? hostPanel(host, mobile) : null}
      {copy.status && !puzzle.canGuess
        ? objectiveStrip(copy.status, copy.live || copy.onWheel, mobile, copy.onWheel)
        : null}
      <UiEntity uiTransform={{ flexGrow: 1, width: 1, pointerFilter: 'none' }} />
      {puzzle.canGuess ? letterPad(puzzle.guessed, puzzle.lastPrize, mobile) : null}
      <UiEntity uiTransform={{ width: 1, height: mobile ? 96 : 72, pointerFilter: 'none' }} />
    </UiEntity>
  )
}

function roundClock(digits: string, mobile: boolean) {
  const w = mobile ? 640 : 520
  const heading = roundClockHeading()
  return (
    <UiEntity
      uiTransform={{
        width: w,
        margin: { top: mobile ? 12 : 18 },
        flexDirection: 'column',
        alignItems: 'center',
        pointerFilter: 'none'
      }}
    >
      <Label
        value={heading}
        fontSize={mobile ? 18 : 16}
        color={GOLD}
        textAlign="middle-center"
        uiTransform={{ width: w, height: mobile ? 24 : 22, pointerFilter: 'none' }}
      />
      <Label
        value={digits}
        fontSize={mobile ? 42 : 56}
        color={WHITE}
        textAlign="middle-center"
        uiTransform={{ width: w, height: mobile ? 52 : 64, pointerFilter: 'none' }}
      />
    </UiEntity>
  )
}

function hostFlashStrip(message: string, mobile: boolean) {
  const w = mobile ? 720 : 620
  const h = mobile ? 52 : 46
  return (
    <UiEntity
      uiTransform={{
        width: w,
        height: h,
        margin: { top: mobile ? 10 : 12 },
        justifyContent: 'center',
        alignItems: 'center',
        pointerFilter: 'none'
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label
        value={message}
        fontSize={mobile ? 20 : 18}
        color={MAGENTA}
        textAlign="middle-center"
        uiTransform={{ width: w - 24, height: h - 8, pointerFilter: 'none' }}
      />
    </UiEntity>
  )
}

function hostSetupHint(message: string, mobile: boolean) {
  const w = mobile ? 640 : 520
  return (
    <Label
      value={message}
      fontSize={mobile ? 14 : 13}
      color={GOLD}
      textAlign="middle-center"
      uiTransform={{
        width: w,
        height: mobile ? 36 : 32,
        margin: { top: mobile ? 6 : 8 },
        pointerFilter: 'none'
      }}
    />
  )
}

function hostPanel(host: ReturnType<typeof hostControls>, mobile: boolean) {
  const w = mobile ? 640 : 520
  const btnW = mobile ? 300 : 240
  const h = mobile ? 44 : 40
  const openColor = host.canOpen ? MAGENTA : KEY_USED
  const endColor = host.canEnd ? MAGENTA : KEY_USED
  return (
    <UiEntity
      uiTransform={{
        width: w,
        margin: { top: mobile ? 8 : 10 },
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        pointerFilter: 'none'
      }}
    >
      <UiEntity
        uiTransform={{
          width: btnW,
          height: h,
          margin: { right: 8 },
          justifyContent: 'center',
          alignItems: 'center'
        }}
        uiBackground={{ color: openColor }}
        onMouseDown={() => {
          if (host.canOpen) sendHostOpenLive()
        }}
      >
        <Label
          value="START LIVE"
          fontSize={mobile ? 18 : 16}
          color={WHITE}
          textAlign="middle-center"
          uiTransform={{ width: btnW, height: h }}
        />
      </UiEntity>
      <UiEntity
        uiTransform={{
          width: btnW,
          height: h,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        uiBackground={{ color: endColor }}
        onMouseDown={() => {
          if (host.canEnd) sendHostEndLive()
        }}
      >
        <Label
          value="END LIVE"
          fontSize={mobile ? 18 : 16}
          color={WHITE}
          textAlign="middle-center"
          uiTransform={{ width: btnW, height: h }}
        />
      </UiEntity>
    </UiEntity>
  )
}

function objectiveStrip(status: string, accent: boolean, mobile: boolean, onWheel = false) {
  const w = mobile ? (onWheel ? 1200 : 1100) : onWheel ? 980 : 860
  const h = mobile ? (onWheel ? 60 : 54) : onWheel ? 50 : 44
  return (
    <UiEntity
      uiTransform={{
        width: w,
        height: h,
        margin: { top: mobile ? 16 : 24 },
        justifyContent: 'center',
        alignItems: 'center',
        pointerFilter: 'none'
      }}
      uiBackground={{ color: STRIP }}
    >
      <Label
        value={status}
        fontSize={mobile ? (onWheel ? 26 : 24) : onWheel ? 22 : 20}
        color={accent ? MAGENTA : GOLD}
        textAlign="middle-center"
        uiTransform={{ width: w - 24, height: h - 8 }}
      />
    </UiEntity>
  )
}

function letterPad(guessed: string, lastPrize: string, mobile: boolean) {
  const row1 = ALPHABET.slice(0, 13)
  const row2 = ALPHABET.slice(13)
  // Top objective strip is hidden while the pad is up — put OPEN honesty here (Bay free-for-all).
  const title = lastPrize ? `LETTER IN PLAY  ·  OPEN  ·  ${lastPrize}` : 'LETTER IN PLAY  ·  OPEN'
  const padW = mobile ? 980 : 720
  const padH = mobile ? 280 : 220
  const rowW = padW - 20
  return (
    <UiEntity
      uiTransform={{
        width: padW,
        height: padH,
        padding: { top: 8, bottom: 8, left: 8, right: 8 },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{ color: PANEL }}
    >
      <Label
        value={title}
        fontSize={mobile ? 22 : 20}
        color={MAGENTA}
        textAlign="middle-center"
        uiTransform={{ width: rowW, height: 28 }}
      />
      {letterRow(row1, guessed, rowW, mobile)}
      {letterRow(row2, guessed, rowW, mobile)}
      {solveRow(rowW, mobile)}
    </UiEntity>
  )
}

function solveRow(rowW: number, mobile: boolean) {
  const h = mobile ? 52 : 44
  if (solveOpen) {
    const buttonW = mobile ? 160 : 140
    return (
      <UiEntity
        uiTransform={{
          width: rowW,
          height: h,
          margin: { top: 6 },
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Input
          placeholder="TYPE THE PHRASE"
          placeholderColor={GOLD}
          color={WHITE}
          fontSize={mobile ? 22 : 18}
          font="sans-serif"
          textAlign="middle-left"
          value={solveClear ? ' ' : ''}
          uiTransform={{ width: rowW - buttonW - 8, height: h }}
          uiBackground={{ color: KEY }}
          onChange={(value) => {
            solveDraft = value
          }}
          onSubmit={(value) => commitSolve(value)}
        />
        <UiEntity
          uiTransform={{
            width: buttonW,
            height: h,
            margin: { left: 8 },
            justifyContent: 'center',
            alignItems: 'center'
          }}
          uiBackground={{ color: MAGENTA }}
          onMouseDown={() => commitSolve(solveDraft)}
        >
          <Label
            value="SUBMIT"
            fontSize={mobile ? 22 : 18}
            color={WHITE}
            textAlign="middle-center"
            uiTransform={{ width: buttonW, height: h }}
          />
        </UiEntity>
      </UiEntity>
    )
  }
  return (
    <UiEntity
      uiTransform={{
        width: rowW,
        height: h,
        margin: { top: 6 },
        justifyContent: 'center',
        alignItems: 'center'
      }}
      uiBackground={{ color: KEY }}
      onMouseDown={() => {
        solveOpen = true
      }}
    >
      <Label
        value="SOLVE THE PUZZLE"
        fontSize={mobile ? 22 : 18}
        color={GOLD}
        textAlign="middle-center"
        uiTransform={{ width: rowW, height: h }}
      />
    </UiEntity>
  )
}

function letterRow(row: string, guessed: string, rowW: number, mobile: boolean) {
  const keys = []
  for (let i = 0; i < row.length; i++) {
    const letter = row.charAt(i)
    const used = guessed.indexOf(letter) !== -1
    keys.push(letterKey(letter, used, mobile))
  }
  return (
    <UiEntity
      uiTransform={{
        width: rowW,
        height: mobile ? 72 : 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {keys}
    </UiEntity>
  )
}

function letterKey(letter: string, used: boolean, mobile: boolean) {
  const size = mobile ? 58 : 48
  return (
    <UiEntity
      key={letter}
      uiTransform={{
        width: size,
        height: size,
        margin: { left: 3, right: 3 }
      }}
      uiBackground={{ color: used ? KEY_USED : KEY }}
      onMouseDown={() => {
        if (!used) guessLetter(letter)
      }}
    >
      <Label
        value={letter}
        fontSize={mobile ? 26 : 22}
        color={used ? GOLD : WHITE}
        textAlign="middle-center"
        uiTransform={{ width: size, height: size }}
      />
    </UiEntity>
  )
}
