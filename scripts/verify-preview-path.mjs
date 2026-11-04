#!/usr/bin/env node
/**
 * Preflight: prove we are editing / previewing Projects/wip-wheel, not a Hub Scenes mirror.
 * Run before debugging daily/show spins: `npm run verify:preview-path`
 *
 * Exit 0 = safe. Exit 1 = stop and fix Hub workspace before touching spin code.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const expected = path.resolve(os.homedir(), 'Projects/wip-wheel')
const hubConfig = path.join(
  os.homedir(),
  'Library/Application Support/creator-hub/Settings/config.json'
)
const staleScenes = path.join(
  os.homedir(),
  'Library/Application Support/creator-hub/Scenes/WIP Wheel'
)

const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  process.exitCode = 1
}
const ok = (msg) => console.log(`OK: ${msg}`)

console.log('verify-preview-path')
console.log(`  cwd / repo: ${repoRoot}`)

if (path.resolve(repoRoot) !== expected && !repoRoot.endsWith(`${path.sep}wip-wheel`)) {
  fail(`repo root is not wip-wheel: ${repoRoot}`)
} else {
  ok(`repo is ${repoRoot}`)
}

const serverEntry = path.join(repoRoot, 'src/server/server.ts')
const dailyClaims = path.join(repoRoot, 'src/server/dailyClaims.ts')
const catalog = path.join(repoRoot, 'src/shared/dailyCatalog.ts')
for (const p of [serverEntry, dailyClaims, catalog]) {
  if (!fs.existsSync(p)) fail(`missing auth-server daily file: ${p}`)
  else ok(`has ${path.relative(repoRoot, p)}`)
}

// Stale mirror used client pickDailyPrize + payoutFor — must not be the open workspace.
if (fs.existsSync(staleScenes)) {
  fail(
    `stale Hub Scenes mirror still exists:\n  ${staleScenes}\n  Rename to WIP-Wheel-STALE-DO-NOT-OPEN and never Preview from it.`
  )
} else {
  ok('no Scenes/WIP Wheel mirror (good)')
}

if (!fs.existsSync(hubConfig)) {
  console.warn(`WARN: Hub config not found at ${hubConfig} (OK if Hub never installed)`)
} else {
  let cfg
  try {
    cfg = JSON.parse(fs.readFileSync(hubConfig, 'utf8'))
  } catch (e) {
    fail(`cannot parse Hub config: ${e.message}`)
    cfg = null
  }
  if (cfg) {
    const paths = cfg?.workspace?.paths ?? cfg?.workspacePaths ?? []
    const list = Array.isArray(paths) ? paths : []
    console.log(`  Hub workspace.paths: ${JSON.stringify(list)}`)
    const scenesHit = list.find((p) => String(p).includes('creator-hub/Scenes'))
    const projectsHit = list.find(
      (p) =>
        String(p).includes('Projects/wip-wheel') ||
        path.resolve(String(p)) === expected
    )
    if (scenesHit) {
      fail(`Hub workspace still lists a Scenes path: ${scenesHit}`)
    } else if (!projectsHit && list.length > 0) {
      fail(
        `Hub workspace does not list Projects/wip-wheel.\n  Got: ${JSON.stringify(list)}\n  Fix Settings/config.json workspace.paths[0]`
      )
    } else if (projectsHit) {
      ok(`Hub workspace includes ${projectsHit}`)
    } else {
      console.warn('WARN: Hub workspace.paths empty — open Projects/wip-wheel in Creator Hub before Preview')
    }
  }
}

// Wheel face must punch transparent corners (square plane + circular art).
{
  const facePath = path.join(repoRoot, 'assets/Images/wheel-face.png')
  const check = spawnSync(
    'python3',
    [
      '-c',
      `from PIL import Image
im=Image.open(${JSON.stringify(facePath)}).convert('RGBA')
w,h=im.size
bad=[c for c in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)] if im.getpixel(c)[3]>0]
print(len(bad))`
    ],
    { encoding: 'utf8' }
  )
  if (check.status === 0) {
    const n = Number((check.stdout || '').trim())
    if (n > 0) {
      fail(
        'wheel-face.png has opaque corners (alpha>0) — black diamond on spin. Re-punch circular alpha.'
      )
    } else ok('wheel-face.png corners are transparent')
  } else {
    console.warn('WARN: could not alpha-check wheel-face.png (PIL missing?)')
  }
}

{
  const spawnCheck = spawnSync(process.execPath, [path.join(__dirname, 'verify-spawn-sync.mjs')], {
    encoding: 'utf8'
  })
  if (spawnCheck.status !== 0) {
    console.log(spawnCheck.stdout || '')
    console.error(spawnCheck.stderr || '')
    fail('spawn desync — Hub/scene.json drifted from SPAWN_DOC (see design/layout-spawn-desync.md)')
  } else {
    ok('scene.json spawn matches SPAWN_DOC')
  }
}

console.log('')
console.log('Before trusting a Preview, confirm the start log contains:')
console.log('  Bundling file …/Projects/wip-wheel/src/index.ts')
console.log('  [SERVER] WIP Wheel Multiplayer Server starting')
console.log('  [SERVER] daily claim … WEARABLE|TRY AGAIN   (not client-only $WIP)')
console.log('')
console.log('Pipelines: design/pipelines.md')

if (process.exitCode) {
  console.error('\nDo not debug spin logic until this script is green.')
  process.exit(1)
}
console.log('All path checks passed.')
