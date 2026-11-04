# Learnings

Memory for anyone (including future us) who opens this repo and is tempted to "just tweak the banners."

The application scene was rebuilt several times in the open. Almost every bad version was the same mistake: treating the World like a website instead of a game-show floor people stand on.

---

## Method (14 Oct sit / click pass)

**Consult Foundation before inventing.** The sit + click work landed when we stopped guessing and matched: Creator Hub [`Seat.ts`](https://github.com/decentraland/creator-hub/blob/main/packages/asset-packs/packs/smart_items/assets/classic_bench/Seat.ts), [avatar-animations](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/avatars/avatar-animations.md), [click / proximity](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/button-events/), and sdk-skills (`add-interactivity`, `player-avatar`, `scene-runtime`). Wrong Y, `await movePlayerTo`, walk freeze, and triple hover chips were all “reasonable” ideas that contradicted those sources. Pattern for the rest of the build: find the official script or test scene, port it, then tune layout numbers only.

## Clarity pass (14 Oct — Bay Conditional V0)

**Copy sells the two habits; do not thaw claim/spin.** Cold users needed: gold = daily, pad 1 = show, return CTA after claim, and a name while the shared wheel turns. Shipped freeze-safe: `COME BACK` / `TOMORROW` + `Come back tomorrow` hover; HUD `GOLD = DAILY · PAD 1 = SHOW`; SpinLabel `SHOW · PAD 1`; busy hovers; strip `{name} · DAILY|SHOW · WATCH` from existing `ShowState` winners — not turn locks. Next proof is ops (World backpack), not more chrome.

**Three-column spawn ≠ seated Meetup FOV.** Clarity optimizes the *standing* first frame (wheel | board | daily). From benches, the same wheel + daily sign sit in the cone to the puzzle and can clip the board. Sit label nudged into the aisle (`AUDIENCE.z + 2.2`) so 3rd-person catches it without a full U-turn; full column widen stays a layout pass after backpack smoke.

**HUD strip ≠ letter moment.** While `canGuess`, the top objective strip is hidden so it doesn’t fight the pad — put feedback on the **letter-pad title**, not only `hudCopy`. Otherwise Preview “proves” the copy never shipped.

**“Can’t spin” after a show land is usually the letter window.** Hover `Call a letter` + pad open = mutex working (`canGuess`). Tap a letter, then spin. Diagnose with [spin-preview-diag.md](spin-preview-diag.md) before thawing binds. Full-canvas UI root must stay `pointerFilter: 'none'` (build-ui) so the pad can’t eat world clicks.

**Clarity for Bay ≠ Meetup sightlines.** Copy/hover closes Conditional Pass onboarding; seated FOV is proof 4 layout — don’t mix them in one panic publish.

**Prove fulfill on-chain, not by memory.** 14 Oct: guest messaging OK; wallet WEARABLE + come-back lock OK; delivery confirmed via hot-wallet `Transfer` + catalyst lambdas (Idol Jacket → `0xd90a…`). If backpack “empty,” check Polygon from `0xd961…` and Storage `pendingFulfillment` / `lastFulfillError` before assuming autopilot is dead. Stay in World ~1–2 min after a win so the 45s retry can fire. Scale checklist: [fulfill-verify.md](fulfill-verify.md).

**Scale = ops muscle, not more features.** Before each hang: treasury stock + POL, wake World early, verify first WEARABLE with the checklist, shout the winner. Do not thaw claim/fulfill to “make delivery more reliable” when EnvVar + stock + stay-in-room already work.

**Catalog seed ≠ hot wallet.** Rolls use server inventory synced from lambdas on `PRIZE_TREASURY`. A once-per-boot sync left available stock stuck low after a big sweep while the World stayed warm (seed said 30, hot had 77). Fix: re-sync on wake and before spins (≥60s). Always confirm with `npm run treasury-status`, not the TypeScript `inventory` field.

**Meetup ghosts ≠ broken daily.** 15 Oct hang: invisible desktop peers while the wheel/daily still advanced + two WEARABLE autopilot pays. Scene has no hide-avatar modifier; Explorer often drops avatar meshes under load while Multiplayer Server / CRDT keeps working. Ownership cue = HUD/sign name + wheel motion, not “I can see their body on the pad.” See [playtest-15oct-meetup.md](playtest-15oct-meetup.md).

**Amplify ownership, don’t invent turns.** Post-Meetup: HUD `NAME ON THE WHEEL · DAILY|SHOW`, hotter gold disc while daily owns the mutex, show board names the spinner. Still no contestant locks.

**Show cam ≠ daily cam.** Short `VirtualCamera` + `InputModifier` on show spins only (`src/showCam.ts`). Daily stays free-look so the gold-pad claimer isn’t yanked. Abort the beat if daily steals the shared wheel. `InputModifier` is desktop-only — web Explorer still sees the cut without a walk freeze.

**Draft A floor = phases, not one publish.** Phase 1 only moves `layout.ts` / spawn (procession: daily first → seats → pads → vertical wheel → board). Do not tip the wheel or add a second daily mesh in the same pass — `facingSpinZ` and Bay’s single `WheelRoot` break if you rush.

**“Empty set” after a layout tweak is usually overlap or spawn FOV, not a revert.** 15 Oct: compact daily sat inside BenchR; `cameraTarget` stared at gold feet → pink/white benches looked like placeholders and the board fell out of frame. Daily hover still worked. Fix AABBs + look into the set; confirm with `[WIP] floor health` before thawing anything.

**Spawn look ray is the whole game (16 Oct).** `cameraTarget` is not a crop tool. From spawn → target must be mostly **+Z into the set**, with gold **near** on that ray and board/wheel **far**. We repeated the empty-sky panic three ways in one morning: (2) look +X vestibule, (3) same-x gold wall, (4) center spawn → stage-right gold (looks *at* habit, set off-ray). Full log + locked recipe: [layout-mistakes.md](layout-mistakes.md). Before any spawn edit: check Δz dominates |Δx|; if Preview is empty sky, walk +Z and match mistake # — do not invent a fifth axis.

**Positioning is a solved API, not a vibe (16 Oct).** DCL: left-hand meters from SW base; Transform = center + quaternion; Identity faces our house; Hub names get `moveNamed` (pos/scale); code props use `AUDIENCE_FACING`. Deep reference: [positioning.md](positioning.md). Never freestyle Y±90 or Hub-only moves without `layout.ts`.

**Draft A failed for a scoring bug, not a placement API bug (16 Oct).** The floor plan is one centerline: board → wheel → P1 P2 P3 → benches → daily → spawn. After the vertical wheel covered the phrase, we slid the wheel left and gold right so the board stayed visible, then wrote that workaround into the spawn contract and graded “stations exist + spin logs” as Draft A. Each later pass optimized the workaround. It only matched the diagram when `layout.ts` put every station back on **x=16** and spawn looked straight through daily (`cameraTarget` z≈18, not the board). Lesson: if a Preview “pass” does not match the picture the user is holding, the pass line is wrong — do not add another meter tweak on top. Full note: [layout-draft-a-path.md](layout-draft-a-path.md).

**Centerline daily sign blocks the aisle (16 Oct, accepted deviation).** Once gold sat on x=16 it worked as a first object and walled the walk. Next daily is a **small raked wheel, stage-right of the aisle**, same idea as the show wheel — not a bigger sign, not back to the old far-right pad. Aisle stays open down the center.

**Board letter size is the texture, not the box (20 Oct).** `TextShape` `fontSize` on this board is how sharp the glyph is. Revealed puzzle letters are `4.4`. The used-letter strip is `1.7`. The title is `4.6`. Shrinking those to “fit” the tile turned every letter into a dot and made a gold category bar with no readable word. Do not refit them. Phrase, strip, and title stay separate layers; a chassis behind them can join the side view, but it must sit behind the type.

**Board is one slab; seated puzzle sightline is still open (16 Oct).** Phrase, letter row, and score strip are stacked on the same wall. From the aisle the vertical wheel covers the phrase center; from up close the title clips and the score line runs through the keyboard. Rebuild the board so a **seated** viewer sees the whole puzzle once the show wheel is raked. That may nudge board or wheel off pure center — update the draft when it happens, don’t silently drift.

**Hub spawn mockup ≠ Preview feet (16 Oct).** Explorer only reads `scene.json` `spawnPoints`. Hub gizmos can show an aisle-center ghost while disk still has south-of-neon coords — and Hub has written `y: -1.25`. Always `npm run verify:spawn-sync` / `sync:spawn`. Autopsy: [layout-spawn-desync.md](layout-spawn-desync.md).

---

## Never again (read before any spin fix)

**Path before code.** If a daily/show bug appears, prove the Preview is bundling `/Users/rizzle/Projects/wip-wheel/src/index.ts` first. Run `npm run verify:preview-path`. Hub `Scenes/WIP Wheel` is a poison tree (14 Oct + 29 Sep). Editing this repo while Previewing that mirror wastes days and invents fake bugs (infinite gold `$WIP`).

**Two pipelines, never one.** Gold = daily (`DAILY_CATALOG`, server day lock, `WEARABLE` / `TRY AGAIN`). Magenta pad 1 = show (`livePrizes.ts`, 4-slice face, letters + live solve). Shared piece is only `WheelRoot` + mutex. Full table: [pipelines.md](pipelines.md). Show authority: [show-wheel.md](show-wheel.md).

**Show wheel is always 4-slice (Nov 2026).** Do not swap `wheel-face.png` / 8-slice `PRIZES` back in for practice — Bay V1 pitch + shipped code use `wheel-face-live-4.png` and `LIVE_PRIZES` for every show spin. `PRIZES[]` remains for daily cabinet degree math only.

**Do not “fix” spin by reading Hub UI alone.** Require `[SERVER] daily claim …` in the Multiplayer Server log. No claim log → wrong tree or client-only RNG.

**Calm daily busy copy.** No LOOK LEFT / STAGE-LEFT nag while the wheel reels. Sign stays `SPINNING` / `DAILY SPIN` until land.

**Wheel-face PNG must have transparent corners.** The disc is a square plane with a circular texture. Opaque black outside the circle = “black diamond box behind the wheel” when it spins (14 Oct; also hit before). After any show or legacy `wheel-face*.png` export, corners must be alpha 0 — ring already was. **Show disc today:** `wheel-face-live-4.png` ([show-wheel.md](show-wheel.md)).

**Puzzle row 3 must clear the scoreboard strip.** Tile scale was fine; `ROW_Y[2]=3.8` put bottoms at 3.24 inside `STRIP` (ink top 3.48, gold rule 3.52, strip Z in front of the board) so row 3 looked “squashed.” Derive row centers from `STRIP`; always frame 3 rows; keep phrases inside `PUZZLE_MAX_ROWS × PUZZLE_MAX_ROW_LEN` (3×14).

**Audience benches need paint + skybox.** Hub bench meshes default to black; at night they vanish and only the sit label shows. Always `paintSolid`/glow seats after `moveNamed`, and set `scene.json` `skyboxConfig.fixedTime` (43200 = noon) so the hang isn’t player-time-of-day dependent.

**Sit = port Creator Hub `Seat.ts`, do not invent.** Feet at floor `y:0` (not plank top). `void movePlayerTo` then `void triggerEmote` in the same click — **never await move**. Tall POINTER HIT over the bench (not thin plank BOTH). **No walk freeze** — stand by walking >1.5 m. See [audience-sit.md](audience-sit.md).

**Clicks (wheels + seats):** First `CL_POINTER` on the ray wins. `maxDistance` = avatar→hit; `maxCameraDistance` OR for third-person. Proximity ≤3 m + facing + LOS. **One `showFeedback` chip per action** — extra POINTER/PRIMARY/proximity entries or a second volume (pad+face, pad+sign) with feedback stack as LMB+LMB+E. Silent E + silent proximity still fire. `bindUse(..., showHover)` — only the primary HIT is true.

**Move the floor only via `layout.ts`.** Art will relocate the wheel/benches later; pipelines bind to named roles, not magic numbers. Checklist: [LAYOUT-MOVE.md](LAYOUT-MOVE.md).

**Guests are not wallets.** DCL gives guests ephemeral `0x…` addresses that look real. Server must **fail closed**: reject if `PlayerIdentityData` missing or `isGuest`. Guests watch; only a connected wallet can claim.

**Room daily ≠ my win.** `ShowState.dailyNonce` is shared. Only the claimer may `landDailyPrize` (YOU WON) and set `dailyDoneHere`. Spectators use `LAST DAILY` or they steal the day lock and think they won a wearable (14 Oct mobile).

---

## Product

**Two games, one room.** Gold daily stage-right. Show wheel + pads stage-left. Puzzle board centre-back. They share a studio and one physical wheel, **not** a code path.

The original single-wheel-with-a-daily-overlay looked clever and played confusing. Reviewers and players could not tell Tuesday from Thursday. Split the tables. Split the pads. Split the feedback surfaces. Split the prize authorities.

**Daily is a chance machine on the shared wheel.** Server rolls `DAILY_CATALOG`. Gold sign owns the result. One claim per wallet per UTC day. No letters. No show `$WIP` labels on gold.

**Show is a crowd game.** Magenta pad, slow wheel, letter call, cream puzzle, bank. The fun is standing next to other avatars while it slows down.

**Spectating is play.** The spin is slow on purpose (`MIN_TURNS`, ~4.2s). Do not speed it up to feel more "gamey."

**Freemium is load-bearing.** Most Decentraland visitors are guests or empty wallets. If the only way to enjoy the room is to receive crypto, we exclude the room. Labels now, payouts after funding.

**The WIP Meetup is the retention engine.** We did not invent a reason to show up on Thursday. We put a studio under a hang that already exists. Daily is the weekday light. The countdown is the billboard. Thursday is the episode.

**Progression is the known hole.** Foundation called it. They also said do not solve it before V0. See [v1-progression.md](v1-progression.md).

---

## Floor UX (this is where we bled)

People do not read. They walk, they click the biggest thing, they look at whatever is in the spawn camera.

**29 Sep 2026 phone test (Rizzle):** daily tap worked. Walls unreadable (desktop too). Spawn too far from anything that explains the room. Phone flagged limited specs. See [MASTER.md](MASTER.md).

- Spawn must be **on or beside the gold pad**, not across the parcel. Sky walls are not the information layer.
- Gold pad = daily. Pink/magenta pad = show. Labels on the pads: DAILY / SHOW.
- Hover text on the pads, not a tutorial HUD. Letter HUD only appears when the show actually needs a letter.
- Daily result belongs on a board you can read **from the gold pad**. Show clock belongs at eye height. Tall jumbotrons are optional dressing.
- **A 4 m wheel hides whatever is behind it.** Board directly behind the wheel = invisible to the contestant on the pad. Wheel goes to one side, board up and across. `src/layout.ts` is the one place the floor is blocked out.
- **Hover text is the mobile UI.** The proximity button on a phone shows the hover string. Verbs (`Spin the daily`), not labels (`DAILY`).
- **Phone FOV is narrower than desktop.** A pad that is "in frame" on Hub preview can be completely off the right edge on mobile. Daily must sit inside the spawn camera on both, or proof 2 dies. Same layout — just don't park stage-right props at the parcel edge.
- **`LightSource` must not abort setup.** Some mobile clients reject spotlights. Wrap create; the gold disc and binds still have to run.
- **The thing that looks clickable must be clickable.** A 0.3 m pad under a 3 m READY sign will lose every time. Wire the sign. Wipe Hub-authored `PointerEvents` before `bindUse` or the composite click steals the ray and does nothing.
- **A game-show floor is three columns, not one depth.** Board on the back wall, wheel stage-left with three contestant pads, daily stage-right, audience behind spawn. Signs in front of the board make the room a poster.
- **Thursday stays on the board on Thursday.** Swapping the lower-third to `LIVE NOW / ON AIR` during the live window hides the one fact proof 3 asks for.
- **Welcome cards that cover the set are clutter.** One HUD line. The 3D does the rest.
- **Two copies of the scene = testing week-old code (29 Sep and again 14 Oct).** Creator Hub `Scenes/WIP Wheel` went stale / pre–auth-server. Point Hub at `Projects/wip-wheel` only; rename any Scenes mirror; run `npm run verify:preview-path`. The start log bundling path is the ground truth — not the Hub window title.
- **Asset path case matters at publish.** `assets/images/` on disk + `assets/Images/` in code works on macOS and 404s on the content server. Keep the case identical and git-tracked.
- **~160 tiny boxes repainted every frame** was the cost of "marquee bulbs". That is a limited-spec warning on a phone for a decoration nobody could read past. Static emissive is free; per-frame `Material` writes are not.

If onboarding fails in playtest, the pads, hover, or camera are wrong — not the loop. That line is still in the GDD because it stayed true through every rebuild.

---

## Decentraland / SDK7 (hard-won)

### Daily “STILL SPINNING” with no wheel

Setting `watchingWheel` (LOOK LEFT copy) **before** `requestDailySpin` made `isDailyReeling()` true on the same click, so the handler showed WAIT / STILL SPINNING and never sent `dailySpin`. Instant feedback must run **after** the request is queued, or the busy-gate must ignore click-feedback flags.

### Clicks

Pointer rays hit the **first POINTER-layer collider**. Backdrop, wings, banner, the **stage slab**, and a wall-sized steal-box will eat the pad. Symptoms we actually hit: "I am standing on the pink pad and the daily fires," "neither pad works," "the wheel is a black box I click instead of the podium," "I clicked both wheels on desktop and nothing happened."

Rules:

- Hub Floor/Stage/WheelStand/pads ship as `collisionMask: 3`. Strip POINTER from anything the player is not supposed to click. Stage under the pads is the usual killer.
- `physicsOnly` may only **narrow** a collider that already exists. Calling `MeshCollider.setBox` on WheelFrame / Banner (no collider in the composite) builds a 4 m box that steals every ray.
- Decorative meshes: physics only (`CL_PHYSICS`), or **no collider**. `muteCollider` deletes the mesh collider.
- Collision mask is a **bitmask** (`CL_POINTER | CL_PHYSICS`). Never pass an array.
- Click targets need a `MeshRenderer` even if `VisibilityComponent` hides them. A collider-only entity is a miss in Babylon.
- Do not tween the entity that owns the collider. Visual disc breathes; a separate ~2 m volume takes the click.
- Only pad 1, the wheel face, the gold volume, and the daily sign get pointer events.
- `maxDistance` is avatar distance, not camera. Spawn-to-pad is ~8–10 m. 16 m is the floor. Proximity stays ~3 m.
- Wipe Hub-authored `PointerEvents` before `bindUse` or a dead composite click steals the ray and does nothing.
- Never re-register a pad handler from inside its own callback (double-fires). Mutate `hoverText` on `PointerEvents`.
- Mute `WheelHit` / `WheelFrame` / pointer meshes. The wheel visual is a prop. The hit volume is the control.

### Thursday copy

Never replace “Thursday” with “LIVE NOW / ON AIR” during the live window. Proof 3 is recognising Thursday as the main live event. The live day is when that line has to stay on the board.

### Screen UI (mobile)

Daily uses no overlay. Letter pad is show-only. Put it in `screenInset: 'interactable'`, **center of the screen**. Bottom-right is the client's action buttons. Left is the joystick. Virtual 1920×1080 (phones become 1600×720). Verify on a real device / Preview QR.

**Letter pad must always mount on the client.** Skipping `setupUi()` when `isServer` is mis-probed yields 3D `CALL A LETTER` with no keyboard (7 Oct playtest). Call `setupUi` from a static import after dress; ignore throw on true headless.

**Do not "improve" the working letter-pad layout.** The version that worked was a full-canvas column: flexGrow spacer → pad → bottom gutter. No `screenInset: 'interactable'`. Replacing that with a centered early-return root + interactable inset made `canGuess` hide the strip and draw a pad Explorer never showed — only 3D CALL A LETTER remained (7 Oct). Keep the flex column. Do not gate the pad on `!anim` (server `canGuess` often arrives while the local tween is still running). Use `localNeedsLetter` for sync lag; only clear it after server `canGuess` has opened then closed.

### Text in the world

SDK text with a fat dark `outlineWidth` (we used 0.32) reads as **black blobs** at audience distance, especially gold-on-navy digits. Thin outline, gold digits, cream copy, navy-on-gold headers. Sans for countdown numbers, not mono.

**Magenta text on a magenta / pink bar is invisible.** The 1 Oct lower-third (`LIVE NOW` on a pink strip) failed proof 3 because of contrast, not size. Game info sits on navy with cream/gold. Promo pink is decoration only.

**Magenta *emissive* on a navy panel is still a pink wash.** 2 Oct P1 score pod: cream type gone, gold `50 $WIP` on pink, prize line repeating the total. Highlight with a gold rule, not a glowing fill.

- **The V2 WIP logo is the only brand mark.** `assets/Images/wip-logo.png` via `makeLogo`. Square, never stretched. Explorer thumbnail and the daily sign use it. `banner.png` is leftover and must not be drawn.

If it looks sparse and "like a 90s website," the layout is wrong, not the font size. Fill the board with live info (called letters, scores, bank) instead of four giant numbers in a sea of purple.

TextShape faces need `AUDIENCE_FACING`. Backwards copy means the quad is facing the backdrop.

**Wheel spin angles must stay in [0, 360) when written to `Transform`.** The spin tween keeps adding full turns (`MIN_TURNS * 360`) so `currentAngle` climbs into the thousands. `Quaternion.fromEulerDegrees(0, 0, 1800)` is the same pose as 0° but returns `w = -1` instead of `w = 1`. The renderer can treat that hemisphere as the back face, so every label on `wheel-face.png` looks mirrored. At spawn the wheel is 0° and reads fine; after some spins it lands wrong until you re-enter. Fix: `normalizeSpinDegrees` in `src/facing.ts` before every `facingSpinZ`, and fold `anim.endAngle` back into [0, 360) when the tween finishes. Prize math already used `% 360`; the bug was only the quaternion passed to `WheelRoot`.

### Hub vs this repo

Creator Hub used to keep a second tree under `~/Library/Application Support/creator-hub/Scenes/WIP Wheel`. That copy goes stale — and on 14 Oct it was still a **pre–auth-server** build (no `src/server/`, daily = client `pickDailyPrize` + `payoutFor`). Previewing it produced unlimited gold spins and `$WIP` wins while this repo was already correct.

- Source of truth: `/Users/rizzle/Projects/wip-wheel` only
- Hub `workspace.paths` must list that folder — never `…/creator-hub/Scenes/…`
- Before spin debug: `npm run verify:preview-path`
- Before trusting Preview: start log must say `Bundling file …/Projects/wip-wheel/src/index.ts`
- If Hub looks old: **Cmd+Q**, reopen the **Projects** folder, then Preview. Reloading the tab is not enough.
- Do **not** rsync into Scenes as a habit — that recreates the dual-tree trap. Open the repo.
- Hub's typechecker uses **Hub's** `tsconfig`. It does not import JSON (`TS2732` on `week.json`). The live week card is a TypeScript object in `src/week.ts`. Do not reintroduce `import card from './week.json'`.
- Do not hand-edit `main.crdt` / Hub composite guts unless you know why.

### Sync

Show spin is shared (`ShowState` + `syncEntity`). Late joiners snap to the last wheel result. Daily reel is also nonce-synced so the left wall can play out for the room. Keep it that way. A local-only wheel kills proof 4.

### Auth-server / Multiplayer Server (do not rediscover the hard way)

- **`defineComponent` / `registerMessages` = static imports from `index.ts` only.** Dynamic `import('./game')` after seal throws `Engine is already sealed` and the room dies (red billboard / Hub-only set). Put every custom component in `shared/schemas.ts` (or another file statically imported before `main`). Only `@dcl/sdk/server` may be dynamic inside `if (isServer())`.
- **Await `EngineApi.isServer()` in `main()`.** The sync `isServer()` from `@dcl/sdk/network` starts false and flips later — branching on it alone can send a client down the server import path.
- **`validateBeforeChange` belongs in `initServer()`**, after the role is known — not at module load (same race).
- **Deploy `fetch failed` to worlds-content-server** is often local network/sandbox, not a bad build. Retry with a normal shell; confirm `POST /entities/active` works first.
- **Do not “fix” a broken live World by stacking boot markers and composite experiments on top of an unknown seal/race bug.** Fix the load order, then dress. Hub composite bake is a fallback for labels, not a substitute for client `setupGame`.
- **Never publish a Hub CRDT that hides Banner/seats/result as a “fix” while dress is uncertain.** If `setupGame` does not run, players see a black Backdrop + lonely pads (7 Oct empty-room screenshot). Restore the Hub composite; make client dress run even when `isServer` probing is wrong (still call `setupGame` unless you are sure you are headless).
- **Empty board / blank wheel after a “successful” publish** happened when heavy eth (`viem` / fat imports) bloated `bin/index.js`. Lean `micro-eth-signer` for in-server fulfill is OK if you size-gate (~+200KB max). Never pull `viem` into the scene. Keys stay in EnvVar; transfer code lives under `src/server/` only.
- **In-server wearable autopilot silent-failed at Bay (8 Oct):** six `pendingFulfillment` rows, hot nonce stuck at 1. `micro-eth-signer` → noble-curves CT scalar blinding calls `crypto.getRandomValues` on every ECDSA sign; Hammurabi isolates often lack Web Crypto → every transfer throws. Fix: `ensureCryptoRng()` polyfill before `signBy`, plus Scene Storage `lastFulfillError` for ops. Confirm with a WEARABLE spin after publish — not just EnvVar set.
- **Daily wheel lied after Bay demos (9 Oct audit):** catalog miss rows used `wheelIndex` 1/3 (face SHOUTOUT / FREE SPIN) while the sign said TRY AGAIN. All daily misses must use slice **7**; keep face art and `wheelIndex` in lockstep. Show pad label must not be gold (`Spin the show` hover). See [ui-ux-audit.md](ui-ux-audit.md), [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md).
- **Daily then show dead (9 Oct):** one shared `WheelRoot` for both games. `finishDailyWheel` must restore show hover; never silent-return show clicks; align client/server spin durations in `shared/spinTiming.ts`; server must mutex `spinning`/`dailySpinning`. Do not clear `localNeedsLetter` on daily land — that hid an open letter window. See [spin-mutex-audit.md](spin-mutex-audit.md).
- **Meta-audit leftovers (9 Oct):** do not gate show on `isDailySpinBusy`/`landedUntil` (celebration ≠ physics). Set in-process `wheelReserve` **before** `await performDailySpin` or showSpin races the claim. Busy feedback must hit hover + scoreboard — `ResultText` is scaled dead (F8). Daily must not `paintShowBoard` LOOK AT THE WHEEL (F9).
- **Daily claimer must not depend only on ShowState CRDT for the tween.** Room `dailySpinResult` should carry `dailyNonce` and kick `startWheelAnim` locally; same nonce dedupes spectators’ sync. Gold pad is stage-right / wheel stage-left — if the sign says YOU WON but the player “saw no spin,” assume FOV first (7 Oct), then miss-kick. Local preview empty Storage ≠ live day-lock broken; preview without FULFILLER key cannot deliver wearables.
- **Late join must not replay daily as a new win (13 Oct).** Show has `snappedFromNetwork`; daily now uses `dailySyncedFromNetwork` + `showDailyRoomLast`. Animate only on nonce bump after sync, mid-spin join (`dailySpinning`), or claimer ACK. See [late-join-daily-replay.md](late-join-daily-replay.md).
- **Daily / show cross-talk + preview multi-claim (13 Oct).** Show finish must not clear `dailySpinning`; show CRDT must not clobber `anim.mode === 'daily'`. Gold land copy never uses `payoutFor` / `$WIP`. Preview Scene Storage often empty — day lock needs in-process `claimsByWalletDay` + client `dailyDoneHere` on send. Source of truth: [pipelines.md](pipelines.md).
- **Creator Hub Scenes mirror ate days of “fixes” (14 Oct).** Same poison tree as 29 Sep, worse payload: pre–auth-server daily (`pickDailyPrize` + `payoutFor`) → unlimited gold `$WIP` while real pipelines lived in `Projects/wip-wheel`. Fix: rename Scenes mirror, Hub config → Projects, `npm run verify:preview-path`, prove bundling path. Confirmed: claim `WEARABLE` then already-claimed. Also dropped LOOK LEFT busy copy — calm `SPINNING` / `DAILY SPIN` only.

### Other

- No Asset Packs (project constraint).
- Voice stays on. This is a conversation with a studio in the middle.
- Desktop and mobile. No keyboard required for the first action. Letters are a HUD pad.
- `DAILY_ONCE_PER_DAY` is currently `false`. Client-side map is not a real wallet/day lock anyway.

---

## Build history (so we do not rewind)

1. One wheel, daily overlay, HUD clock duplicating the wall — looked like a website, not a show.
2. Left wing empty, right wall a 2×2 countdown with unreadable digits, no letters/scores.
3. Daily and show sharing one spin path — daily opened letters, wall clicks stole the show pad.
4. Split: gold pad → left jumbotron; pink pad → wheel; pads only; show board rebuilt as countdown + called letters + scores + bank.
5. Application package: GDD, public repo `rizzlenft/wip-wheel`, World `rizzle.dcl.eth`.
6. Hub publish failed on JSON import; week card moved into `src/week.ts`.

Accepted on the back of (4) + the GDD, not on token payouts.

---

## File map (scene)

| File | Job |
|---|---|
| `src/index.ts` | `main()` — game + HUD |
| `src/game.ts` | Show spin, letters, shared state, daily request hook |
| `src/dailyWall.ts` | Left jumbotron + gold pad |
| `src/daily.ts` | Once-per-day flag (currently off) |
| `src/prizes.ts` | Show slices vs daily chance table |
| `src/countdown.ts` | Right show board + center ticker |
| `src/board.ts` | Cream puzzle tiles |
| `src/studio.ts` | Pink SHOW pad placement / labels |
| `src/week.ts` | Guest card + Thursday clock |
| `src/state.ts` | Synced `ShowState` |
| `src/ui.tsx` | Letter pad only (no status HUD bar) |
| `src/interact.ts` | Pad bind + physics-only helper |
| `src/look.ts` | Palette, text, marquees |
| `assets/scene/main.composite` | Hub-authored stage. Do not hand-edit. |

---

## Voice

Write and design like a Thursday show, not like a protocol. Short labels. One action per pad. If a sentence needs a glossary, it does not belong on a wall.
