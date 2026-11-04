import { listPendingClaims } from '../store.js'

const pending = listPendingClaims()
if (pending.length === 0) {
  console.log('No pending fulfillment rows.')
  process.exit(0)
}

console.log(`Pending claims: ${pending.length}\n`)
for (const c of pending) {
  console.log('---')
  console.log(`claimId:   ${c.claimId}`)
  console.log(`when:      ${c.createdAt}  (${c.utcDay})`)
  console.log(`winner:    ${c.displayName}  ${c.wallet}`)
  console.log(`prize:     ${c.type} / ${c.label}  (${c.prizeId})${c.rail ? `  rail=${c.rail}` : ''}`)
  if (c.type === 'crypto' && c.token) {
    console.log(`crypto:    ${c.tokenAmount || '?'} ${c.token} on ${c.chain || 'polygon'}`)
  }
  if (c.type === 'marketplace_credits' && c.credits) {
    console.log(`credits:   ${c.credits}`)
  }
  if (c.collection) console.log(`collection:${c.collection}  chain=${c.chain || 'polygon'}`)
  if (c.treasuryAddress) console.log(`treasury:  ${c.treasuryAddress}`)
  console.log(`action:    ${c.actionHint || '(none)'}`)
  console.log(`mark done: npm run fulfill:mark -- ${c.claimId} "tx or note"`)
}
console.log('---')
