#!/usr/bin/env node
/**
 * Write scene.json spawnPoints from src/layout.ts SPAWN_DOC formulas.
 * Use after Hub overwrites spawn, or after editing SPAWN_DOC.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'src/layout.ts'), 'utf8')

const DAILY_PAD = {
  x: Number(src.match(/export const DAILY_PAD = \{ x: ([\d.]+), z: ([\d.]+) \}/)?.[1]),
  z: Number(src.match(/export const DAILY_PAD = \{ x: ([\d.]+), z: ([\d.]+) \}/)?.[2])
}
const BOARD = {
  x: Number(src.match(/export const BOARD = \{ x: ([\d.]+), z: ([\d.]+) \}/)?.[1])
}
const panelY = Number(src.match(/DAILY_SIGN_PANEL = \{[^}]*centerY: ([\d.]+)/)?.[1] ?? 1.45)

const spawnSlice = src.slice(src.indexOf('export const SPAWN_DOC'))
const xBand = Number(spawnSlice.match(/xBand:\s*([\d.]+)/)?.[1])
const zBand = Number(spawnSlice.match(/zBand:\s*([\d.]+)/)?.[1])
const xLiteral = spawnSlice.match(/\bx:\s*([\d.]+)/)
const zLiteral = spawnSlice.match(/\bz:\s*([\d.]+)/)
const xMinus = Number(spawnSlice.match(/x:\s*DAILY_PAD\.x(?:\s*-\s*([\d.]+))?/)?.[1] ?? 0)
const zMinus = Number(spawnSlice.match(/z:\s*DAILY_PAD\.z\s*-\s*([\d.]+)/)?.[1])
const camY = Number(spawnSlice.match(/cameraTarget:[\s\S]*?y:\s*([\d.]+)/)?.[1])
const camZ = Number(spawnSlice.match(/cameraTarget:[\s\S]*?z:\s*([\d.]+)/)?.[1])
const camXLiteral = spawnSlice.match(/cameraTarget:[\s\S]*?\bx:\s*([\d.]+)/)

const x = xLiteral ? Number(xLiteral[1]) : DAILY_PAD.x - xMinus
const z = zLiteral ? Number(zLiteral[1]) : DAILY_PAD.z - zMinus
const cameraTarget = {
  x: camXLiteral ? Number(camXLiteral[1]) : (DAILY_PAD.x + BOARD.x) / 2,
  y: camY,
  z: camZ
}

const scenePath = join(root, 'scene.json')
const scene = JSON.parse(readFileSync(scenePath, 'utf8'))
scene.spawnPoints = [
  {
    name: 'audience',
    default: true,
    position: {
      x: [Number((x - xBand).toFixed(2)), Number((x + xBand).toFixed(2))],
      y: [0, 0],
      z: [Number((z - zBand).toFixed(2)), Number((z + zBand).toFixed(2))]
    },
    cameraTarget: {
      x: Number(cameraTarget.x.toFixed(2)),
      y: cameraTarget.y,
      z: cameraTarget.z
    }
  }
]

writeFileSync(scenePath, JSON.stringify(scene, null, 2) + '\n')
console.log('sync-spawn-from-layout: wrote scene.json spawnPoints from SPAWN_DOC')
console.log(JSON.stringify(scene.spawnPoints[0], null, 2))
console.log('(panelY unused check)', panelY)
