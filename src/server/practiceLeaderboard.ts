import { engine } from '@dcl/sdk/ecs'
import { AUTH_SERVER_PEER_ID } from '@dcl/sdk/network/message-bus-sync'
import { syncEntity } from '@dcl/sdk/network'
import { PracticeLeaderboard, SyncIds } from '../shared/schemas'

const TOP_N = 8

let boardEntity = engine.addEntity()
let ready = false

export function initPracticeLeaderboard(): void {
  if (ready) return
  ready = true
  PracticeLeaderboard.validateBeforeChange((value) => value.senderAddress === AUTH_SERVER_PEER_ID)
  PracticeLeaderboard.create(boardEntity, { updatedAt: 0, payload: '[]' })
  syncEntity(boardEntity, [PracticeLeaderboard.componentId], SyncIds.PracticeLeaderboard)
}

export function publishPracticeBoard(scores: Map<string, { name: string; score: number }>): void {
  if (!ready) return
  const rows = [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((r) => ({ name: r.name, score: r.score }))
  PracticeLeaderboard.getMutable(boardEntity).updatedAt = Date.now()
  PracticeLeaderboard.getMutable(boardEntity).payload = JSON.stringify(rows)
}

/** Read scores map from practiceScore — call after notePracticeSolve. */
export function snapshotFromEntries(entries: Map<string, { name: string; score: number }>): void {
  publishPracticeBoard(entries)
}
