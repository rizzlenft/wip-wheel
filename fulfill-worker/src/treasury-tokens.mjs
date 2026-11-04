import { readFileSync, existsSync } from 'node:fs'

const TREASURY = process.env.PRIZE_TREASURY || '0xd9618C06458e98a831F503194cC8b62fB0384d45'
const ledgerPath = process.env.SENT_LEDGER || './sent-urns.json'
const sent = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : []

const url = `https://peer.decentraland.org/lambdas/users/${TREASURY}/wearables?pageNum=1&pageSize=1000`
const res = await fetch(url)
if (!res.ok) throw new Error(`Lambdas ${res.status}`)
const data = await res.json()
const flat = []
for (const el of data.elements || []) {
  for (const ind of el.individualData || []) {
    flat.push({ urn: ind.id, name: el.name, tokenId: ind.tokenId })
  }
}
console.log(`Treasury tokens: ${flat.length}, already sent (ledger): ${sent.length}`)
for (const t of flat) {
  const mark = sent.includes(t.urn) ? ' [sent]' : ''
  console.log(`${t.urn}${mark}`)
}
