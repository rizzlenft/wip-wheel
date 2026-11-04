import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { getAllClaims, getCatalog, getPending, postFulfill } from './routes/admin.js'
import { getDailyStatus, postDailySpin } from './routes/daily.js'
import { loadTreasury } from './store.js'

loadDotEnv()

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(
  cors({
    origin: true,
    exposedHeaders: ['*']
  })
)
app.use(express.json({ limit: '32kb' }))

app.get('/health', (_req, res) => {
  const treasury = loadTreasury()
  res.json({
    ok: true,
    service: 'wip-wheel-rewards',
    devAuthBypass: process.env.DEV_AUTH_BYPASS === 'true',
    prizeTreasury: treasury.address,
    time: new Date().toISOString()
  })
})

app.get('/v1/treasury', (_req, res) => {
  res.json({ ok: true, treasury: loadTreasury() })
})

app.get('/v1/catalog', getCatalog)
app.get('/v1/daily/status', (req, res) => void getDailyStatus(req, res))
app.post('/v1/daily/spin', (req, res) => void postDailySpin(req, res))

app.get('/v1/admin/pending', getPending)
app.get('/v1/admin/claims', getAllClaims)
app.post('/v1/admin/fulfill', postFulfill)

app.listen(port, '0.0.0.0', () => {
  console.log(`[rewards-api] listening on 0.0.0.0:${port} dataDir=${process.env.DATA_DIR || 'default'}`)
  if (process.env.DEV_AUTH_BYPASS === 'true') {
    console.warn('[rewards-api] DEV_AUTH_BYPASS=true — do not expose this to the public internet')
  }
})

function loadDotEnv() {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env')
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!(key in process.env)) process.env[key] = value
  }
}
