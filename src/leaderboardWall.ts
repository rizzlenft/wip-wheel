import { engine } from '@dcl/sdk/ecs'
import { BACKDROP } from './layout'
import { LOOK, makeText, setSign } from './look'
import { PracticeLeaderboard } from './shared/schemas'

type EntityRef = ReturnType<typeof engine.addEntity>

let title: EntityRef | null = null
let lines: EntityRef[] = []
let lastPayload = ''

export function setupLeaderboardWall() {
  const x = BACKDROP.x - 5.2
  const y = 3.2
  const z = BACKDROP.z + 0.15
  title = makeText({ x, y: y + 1.1, z }, 1.2, LOOK.gold, {
    serif: true,
    width: 4.5,
    height: 0.45
  })
  setSign(title, 'WEEKLY SOLVES', LOOK.gold)
  lines.length = 0
  for (let i = 0; i < 6; i++) {
    const line = makeText({ x, y: y - i * 0.38, z }, 0.95, LOOK.cream, {
      width: 4.8,
      height: 0.32
    })
    setSign(line, '—', LOOK.cream)
    lines.push(line)
  }
  engine.addSystem(syncLeaderboardSystem)
}

function syncLeaderboardSystem() {
  for (const [entity, board] of engine.getEntitiesWith(PracticeLeaderboard)) {
    void entity
    if (board.payload === lastPayload) return
    lastPayload = board.payload
    paint(board.payload)
    return
  }
}

function paint(payload: string) {
  let rows: { name: string; score: number }[] = []
  try {
    rows = JSON.parse(payload) as { name: string; score: number }[]
  } catch {
    rows = []
  }
  for (let i = 0; i < lines.length; i++) {
    const row = rows[i]
    const text = row ? `${i + 1}. ${row.name}  ·  ${row.score}` : '—'
    setSign(lines[i], text, row ? LOOK.cream : LOOK.lilac)
  }
}
