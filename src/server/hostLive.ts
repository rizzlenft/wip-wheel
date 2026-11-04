import { EnvVar } from '@dcl/sdk/server'
import { isWalletAddress } from '../shared/dailyCatalog'

let cachedHosts: Set<string> | null = null
let cachedRaw = ''

/**
 * Operator allowlist from Scene Storage. Comma-separated lowercase 0x addresses.
 * Only wallets on this list may hostOpenLive / hostEndLive. You control the list
 * in Creator Hub — add co-hosts by appending addresses (no republish).
 */
export async function loadHostWallets(): Promise<Set<string>> {
  const raw = ((await EnvVar.get('HOST_WALLETS')) || '').trim()
  if (raw === cachedRaw && cachedHosts) return cachedHosts
  cachedRaw = raw
  const set = new Set<string>()
  for (const part of raw.split(',')) {
    const w = part.trim().toLowerCase()
    if (isWalletAddress(w)) set.add(w)
  }
  cachedHosts = set
  return set
}

export async function isHostWallet(address: string): Promise<boolean> {
  const w = (address || '').toLowerCase()
  if (!isWalletAddress(w)) return false
  const hosts = await loadHostWallets()
  return hosts.has(w)
}

export async function logHostConfig(): Promise<void> {
  const hosts = await loadHostWallets()
  if (hosts.size === 0) {
    console.log('[SERVER] HOST_WALLETS empty — host START/END live disabled (set Scene Storage)')
  } else {
    console.log(`[SERVER] host wallets configured: ${hosts.size}`)
  }
}
