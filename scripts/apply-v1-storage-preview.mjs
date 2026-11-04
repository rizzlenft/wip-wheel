#!/usr/bin/env node
/**
 * Push V1 env vars to the **local Preview** multiplayer server (localhost:8000).
 * Run while `npm run start` / Hub Preview is already running.
 *
 * World production vars (Hub / npm run storage:v1) do NOT apply to Preview — separate storage.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env.storage')
const PREVIEW_TARGET = ['--target', 'http://localhost:8000']

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

function setEnv(key, value) {
  console.log(`\n→ storage env set ${key} (Preview localhost:8000)`)
  const r = spawnSync(
    'npx',
    ['sdk-commands', 'storage', 'env', 'set', key, '--value', value, ...PREVIEW_TARGET],
    { cwd: root, stdio: 'inherit', shell: true }
  )
  if (r.status !== 0) {
    console.error(`Failed (exit ${r.status}). Is Preview running? Start npm run start first.`)
    process.exit(r.status ?? 1)
  }
}

const env = loadEnvFile(envPath)
const wallet = (env.WIP_HOST_WALLET || env.HOST_WALLETS || '').trim().toLowerCase()

if (!wallet || !/^0x[a-f0-9]{40}$/.test(wallet)) {
  console.error('Need .env.storage with WIP_HOST_WALLET=0x… (copy from .env.storage.example)')
  process.exit(1)
}

console.log('Preview storage — restart Preview after this completes.\n')

setEnv('HOST_WALLETS', wallet)
setEnv('ROUND_EVERY_SEC', env.ROUND_EVERY_SEC || '900')
setEnv('LIVE_ROUND_MAX_SEC', env.LIVE_ROUND_MAX_SEC || '600')
setEnv('PRIZE_TREASURY', env.PRIZE_TREASURY || '0xd9618C06458e98a831F503194cC8b62fB0384d45')

const pk = (env.FULFILLER_PRIVATE_KEY || '').trim()
if (pk.startsWith('0x') && pk.length >= 66) {
  setEnv('FULFILLER_PRIVATE_KEY', pk)
}

console.log('\nDone. Stop Preview (Ctrl+C) and start again. Log should show host wallets configured: 1')
