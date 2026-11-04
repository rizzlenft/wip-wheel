import type { Request, Response } from 'express'
import { requireAdmin } from '../auth.js'
import { inventorySnapshot, listPendingClaims, loadCatalog, loadClaims, loadTreasury, markClaimFulfilled } from '../store.js'

export function getPending(req: Request, res: Response) {
  if (!requireAdmin(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized', message: 'admin token required' })
    return
  }
  res.json({ ok: true, pending: listPendingClaims() })
}

export function getAllClaims(req: Request, res: Response) {
  if (!requireAdmin(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized', message: 'admin token required' })
    return
  }
  res.json({ ok: true, claims: loadClaims() })
}

export function postFulfill(req: Request, res: Response) {
  if (!requireAdmin(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized', message: 'admin token required' })
    return
  }
  const claimId = typeof req.body?.claimId === 'string' ? req.body.claimId : ''
  const note = typeof req.body?.note === 'string' ? req.body.note : ''
  if (!claimId) {
    res.status(400).json({ ok: false, error: 'bad_request', message: 'claimId required' })
    return
  }
  const updated = markClaimFulfilled(claimId, note)
  if (!updated) {
    res.status(404).json({ ok: false, error: 'bad_request', message: 'claim not found' })
    return
  }
  res.json({ ok: true, claim: updated })
}

export function getCatalog(_req: Request, res: Response) {
  const treasury = loadTreasury()
  res.json({
    ok: true,
    treasury: {
      chain: treasury.chain,
      label: treasury.label,
      address: treasury.address,
      accepts: treasury.accepts
    },
    prizes: loadCatalog().map((p) => ({
      id: p.id,
      label: p.label,
      type: p.type,
      weight: p.weight,
      evUsd: p.evUsd,
      wheelIndex: p.wheelIndex,
      dailyMax: p.dailyMax
    })),
    inventory: inventorySnapshot()
  })
}
