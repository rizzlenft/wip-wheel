/**
 * Auth-server entry.
 *
 * Hard rules (see design/learnings.md):
 * 1. `defineComponent` / `registerMessages` = static imports only (before seal).
 * 2. Only `@dcl/sdk/server` may be dynamically imported.
 * 3. Client dress + letter HUD must still run if the isServer probe is wrong.
 *
 * setupUi is a static import so the letter pad cannot be lost to a failed dynamic
 * chunk — headless ignores the throw.
 */
import './shared/messages'
import './shared/schemas'
import { isServer as isServerApi } from '~system/EngineApi'
import { setupUi } from './ui'

export async function main() {
  const onServer = !!(await isServerApi({}).catch(() => ({ isServer: false }))).isServer

  if (onServer) {
    try {
      const { initServer } = await import('./server/server')
      initServer()
    } catch (err) {
      console.error('[WIP] initServer failed', err)
    }
  }

  try {
    const { setupGame } = await import('./game')
    setupGame()
  } catch (err) {
    if (!onServer) {
      console.error('[WIP] setupGame failed', err)
      throw err
    }
    console.error('[WIP] setupGame skipped on server', err)
  }

  try {
    setupUi()
  } catch (err) {
    if (!onServer) console.error('[WIP] setupUi failed', err)
  }
}
