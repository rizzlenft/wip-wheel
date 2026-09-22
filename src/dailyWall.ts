import { AudioSource, Billboard, engine, TextShape } from '@dcl/sdk/ecs'
import { DAILY_PRIZES } from './prizes'
import { bindUse } from './interact'
import { GLOW, LOOK, makeBox, makeColliderBox, makeRule, makeText, marqueeRect, paintSolid, setSign } from './look'

type EntityRef = ReturnType<typeof engine.addEntity>

const X = 3.15
const Z = 30.32
const W = 5.6

type Reel = {
  elapsed: number
  duration: number
  winner: string
  label: string
}

let screen: EntityRef | null = null
let jumboKicker: EntityRef | null = null
let jumboPrize: EntityRef | null = null
let jumboWinner: EntityRef | null = null
let dailyButton: EntityRef | null = null
let lastDailyNonce = 0
let reel: Reel | null = null
let landedUntil = 0
let pulse = 0
let onSpin: (() => void) | null = null

export function setupDailyWall(startSpin: () => void) {
  onSpin = startSpin
  buildWall()
  buildPodium()
  bindUse(dailyButton, 'Daily prize', fire, 5)
  setIdle()
  engine.addSystem(dailyReelSystem)
}

export function playDailyReel(nonce: number, _prizeIndex: number, winner: string, prizeLabel: string) {
  if (nonce <= lastDailyNonce) return
  lastDailyNonce = nonce
  reel = { elapsed: 0, duration: 2.2, winner, label: prizeLabel }
  setSign(jumboKicker, 'SPINNING', LOOK.gold)
  setSign(jumboWinner, winner.toUpperCase(), LOOK.cream)
  if (dailyButton) AudioSource.playSound(dailyButton, 'assets/Audio/lever-sound.mp3')
}

export function isDailyReeling(): boolean {
  return reel !== null || landedUntil > 0
}

function buildWall() {
  makeBox({ x: X, y: 7.2, z: Z + 0.06 }, { x: 6.1, y: 14.0, z: 0.08 }, LOOK.ink, GLOW.screen, 0.55)
  makeBox({ x: X - 3.12, y: 7.2, z: Z + 0.1 }, { x: 0.18, y: 14.2, z: 0.16 }, LOOK.gold, GLOW.gold, 2.4)
  makeBox({ x: X + 3.12, y: 7.2, z: Z + 0.1 }, { x: 0.18, y: 14.2, z: 0.16 }, LOOK.gold, GLOW.gold, 2.4)
  makeBox({ x: X, y: 14.2, z: Z + 0.1 }, { x: 6.4, y: 0.18, z: 0.16 }, LOOK.gold, GLOW.gold, 2.4)
  makeBox({ x: X, y: 0.22, z: Z + 0.1 }, { x: 6.4, y: 0.18, z: 0.16 }, LOOK.gold, GLOW.gold, 1.6)
  marqueeRect(X, 7.2, Z + 0.14, 6.35, 14.05, 0.5)
  screen = makeBox({ x: X, y: 8.6, z: Z + 0.02 }, { x: 5.5, y: 6.4, z: 0.06 }, LOOK.ink, GLOW.gold, 0.28)

  const title = makeText({ x: X, y: 12.55, z: Z - 0.12 }, 4.2, LOOK.gold, { serif: true, width: W, height: 1.3 })
  setSign(title, 'DAILY')
  makeRule(X, 11.7, Z - 0.02, 4.6, LOOK.gold, GLOW.gold, 2.2)

  jumboKicker = makeText({ x: X, y: 10.85, z: Z - 0.12 }, 1.9, LOOK.gold, { width: W, height: 0.55 })
  jumboPrize = makeText({ x: X, y: 8.55, z: Z - 0.14 }, 6.8, LOOK.cream, { serif: true, width: W, height: 2.2 })
  jumboWinner = makeText({ x: X, y: 6.4, z: Z - 0.12 }, 2.1, LOOK.cream, { width: W, height: 0.65 })

  makeRule(X, 5.45, Z - 0.02, 4.6, LOOK.gold, GLOW.gold, 1.6)
  const table = makeText({ x: X, y: 4.55, z: Z - 0.12 }, 2.15, LOOK.cream, { width: W, height: 0.65 })
  setSign(table, '5 · 10 · 25 · 50')
  const table2 = makeText({ x: X, y: 3.7, z: Z - 0.12 }, 1.8, LOOK.gold, { width: W, height: 0.5 })
  setSign(table2, 'SHOUTOUT  ·  BONUS')
  const note = makeText({ x: X, y: 2.4, z: Z - 0.12 }, 1.7, LOOK.cream, { width: W, height: 0.55 })
  setSign(note, 'JACKPOT  ·  THURSDAY')
}

