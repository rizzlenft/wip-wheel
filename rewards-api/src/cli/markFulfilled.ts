import { markClaimFulfilled } from '../store.js'

const claimId = process.argv[2]
const note = process.argv.slice(3).join(' ') || 'fulfilled via CLI'

if (!claimId) {
  console.error('Usage: npm run fulfill:mark -- <claimId> [note]')
  process.exit(1)
}

const updated = markClaimFulfilled(claimId, note)
if (!updated) {
  console.error('Claim not found:', claimId)
  process.exit(1)
}
console.log('Marked fulfilled:', updated.claimId, updated.label, updated.wallet)
