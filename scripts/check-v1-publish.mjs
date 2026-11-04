#!/usr/bin/env node
/**
 * Pre-publish gate for V1 Bay build — run before `npm run deploy`.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function run(npmScript) {
  const r = spawnSync('npm', ['run', npmScript], { cwd: root, stdio: 'inherit', shell: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('=== V1 publish preflight ===\n')
run('verify:v1-preview')
run('build')

const scene = JSON.parse(fs.readFileSync(path.join(root, 'scene.json'), 'utf8'))
if (!scene.worldConfiguration?.name) {
  console.error('check-v1-publish: scene.json missing worldConfiguration.name')
  process.exit(1)
}
if (!scene.authoritativeMultiplayer) {
  console.error('check-v1-publish: authoritativeMultiplayer must be true')
  process.exit(1)
}

const tracked = spawnSync('git', ['ls-files', '--error-unmatch', 'assets/Images/wheel-face-live-4.png'], {
  cwd: root,
  encoding: 'utf8'
})
if (tracked.status !== 0) {
  console.error(
    'check-v1-publish: assets/Images/wheel-face-live-4.png must be git-tracked or World deploys a white wheel (runtime texture missing).'
  )
  console.error('  git add assets/Images/wheel-face-live-4.png && git commit')
  process.exit(1)
}

console.log('\n=== Scene Storage (set in Creator Hub before deploy) ===')
console.log('Required for host demos:')
console.log('  HOST_WALLETS=0xYourWallet[,0xCoHost...]')
console.log('Recommended for Bay / Meetup:')
console.log('  ROUND_EVERY_SEC=900          (auto live every 15m; optional if you host manually)')
console.log('  LIVE_ROUND_MAX_SEC=600       (10m live window)')
console.log('For wearable backpack on daily + live solve:')
console.log('  FULFILLER_PRIVATE_KEY=...')
console.log('  PRIZE_TREASURY=0x...')
console.log('\nManual gate: design/v1-pre-publish-audit.md + design/v1-deploy-runbook.md')
console.log(`World target: ${scene.worldConfiguration.name}`)
console.log('\ncheck-v1-publish: automated checks OK — complete manual audit before deploy')