function buildPodium() {
  makeBox({ x: 3.15, y: 0.16, z: 26.2 }, { x: 2.5, y: 0.06, z: 2.5 }, LOOK.gold, GLOW.gold, 2.1)
  makeBox({ x: 3.15, y: 0.3, z: 26.2 }, { x: 1.85, y: 0.24, z: 1.85 }, LOOK.gold, GLOW.gold, 1.3)
  dailyButton = makeColliderBox({ x: 3.15, y: 0.95, z: 26.2 }, { x: 1.65, y: 1.3, z: 1.65 }, LOOK.gold, GLOW.gold, 1.8)
  AudioSource.create(dailyButton, { audioClipUrl: 'assets/Audio/button-sound.mp3', playing: false, volume: 0.9 })
  const label = makeText({ x: 3.15, y: 2.25, z: 26.2 }, 2.0, LOOK.gold, { serif: true, width: 3.8, height: 0.7 })
  Billboard.create(label, { billboardMode: 2 })
  setSign(label, 'DAILY')
}

function fire() {
  if (onSpin) onSpin()
}

function setIdle() {
  setSign(jumboKicker, 'YOUR PRIZE', LOOK.gold)
  setSign(jumboPrize, 'READY', LOOK.cream)
  setSign(jumboWinner, 'STAND ON THE GOLD PAD', LOOK.cream)
  if (screen) paintSolid(screen, LOOK.ink, GLOW.gold, 0.28)
}

function dailyReelSystem(dt: number) {
  pulse += dt
  if (!jumboPrize) return

  if (reel) {
    reel.elapsed += dt
    const tick = DAILY_PRIZES[Math.floor(reel.elapsed * 14) % DAILY_PRIZES.length]
    setSign(jumboPrize, tick.label, LOOK.gold)
    if (screen) paintSolid(screen, LOOK.ink, GLOW.gold, 0.8 + Math.sin(reel.elapsed * 18) * 0.7)
    if (reel.elapsed >= reel.duration) {
      const done = reel
      reel = null
      landedUntil = 3.8
      setSign(jumboKicker, 'YOU WON', LOOK.mint)
      setSign(jumboPrize, done.label, LOOK.mint)
      setSign(jumboWinner, done.winner.toUpperCase(), LOOK.cream)
      if (screen) paintSolid(screen, LOOK.ink, GLOW.mint, 1.8)
      if (dailyButton) AudioSource.playSound(dailyButton, winClip(done.label))
    }
    return
  }

  if (landedUntil > 0) {
    landedUntil -= dt
    const on = Math.floor(pulse * 4) % 2 === 0
    if (screen) paintSolid(screen, LOOK.ink, on ? GLOW.mint : GLOW.gold, on ? 1.9 : 0.8)
    if (TextShape.has(jumboPrize)) {
      TextShape.getMutable(jumboPrize).textColor = on ? LOOK.mint : LOOK.cream
    }
    if (landedUntil <= 0) setIdle()
    return
  }

  if (screen) paintSolid(screen, LOOK.ink, GLOW.gold, 0.25 + Math.sin(pulse * 2) * 0.1)
}

function winClip(label: string) {
  if (label === 'TRY AGAIN') return 'assets/Audio/gameover.mp3'
  return 'assets/Audio/wingame.mp3'
}
