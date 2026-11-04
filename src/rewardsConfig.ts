/**
 * Rewards API wiring for the scene.
 *
 * Keep REWARDS_API_ENABLED false until the API is deployed and tested.
 * Local Hub preview can use DEV_AUTH_BYPASS on the API + X-Dev-Wallet.
 */
export const REWARDS_API_ENABLED = false

/** Public HTTPS base URL of rewards-api (no trailing slash). */
export const REWARDS_API_BASE_URL = 'http://127.0.0.1:8787'

/**
 * Only used when the API is in DEV_AUTH_BYPASS mode.
 * In production Explorer, signedFetch headers identify the wallet — leave empty.
 */
export const REWARDS_DEV_WALLET = ''
