#!/usr/bin/env node
/**
 * Push V1 Scene Storage env vars to Decentraland (World: scene.json worldConfiguration.name).
 * Requires: copy .env.storage.example → .env.storage with WIP_HOST_WALLET filled in.
 * Opens linker in browser to sign each set (or use Creator Hub → Storage → Environment).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env.storage')

function loadEnvFile(file) {
  const out = {}
  if (!fs.existsSync(file)) return out
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

function setEnv(key, value, extraArgs = []) {
  console.log(`\n→ storage env set ${key}`)
  const r = spawnSync(
    'npx',
    ['sdk-commands', 'storage', 'env', 'set', key, '--value', value, ...extraArgs],
    { cwd: root, stdio: 'inherit', shell: true }
  )
  if (r.status !== 0) {
    console.error(`Failed to set ${key} (exit ${r.status}). Sign with the World owner wallet in the browser.`)
    process.exit(r.status ?? 1)
  }
}

const env = loadEnvFile(envPath)
const wallet = (env.WIP_HOST_WALLET || env.HOST_WALLETS || '').trim().toLowerCase()

if (!wallet || !/^0x[a-f0-9]{40}$/.test(wallet)) {
  console.error('Missing WIP_HOST_WALLET in .env.storage')
  console.error('')
  console.error('  cp .env.storage.example .env.storage')
  console.error('  # edit .env.storage — paste your connected Explorer wallet')
  console.error('  npm run storage:v1')
  console.error('')
  console.error('Or set in Creator Hub → project → Storage / Environment variables.')
  process.exit(1)
}

const targetArg = process.argv.includes('--staging') ? ['--target', 'https://storage.decentraland.zone'] : []

console.log('Applying V1 storage for World in scene.json (rizzle.dcl.eth)')
console.log('Approve each transaction in the browser when prompted.\n')

setEnv('HOST_WALLETS', wallet, targetArg)
setEnv('ROUND_EVERY_SEC', env.ROUND_EVERY_SEC || '900', targetArg)
setEnv('LIVE_ROUND_MAX_SEC', env.LIVE_ROUND_MAX_SEC || '600', targetArg)
setEnv('PRIZE_TREASURY', env.PRIZE_TREASURY || '0xd9618C06458e98a831F503194cC8b62fB0384d45', targetArg)

const pk = (env.FULFILLER_PRIVATE_KEY || '').trim()
if (pk.startsWith('0x') && pk.length >= 66) {
  setEnv('FULFILLER_PRIVATE_KEY', pk, targetArg)
  console.log('\nSet FULFILLER_PRIVATE_KEY from .env.storage')
} else {
  console.log('\nSkipped FULFILLER_PRIVATE_KEY (not in .env.storage — OK if already on World)')
}

console.log('\nDone. Restart Preview or redeploy World, then check log:')
console.log('  [SERVER] host wallets configured: 1')
console.log('  [SERVER] live round every 900s')
