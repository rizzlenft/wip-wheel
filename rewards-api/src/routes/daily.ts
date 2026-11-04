import { randomUUID } from 'node:crypto'
import type { Request, Response } from 'express'
import { authenticateRequest } from '../auth.js'
import {
  findClaimByIdempotency,
  findDailyClaim,
  insertClaim,
  loadCatalog,
  loadTreasury,
  rollDailyPrize,
  utcDay
} from '../store.js'
import type { ClaimStatus, DailySpinResponse, PrizeDef, PrizeType } from '../types.js'

function isGuestWallet(wallet: string): boolean {
  // Guests in Explorer typically have no 0x userId; scene should block earlier.
  // Still reject clearly fake/dev placeholders that are not addresses.
  return !/^0x[a-fA-F0-9]{40}$/.test(wallet)
}

function statusForType(type: string): ClaimStatus {
  if (type === 'none' || type === 'bonus_spin') return 'none_needed'
  // shoutout + paid types need a human (or later a bot)
  return 'pending_fulfillment'
}

function actionHint(prize: PrizeDef, winner: string, treasury: string): string {
  switch (prize.type as PrizeType) {
    case 'wearable':
      return `Transfer 1 DCL wearable from treasury ${treasury} → ${winner} on Polygon`
    case 'marketplace_credits':
      return `Finance/Bay: apply ${prize.credits || 0} Marketplace Credits to ${winner}`
    case 'crypto':
      return `Send ${prize.tokenAmount || '?'} ${prize.token || 'TOKEN'} on ${prize.chain || 'polygon'} from treasury ${treasury} → ${winner}`
    case 'shoutout':
      return `Host shoutout for ${winner}`
    case 'bonus_spin':
    case 'none':
      return 'No transfer needed'
    default:
      return 'Review claim'
  }
}

export async function postDailySpin(req: Request, res: Response) {
  const auth = await authenticateRequest(req)
  if (!auth.ok) {
    res.status(401).json({ ok: false, error: 'unauthorized', message: auth.reason })
    return
  }
  if (isGuestWallet(auth.wallet)) {
    res.status(403).json({ ok: false, error: 'guest_not_allowed', message: 'Connect a wallet to claim daily prizes.' })
    return
  }

  const idempotencyKey =
    (typeof req.headers['idempotency-key'] === 'string' && req.headers['idempotency-key']) ||
    (typeof req.body?.idempotencyKey === 'string' && req.body.idempotencyKey) ||
    ''

  if (idempotencyKey) {
    const prior = findClaimByIdempotency(idempotencyKey)
    if (prior) {
      const body: DailySpinResponse = {
        ok: true,
        claimId: prior.claimId,
        prizeId: prior.prizeId,
        label: prior.label,
        type: prior.type,
        wheelIndex: prior.wheelIndex,
        flavor: 'Replay of an identical request.',
        status: prior.status
      }
      res.json(body)
      return
    }
  }

  const day = utcDay()
  const existing = findDailyClaim(auth.wallet, day)
  if (existing) {
    // Bonus spin prize grants a second claim by voiding the unique day check via bonusCredits.
    // V0: one claim row per day unless the prior prize was bonus_spin and unused — keep simple:
    // one paid outcome per day. Bonus = flavor only until we add bonusCredits counter.
    res.status(409).json({
      ok: false,
      error: 'already_claimed',
      claimId: existing.claimId,
      label: existing.label,
      prizeId: existing.prizeId,
      wheelIndex: existing.wheelIndex
    })
    return
  }

  const catalog = loadCatalog()
  const prize = rollDailyPrize(catalog, day)
  if (!prize) {
    res.status(503).json({ ok: false, error: 'budget_exhausted', message: 'Daily prize pool is empty. Try tomorrow.' })
    return
  }

  const displayName =
    (typeof req.body?.displayName === 'string' && req.body.displayName.slice(0, 48)) || 'Player'
  const treasury = loadTreasury().address

  const record = insertClaim({
    claimId: randomUUID(),
    wallet: auth.wallet,
    displayName,
    utcDay: day,
    mode: 'daily',
    prizeId: prize.id,
    label: prize.label,
    type: prize.type,
    rail: prize.rail || null,
    wheelIndex: prize.wheelIndex,
    credits: prize.credits || 0,
    collection: prize.collection || null,
    chain: prize.chain || null,
    token: prize.token || null,
    tokenAmount: prize.tokenAmount || null,
    treasuryAddress: treasury,
    actionHint: actionHint(prize, auth.wallet, treasury),
    status: statusForType(prize.type),
    createdAt: new Date().toISOString(),
    fulfilledAt: null,
    fulfillmentNote: null,
    idempotencyKey: idempotencyKey || randomUUID()
  })

  const body: DailySpinResponse = {
    ok: true,
    claimId: record.claimId,
    prizeId: record.prizeId,
    label: record.label,
    type: record.type,
    wheelIndex: record.wheelIndex,
    flavor: prize.flavor,
    status: record.status
  }
  res.status(201).json(body)
}

export async function getDailyStatus(req: Request, res: Response) {
  const auth = await authenticateRequest(req)
  if (!auth.ok) {
    res.status(401).json({ ok: false, error: 'unauthorized', message: auth.reason })
    return
  }
  const day = utcDay()
  const existing = findDailyClaim(auth.wallet, day)
  res.json({
    ok: true,
    wallet: auth.wallet,
    utcDay: day,
    claimed: Boolean(existing),
    claim: existing
      ? {
          claimId: existing.claimId,
          prizeId: existing.prizeId,
          label: existing.label,
          wheelIndex: existing.wheelIndex,
          status: existing.status
        }
      : null
  })
}
