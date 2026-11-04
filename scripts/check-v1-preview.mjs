#!/usr/bin/env node
/**
 * Preflight before V1 Preview — solo or two-wallet.
 * Does not need a second wallet; confirms repo + art + week card.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function run(script) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', script)], {
    cwd: root,
    stdio: 'inherit'
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

const required = [
  'assets/Images/wheel-face.png',
  'assets/Images/wheel-face-live-4.png',
  'src/livePrizes.ts',
  'src/server/liveRound.ts',
  'design/v1-solo-playtest.md'
]

for (const rel of required) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) {
    console.error(`check-v1-preview: missing ${rel}`)
    process.exit(1)
  }
}

const liveSrc = fs.readFileSync(path.join(root, 'src/livePrizes.ts'), 'utf8')
if (!/LIVE_PRIZE_COUNT\s*=\s*4/.test(liveSrc)) {
  console.error('check-v1-preview: LIVE_PRIZE_COUNT must be 4 for Bay V1')
  process.exit(1)
}

console.log('check-v1-preview: art + modules OK')
run('verify-preview-path.mjs')
run('check-week-card.mjs')
console.log('')
console.log('Solo Preview: design/v1-solo-playtest.md')
console.log('Two wallets later: same doc § Two-client sync')
