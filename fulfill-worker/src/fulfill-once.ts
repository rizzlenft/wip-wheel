/** Manual one-shot (legacy). Prefer the always-on `npm start` autopilot server. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fulfillWearable } from './transfer.js'

function loadEnvFile(path: string) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i <= 0) continue
    const key = t.slice(0, i).trim()
    const val = t.slice(i + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvFile('.env')

const pendingFile = process.env.PENDING_FILE || './pendingFulfillment.json'
if (!existsSync(pendingFile)) {
  console.error(`Missing ${pendingFile}`)
  process.exit(1)
}

type Row = { claimId: string; wallet: string; prizeType: string; status: string; txHash?: string; fulfilledUrn?: string }
const pending = JSON.parse(readFileSync(pendingFile, 'utf8')) as Row[]
const claim = pending.find((c) => c.prizeType === 'wearable' && c.status === 'pending_fulfillment')
if (!claim) {
  console.log('No pending wearable claims.')
  process.exit(0)
}

const result = await fulfillWearable({ claimId: claim.claimId, wallet: claim.wallet, prizeType: 'wearable' })
claim.status = 'fulfilled'
claim.txHash = result.txHash
claim.fulfilledUrn = result.urn
writeFileSync(pendingFile, JSON.stringify(pending, null, 2))
console.log('Tx:', result.txHash)
console.log('Updated', pendingFile)
