#!/usr/bin/env node
/**
 * Read-only snapshot of prize treasury wearables (Polygon / DCL Lambdas v2).
 * Usage: node scripts/treasury-status.mjs [address]
 */
const DEFAULT = '0xd9618C06458e98a831F503194cC8b62fB0384d45'
const STAGING = '0x351764F8Ef0A80953F80885Fa0f7a7c5F097fC29'
const TREASURY = (process.argv[2] || process.env.PRIZE_TREASURY || DEFAULT).toLowerCase()
const rpc = process.env.POLYGON_RPC_URL || 'https://polygon-bor-rpc.publicnode.com'

async function balance(addr) {
  const res = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [addr, 'latest'] })
  })
  const body = await res.json()
  if (!body.result) return null
  return Number(BigInt(body.result)) / 1e18
}

const url = `https://peer.decentraland.org/lambdas/users/${TREASURY}/wearables?pageNum=1&pageSize=1000&includeDefinitions=true`
const res = await fetch(url)
if (!res.ok) {
  console.error('Lambdas API error', res.status, await res.text())
  process.exit(1)
}
const data = await res.json()
const elements = data.elements || []
let total = 0
const role = TREASURY === STAGING.toLowerCase() ? 'staging (Bay deposit)' : TREASURY === DEFAULT.toLowerCase() ? 'operating hot wallet' : 'custom'
console.log(`Treasury ${TREASURY} (${role})\n`)
const pol = await balance(TREASURY)
if (pol != null) console.log(`POL/MATIC: ${pol.toFixed(6)}\n`)
for (const el of elements) {
  const name = el.name || el.definition?.name || el.urn
  const amt = el.amount ?? el.individualData?.length ?? 0
  total += amt
  console.log(`${String(amt).padStart(3)}  ${name}  [${el.category}, ${el.rarity}]`)
}
console.log(`\nTotal wearable NFTs: ${total}`)
if (TREASURY === DEFAULT.toLowerCase()) {
  console.log(`Staging (Bay): ${STAGING} — run: npm run treasury-status -- ${STAGING}`)
}
