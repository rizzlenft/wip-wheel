/**
 * Always-on wearable fulfill API.
 * Scene Multiplayer Server POSTs here on WEARABLE wins (and retries while players are present).
 */
import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
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

const PORT = Number(process.env.PORT || 8790)
const SECRET = (process.env.FULFILL_SECRET || '').trim()

if (!SECRET) {
  console.error('FULFILL_SECRET is required')
  process.exit(1)
}
if (!process.env.FULFILLER_PRIVATE_KEY?.startsWith('0x')) {
  console.error('FULFILLER_PRIVATE_KEY is required')
  process.exit(1)
}

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function json(res: import('node:http').ServerResponse, status: number, body: unknown) {
  const raw = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(raw)
  })
  res.end(raw)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)

  if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
    json(res, 200, { ok: true, service: 'wip-wheel-fulfill' })
    return
  }

  if (req.method === 'POST' && url.pathname === '/v1/fulfill') {
    const auth = req.headers.authorization || ''
    if (auth !== `Bearer ${SECRET}`) {
      json(res, 401, { ok: false, error: 'unauthorized' })
      return
    }
    try {
      const raw = await readBody(req)
      const body = JSON.parse(raw) as {
        claimId?: string
        wallet?: string
        label?: string
        prizeType?: string
      }
      if (!body.claimId || !body.wallet) {
        json(res, 400, { ok: false, error: 'claimId and wallet required' })
        return
      }
      if (body.prizeType && body.prizeType !== 'wearable') {
        json(res, 400, { ok: false, error: 'only wearable supported' })
        return
      }
      console.log(`[fulfill] claim=${body.claimId} → ${body.wallet}`)
      const result = await fulfillWearable({
        claimId: body.claimId,
        wallet: body.wallet,
        label: body.label,
        prizeType: body.prizeType
      })
      console.log(
        `[fulfill] ok claim=${body.claimId} tx=${result.txHash}${result.alreadyDone ? ' (idempotent)' : ''}`
      )
      json(res, 200, result)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[fulfill] error', message)
      json(res, 500, { ok: false, error: message })
    }
    return
  }

  json(res, 404, { ok: false, error: 'not found' })
})

server.listen(PORT, () => {
  console.log(`[fulfill-worker] listening on :${PORT}`)
  console.log(`[fulfill-worker] POST /v1/fulfill  GET /health`)
})
