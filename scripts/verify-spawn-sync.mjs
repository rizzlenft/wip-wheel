#!/usr/bin/env node
/**
 * Fail if scene.json spawnPoints drift from src/layout.ts SPAWN_DOC
 * (Creator Hub often rewrites scene.json — including bad y < 0).
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readSpawnDoc() {
  const src = readFileSync(join(root, 'src/layout.ts'), 'utf8')
  const padX = Number(src.match(/export const DAILY_PAD = \{ x: ([\d.]+)/)?.[1])
  const padZ = Number(src.match(/export const DAILY_PAD = \{ x: [\d.]+, z: ([\d.]+)/)?.[1])
  const boardX = Number(src.match(/export const BOARD = \{ x: ([\d.]+)/)?.[1])
  // SPAWN_DOC is derived — evaluate the same formulas as layout.ts comments/code.
  const spawnBlock = src.slice(src.indexOf('export const SPAWN_DOC'), src.indexOf('export const SPAWN_DOC') + 400)
  const xLiteral = spawnBlock.match(/\bx:\s*([\d.]+)/)
  const zLiteral = spawnBlock.match(/\bz:\s*([\d.]+)/)
  const xOff = xLiteral
    ? Number(xLiteral[1])
    : spawnBlock.includes('DAILY_PAD.x -')
      ? padX - Number(spawnBlock.match(/DAILY_PAD\.x - ([\d.]+)/)?.[1] ?? 0)
      : /x:\s*DAILY_PAD\.x\b/.test(spawnBlock)
        ? padX
        : Number(spawnBlock.match(/x:\s*([\d.]+)/)?.[1])
  const zOff = zLiteral
    ? Number(zLiteral[1])
    : spawnBlock.includes('DAILY_PAD.z -')
      ? padZ - Number(spawnBlock.match(/DAILY_PAD\.z - ([\d.]+)/)?.[1] ?? 0)
      : Number(spawnBlock.match(/z:\s*([\d.]+)/)?.[1])
  const xBand = Number(spawnBlock.match(/xBand:\s*([\d.]+)/)?.[1])
  const zBand = Number(spawnBlock.match(/zBand:\s*([\d.]+)/)?.[1])
  const camY = Number(spawnBlock.match(/cameraTarget:[\s\S]*?y:\s*([\d.]+)/)?.[1])
  const camZ = Number(spawnBlock.match(/cameraTarget:[\s\S]*?z:\s*([\d.]+)/)?.[1])
  const camXLiteral = spawnBlock.match(/cameraTarget:[\s\S]*?\bx:\s*([\d.]+)/)
  const camX = camXLiteral ? Number(camXLiteral[1]) : (padX + boardX) / 2
  return {
    x: xOff,
    z: zOff,
    xBand,
    zBand,
    cameraTarget: { x: camX, y: camY, z: camZ }
  }
}

function mid(range) {
  return (range[0] + range[1]) / 2
}

const scene = JSON.parse(readFileSync(join(root, 'scene.json'), 'utf8'))
const sp = scene.spawnPoints?.[0]
if (!sp) {
  console.error('verify-spawn-sync: no spawnPoints[0] in scene.json')
  process.exit(1)
}

const doc = readSpawnDoc()
const errors = []

const y0 = sp.position.y[0]
const y1 = sp.position.y[1]
if (y0 < 0 || y1 < 0) {
  errors.push(`spawn y is ${y0}…${y1} (must be ≥ 0 — Hub sometimes writes y=-1.25)`)
}

const expectX0 = doc.x - doc.xBand
const expectX1 = doc.x + doc.xBand
const expectZ0 = doc.z - doc.zBand
const expectZ1 = doc.z + doc.zBand
const tol = 0.15

function near(a, b) {
  return Math.abs(a - b) <= tol
}

if (!near(sp.position.x[0], expectX0) || !near(sp.position.x[1], expectX1)) {
  errors.push(
    `spawn x range [${sp.position.x[0]}, ${sp.position.x[1]}] ≠ SPAWN_DOC [${expectX0}, ${expectX1}] (Hub overwrite?)`
  )
}
if (!near(sp.position.z[0], expectZ0) || !near(sp.position.z[1], expectZ1)) {
  errors.push(
    `spawn z range [${sp.position.z[0]}, ${sp.position.z[1]}] ≠ SPAWN_DOC [${expectZ0}, ${expectZ1}]`
  )
}
if (!near(sp.cameraTarget.x, doc.cameraTarget.x) || !near(sp.cameraTarget.y, doc.cameraTarget.y) || !near(sp.cameraTarget.z, doc.cameraTarget.z)) {
  errors.push(
    `cameraTarget ${JSON.stringify(sp.cameraTarget)} ≠ SPAWN_DOC ${JSON.stringify(doc.cameraTarget)}`
  )
}

console.log('verify-spawn-sync')
console.log('  SPAWN_DOC', JSON.stringify(doc))
console.log('  scene.json mid', {
  x: mid(sp.position.x),
  y: mid(sp.position.y),
  z: mid(sp.position.z),
  cameraTarget: sp.cameraTarget
})

if (errors.length) {
  console.error('\nFAIL — Hub/scene.json drifted from layout.ts SPAWN_DOC:\n')
  for (const e of errors) console.error('  •', e)
  console.error('\nSee design/layout-spawn-desync.md')
  console.error('Fix: mirror SPAWN_DOC into scene.json (y must be 0), or update SPAWN_DOC on purpose then mirror.\n')
  process.exit(1)
}

console.log('OK: scene.json spawn matches SPAWN_DOC (y ≥ 0)')
