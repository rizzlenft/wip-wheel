# MASTER — The WIP Wheel

**Open this file first. Every session.** If another note disagrees with this one, this one wins until we change it on purpose.

World: `rizzle.dcl.eth`  
Repo: https://github.com/rizzlenft/wip-wheel  
GDD (frozen pitch): [gdd.md](gdd.md)  
Tech memory: [learnings.md](learnings.md)  
Rewards (trust model): [rewards-architecture.md](rewards-architecture.md)  
Bay scorecard: [v0-scorecard.md](v0-scorecard.md)  
V1 parking lot: [v1-progression.md](v1-progression.md)  
**Next crowd test:** [demo-tomorrow.md](demo-tomorrow.md) — host card; do not republish unless the room is dead.  
**Roadmap V0→V4:** [roadmap-v0-v4.md](roadmap-v0-v4.md).  
**Post-demo zoom-out (9 Oct):** [post-demo-zoom-out.md](post-demo-zoom-out.md) — next steps after Bay demos; UX clarity → V1 ritual → V2 turn rules.  
**UI/UX audit (do before adding chrome):** [ui-ux-audit.md](ui-ux-audit.md) — lies/clutter/dead UI; honesty pass first.  
**Change safeguards:** [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md) — frozen surfaces, regression checklist, rollback.  
**Floor moves:** [LAYOUT-MOVE.md](LAYOUT-MOVE.md) — only `layout.ts` for station coords.  
**Audience sit:** [audience-sit.md](audience-sit.md) — click/E `Sit`, not walk-in.  
**Station clarity build spec:** [station-clarity.md](station-clarity.md) — after honesty pass.  
**Spin mutex audit (9 Oct):** [spin-mutex-audit.md](spin-mutex-audit.md) — one WheelRoot; daily left show hover stuck; silent show gates.  
**V0 closure (13 Oct):** [v0-closure.md](v0-closure.md) — what must be true before V1; late-join daily snap.  
**Pipelines (daily vs show):** [pipelines.md](pipelines.md) — do not mix authorities, labels, or locks.  
**Show wheel authority:** [show-wheel.md](show-wheel.md) — 4-slice practice + live; no phase texture swap.  
**Daily claim audit:** [daily-claim-audit.md](daily-claim-audit.md) — identity, claimer vs spectator, multi-prize ledger.  
**V0 freeze:** [V0-FREEZE.md](V0-FREEZE.md) — spin/claim frozen; safe V1 prep lanes listed.  
**Before spin debug:** `npm run verify:preview-path` — prove Hub is on this repo, not a Scenes mirror. Show wheel rules: [show-wheel.md](design/show-wheel.md).  
**“Wheel won’t spin” Preview tree:** [spin-preview-diag.md](spin-preview-diag.md) — letter window vs real bind failure.  
**14 Oct playtest:** [playtest-14oct.md](playtest-14oct.md) — desktop/mobile pass + guest WEARABLE hole.  
**Bay Creator Success demo digest:** [bay-demo-feedback.md](bay-demo-feedback.md) — last-week transcript vs now.  
**Bay V0 eval response / order of ops:** [bay-v0-eval-response.md](bay-v0-eval-response.md) — Conditional Pass; prep before Bay+QA sign-off.  
**Bay V1 explainers (why wait / what instead):** [bay-explain-v1.md](bay-explain-v1.md) — simple + DCL-backed.  
**What to work on now:** [NOW.md](NOW.md) — V1 per Bay pitch; [v1-bay-pitch-build.md](v1-bay-pitch-build.md) — step order.  
**Solo V1 Preview (before Bay playtest):** [v1-solo-playtest.md](v1-solo-playtest.md) · `npm run verify:v1-preview`  
**Pre-publish audit + deploy:** [v1-pre-publish-audit.md](v1-pre-publish-audit.md) · [v1-deploy-runbook.md](v1-deploy-runbook.md) · **`npm run verify:v1-publish`** · step-by-step **[V1-CHECKLIST.md](V1-CHECKLIST.md)**  
**Fulfill scale verify:** [fulfill-verify.md](fulfill-verify.md) — after every WEARABLE win.  
**15 Oct Meetup stress:** [playtest-15oct-meetup.md](playtest-15oct-meetup.md) — ghosts vs claim; 2 live pays.  
**Week-card ritual:** [week-ritual.md](week-ritual.md) + [week-puzzle-bank.md](week-puzzle-bank.md) — `npm run check:week` before publish.  
**Positioning (how DCL space works):** [positioning.md](positioning.md) — axes, Transform, facing, Hub vs code, precision protocol.  
**Draft A next steps:** [layout-next.md](layout-next.md).  
**Where things are:** [layout-position-audit.md](layout-position-audit.md) · **Hub vs live:** [layout-hub-vs-live.md](layout-hub-vs-live.md).  
**Set dress / Hub sync:** [layout-workflow.md](layout-workflow.md) · [layout-hub-sync.md](layout-hub-sync.md).  
**Spawn:** [layout-spawn-contract.md](layout-spawn-contract.md) · [layout-spawn-desync.md](layout-spawn-desync.md) (`verify:spawn-sync`).  
**Layout Draft A:** [layout-mistakes.md](layout-mistakes.md) · [layout-execute-draft-a.md](layout-execute-draft-a.md) · **[layout-draft-a-path.md](layout-draft-a-path.md)** — functional bar only; **art + rake parked** (canvas look out of scope until unpark).  
**Layout regression:** [layout-baseline.md](layout-baseline.md) · `.cursor/rules/layout-move-regression.mdc`.

---

## North star (28 Oct 2026 — V0 paid, V1 started)

V0 is paid. The game from here is a puzzle show that is always on, and a prize show that turns on by the clock.

Anyone can walk in and practice with the room: spin, call a letter, or solve the whole phrase. A solve brings the next phrase. That play is the habit between events.

On a schedule the server owns, a live round opens and real prizes switch on for that round only. The first three wallets to sit play. Everyone else watches. The wheel lands on one of five weighted outcomes: a letter, a wearable, $WIP, lose a turn, or bankrupt. The player who solves keeps that round's bank. A wrong solve wipes that player's bank before anything is sent. Then the countdown comes back and practice starts again.

The gold daily stays its own habit: one wearable chance per wallet per day, on its own table. It is not the live round.

People return because the next round is on the wall, because practice still moves a weekly board, and because the week remembers who solved and who won. Marketplace Credits for the leaders of those boards are the week prize after Decentraland can pay them. Until that pipe exists, the scene keeps the score and does not send credits.

Shipping order: [roadmap-v0-v4.md](roadmap-v0-v4.md). Next build: [NOW.md](NOW.md).

Creator Success, from the studio onboarding: a clear loop, other people make it better, and a reason to come back tomorrow. V0 ($1,000) was the vertical slice. V1 ($3,100, about four weeks) is the first complete playable of this loop. V2 ($2,800) and later rounds are earned with retention, not scheduled in advance. V4 in our roadmap is the trust-and-scale horizon past the funded stages.

## V0 — paid (the proofs we already signed)

Prove the loop can bring people in-world and give them a reason to come back: enter on **desktop and mobile**, **spin daily** (real wheel, one claim per wallet), **recognise Thursday 12 PM PT** as the main event, create a **shared spectator moment** at a WIP Meetup, and run **at least one real reward path** (manual fulfillment OK for the first Thursday).

| Proof | Pass |
|---|---|
| 1 Enter | Phone and desktop land in the studio. You can tell what this room is in a few seconds. |
| 2 Daily | One spin per **wallet** per UTC day. Physical wheel. Server decides the prize. Guests cannot claim. |
| 3 Thursday | Live show is Thursday 12 PM PT from the room. Bigger prizes / Meetup moment. Gold is not the show. |
| 4 Spectator | At a real WIP Meetup, people watch the wheel slow down together. |
| 5 Real rewards | Wearables (and later Credits / crypto) are winnable; fulfillment may be manual that week. |

**Not V0:** auto on-chain crypto payouts, betting, public wheel address, **3-contestant automation**, streak/XP, custom Solidity for RNG/daily lock, rebuilding the letter/sync show loop for its own sake. Those stay out of the paid slice. The live roster, the round clock, and the puzzle bank are V1, in [roadmap-v0-v4.md](roadmap-v0-v4.md). Proof 3 above is the Thursday hang we already shipped. The new return hook is the next live round.

**Trust model (do not dilute):** identity = wallet on the **DCL Multiplayer Server**; odds + inventory in server `Storage`; treasury = **Rizzle-owned** Polygon prize address (Bay may *send* stock there — she does not co-own); scene only animates. External `rewards-api/` is optional/legacy reference — not required for V0. See [rewards-architecture.md](rewards-architecture.md) and [SHIP.md](SHIP.md).

What they already like: two return hooks, social design, spin as the product. Thin host ops for fulfillment is acceptable for V0 playtest; automate after.

---

## The feeling we are building

You pop into a show that is already playing. A countdown says when the next paid round opens. Until then the puzzle is live, and the room can solve it together. When the clock hits, three seats matter, the wheel is worth something, and everyone else is the audience. After the solve, practice comes back.

The gold pad is still a personal daily chance. It is not the show.

Everything on the floor either sells the countdown, the puzzle, or the daily in the first three seconds, or it is clutter.

---

## What we will not do

- Do not put daily eligibility or prize RNG only in the scene. Client state is untrusted.
- Do not invent smart contracts for V0 daily lock. Fulfillment first; chain later if needed.
- Do not rewrite the show loop outside the V1 slices in [roadmap-v0-v4.md](roadmap-v0-v4.md). Daily claim and wearable payout stay protected ([V0-FREEZE.md](V0-FREEZE.md)).
- Do not put V0 copy on the 14-meter sky walls.
- Do not publish every tweak. Iterate on desktop preview; publish once per pass; phone-test the publish.
- Do not treat Creator Hub's stale copy as truth. Source is this repo. `npm run verify:preview-path` before any spin debug.
- Do not mix daily and show prize tables, locks, or land copy. Gold never shows `$WIP`. See [pipelines.md](pipelines.md).
- Do not put LOOK LEFT / STAGE-LEFT nag on the gold sign while the wheel spins.
- Do not commit private keys, Safe owners, or admin tokens.

---

## Rules of the floor (learned the hard way)

1. **Every V0 word lives within ~8 m of spawn and between y 0.5 and 3.5.** Human height, human distance. If you cannot read it from the pad you are standing on, it is not V0 copy.
2. **Spawn is the studio audience.** You stand far enough back to see three columns at once: wheel stage-left, puzzle board on the back wall, daily stage-right. Nothing important sits in front of the board.
3. **Three messages in the first frame, no more.** (a) THE WIP WHEEL, large, on the banner. (b) THURSDAYS 12 PM PT on that same title card, **even while the show is live**. (c) DAILY SPIN / gold pad. Eye-height Meetup line under the board is the hang CTA, not a fourth billboard. The strip under the puzzle is the **game** (called letters + three scores), not a second promo.
4. **Hover text is the mobile UI.** On a phone the proximity button shows the hover text. Use verbs: `Spin the daily`, `Spin the wheel`. Not nouns.
5. **Spinning the wheel must be obvious.** Pad 1 at the wheel's foot, plus the wheel face. Clicks hit a **tall hidden volume**, not the tweened disc. Gold pad stays clear of the wheel's collider.
6. **Same layout on both platforms.** Only the HUD scales. No forked scenes.
7. **Cheap enough for a flagged phone.** No per-frame material loops over 160 bulbs. Two 14 m jumbotrons become two 2 m signs. Count entities before and after.
8. **Tall stuff is backdrop.** Glow, colour, silhouette. Zero information.
9. **Read this file before every prompt.** Learnings too. Do not patch from memory. If a playtest fails, log *why* here the same day so we do not rebuild the same bug.

---

## Layout — tight studio, three columns

The spawn camera has to see a **set**, not a warehouse. Wheel, board, and daily sit close enough to share one frame. The back wall is only as wide as the board. Thursday is a lower-third under the letters, not a second side billboard.

```
 z≈30   [ THE WIP WHEEL ]
        [ THURSDAYS · 12 PM PT · THE WIP MEETUP ]
        [ PUZZLE BOARD ]
        [ used-letter board  ·  cream left, magenta called, gold vowels ]
        [ P1 score (live) | P2 empty | P3 empty ]
 z≈23   ( WHEEL )
 z≈20   [1 SPIN] [2] [3]                  ● gold / DAILY
 z≈15   ★ spawn (front row, looking at the board)
 z≈11   studio audience benches
```

Live numbers: `src/layout.ts`.

- **Puzzle board** centre-back, tiles fill the wall (rows y ~5–6.2). Backdrop is only as wide as the set.
- **Title card** is logo + type. Thursday lives on it. Never spend the lower-third on promo. Never stretch `banner.png`.
- **Scoreboard** under the letters: Wheel of Fortune used-letter board (consonants, then vowels) plus three contestant pods. Player 1 tracks the round. 2 and 3 read empty on purpose.
- **Wheel + contestant row** stage left. Pad 1 is the only wired spin. Pads 2 and 3 are empty podiums for the future three-person show.
- **Daily** stage right (x ~20.4): gold pad in the first frame on desktop *and* phone, sign behind it, billboard `DAILY SPIN`. Click sign or the volume over the pad.
- **Spawn** x 16, z 15, cameraTarget slightly right of centre so the gold pad is in the phone FOV. Leave and re-enter to pick up spawn.

---

## Build order (one publish at the end)

| Step | What | Status |
|---|---|---|
| L1 Floor | Move wheel/stand/pointer/board/pads. Spawn + camera. | **Code done 29 Sep.** `src/layout.ts`, `studio.ts`, `scene.json`. |
| L2 Signs | DAILY sign + SHOW sign at eye height. Strip jumbotron copy. | **Code done.** `dailyWall.ts`, `countdown.ts`. |
| L3 Interaction | Verb hover text. Wheel clickable → show spin. Pads step-on with physics. | **Code done.** `interact.ts`, `game.ts`. |
| L4 Perf | Delete marquees + per-frame repaint. Remove walls, ticker, letter chips, bank strip. | **Code done.** Runtime entities ~310 → ~60. Idle per-frame material writes: 160 → 0. |
| L5 Ship | Desktop preview pass from spawn. Tune numbers in `layout.ts`. Hub Cmd+Q. Publish once. | **Waiting on wearables** then smoke + publish. Scorecard: [v0-scorecard.md](v0-scorecard.md). |
| L6 Phone | Rizzle, mobile app, 5 min, no tutorial. Checklist below. | Waiting on L5. |

Then cold-drop a friend on both platforms, then a real Thursday. Then pause until the next funded slice. See [v1-progression.md](v1-progression.md) for DCL-native paths, not a new game.

### Phone checklist (after each publish)

1. First frame: can you name the three things (game show / Thursday / daily)?
2. Daily: did you tap it without walking or hunting?
3. Wheel: did you find how to spin it without being told?
4. Spec warning: still shown?
5. Anything you had to read that you could not?

---

## Playtest log

### 4 Nov 2026 — Rizzle, Preview (V1 polish)

- **Show wheel unified:** Main stage always **4-slice** (`wheel-face-live-4.png` + `livePrizes.ts`) in practice and live. `roundPhase` only gates roster, turns, live fulfill, wrong-solve OUT — not face swap. Retired practice 8-slice `PRIZES` roll on pad 1. Authority locked in [show-wheel.md](show-wheel.md).
- **Playtest:** Practice solve + weekly board OK; wrong solve copy OK; user confirmed 4-slice look in practice. **Live round + fulfill** — run solo script with `ROUND_EVERY_SEC=120` before Bay (see [v1-solo-playtest.md](v1-solo-playtest.md)).

### 14 Oct 2026 — Rizzle, correct-folder Preview (Creator Hub)

- **Wrong tree was the real bug.** Hub had been Previewing `Scenes/WIP Wheel` (no `src/server/`, client `pickDailyPrize` + `payoutFor`) while we edited `Projects/wip-wheel`. Symptom: infinite gold `$WIP`. Not a live day-lock failure.
- **Fix:** Hub `workspace.paths` → `Projects/wip-wheel`; rename Scenes mirror `WIP-Wheel-STALE-DO-NOT-OPEN`; add `npm run verify:preview-path`.
- **On the real tree:** log bundled `…/Projects/wip-wheel/src/index.ts`; `[SERVER] daily claim … WEARABLE`; second click already claimed. Autopilot EnvVar 404 in preview = expected.
- **Copy:** dropped LOOK LEFT during spin — gold sign stays `SPINNING` / `DAILY SPIN`. Integrity rules locked in [pipelines.md](pipelines.md) “Never again”.
- **Black diamond behind show wheel:** not a MeshCollider steal-box. `wheel-face.png` regenerated 13 Oct with **opaque black corners** (alpha 255); square plane corners read as a spinning black box. Fixed circular alpha punch; hide `WheelHit`; harden click volumes. **Re-preview same day:** show spin → `SHOUTOUT`, no black diamond; daily already claimed (expected).
- **Later 14 Oct — desktop + mobile smoke:** Desktop wallet: daily TRY AGAIN → already claimed; show spin OK. Mobile guest: saw WEARABLE then locked — **bug** (persisted after first publish). Causes: guest gate fail-open; spectators YOU WON + lock; optimistic `dailyDoneHere` before ACK. Hardened: Catalyst `hasConnectedWeb3` required; claimer-only land; no optimistic day lock. Full table: [playtest-14oct.md](playtest-14oct.md).
- **Afternoon 14 Oct — week card + board publish:** Guest **FRACTILIANS**, phrase on 3-row board. Row-3 “squash” was strip clip (not bad tile scale) — derive `ROW_Y` from `STRIP`; lock 3×14. Preview path green; EnvVar 404 expected. **Published** to `rizzle.dcl.eth`; desktop + mobile OK. Freeze stays on spin/claim. Credits studio budget received (off-chain) — weight still 0 until operator smoke. Next: crowd / Meetup ops, not more floor rebuild.

### 9 Oct 2026 — Rizzle, after honesty publish

- **Daily click → “both wheels spun” → show would not spin.** Not two mesh roots: one `WheelRoot` (face rotates, ring static). Daily *is* the WoF prop.
- **Root causes:** `finishDailyWheel` never restored hover (`Wheel is spinning` stuck — mobile proximity UI); `sendShowSpin` silent-returned on `anim`/`spinning`/`canGuess`; daily allowed during letter debt and wiped the “Call a letter” cue; client daily tween 5.6s vs server busy flag 4.2s.
- **Fix pass 1:** shared `spinTiming.ts`; restore hover on daily land (preserve letter debt); show busy feedback; server mutex `dailySpinning` ↔ `spinning`.
- **Meta-audit pass 2:** drop show gate on `landedUntil`; `wheelReserve` before Storage await; busy → scoreboard not dead ResultText; daily skips show strip (F9). Details: [spin-mutex-audit.md](spin-mutex-audit.md).
- **Preview 9 Oct:** daily reclaim OK (empty local Storage). Claim → WEARABLE logged; fulfill skipped (no local EnvVar). Show spun fine after daily (**mutex OK**). Daily motion still easy to miss from gold pad (7 Oct FOV). Fix: claimer anim from `dailySpinResult.dailyNonce` + hotter/longer daily tween + stronger LOOK LEFT copy. Re-check A2 looking stage-left before publish. [preview-findings-9oct.md](preview-findings-9oct.md).
- **Published 9 Oct** spin-mutex pass to `rizzle.dcl.eth` (claimer daily kick, hover restore, wheelReserve, timing). Quit Explorer fully; re-enter; spot-check daily→show.
- **Honesty/clarity P1 (code 9 Oct):** pads 2/3 + score pods `SOON`; ResultText hidden; symmetric busy hovers (`Wait — daily spinning` / `Wait — show in progress`).
- **Published 9 Oct** honesty/clarity P1 to `rizzle.dcl.eth`. Quit Explorer; spot-check SOON labels + busy hovers + daily→show.
- **13 Oct — enter felt like auto daily + WEARABLE.** Late-join replay (show snapped; daily did not). Fixed: first sync snaps daily + `LAST DAILY` sign (not YOU WON). Softened F4/F5 practice copy. **Later 13 Oct:** regenerated `wheel-face.png` + `PRIZES` slice 5 → `WEARABLE` (F1 closed). **Same day:** gold daily felt like unlimited `$WIP` wins — show finish cleared `dailySpinning` and show CRDT could clobber the daily tween into `finishSpin`. Fixed server + client anim mutex. Closure: [v0-closure.md](v0-closure.md).
- **Published 13 Oct** V0 closure (late-join daily snap + practice copy) to `rizzle.dcl.eth`. Quit Explorer; enter — should **not** auto LOOK LEFT / YOU WON; may show `LAST DAILY` if room has a prior claim.

### 7 Oct 2026 — Rizzle, desktop Explorer (`rizzle.dcl.eth`)

- **Daily claim lock works.** Try-again landed; second click → COME BACK / ALREADY CLAIMED.
- **Spin feedback weak.** Standing at the gold pad, hard to tell the stage-left wheel was moving; first click felt like a no-op. Floating duplicate “DAILY SPIN” pad label was jank.
- **Fix:** drop pad billboard label; on click immediately show LOOK LEFT / WATCH THE WHEEL on the daily sign; longer daily spin + louder start; Meetup stays offset.
- **Show spun, letter pad missing.** 3D + strip said CALL A LETTER; no alphabet keys. First fix (always `setupUi` / `localNeedsLetter`) was not enough.
- **Root cause:** we replaced the proven flex-column pad with a centered early-return root + `screenInset:'interactable'`. When `canGuess` flipped, the strip hid and the pad never appeared on Explorer. Also `&& !anim` hid the pad while the server window was already open.
- **Fix:** restore committed letter-pad layout (spacer → pad → gutter), static `setupUi`, no interactable inset, pad visible whenever `canGuess || localNeedsLetter`.
- Prize fulfillment not tested (no win this run).
- **Demo mode:** show wheel already had no server Thursday lock; HUD now says `SHOW WHEEL OPEN` via `SHOW_OPEN_ALWAYS` in `week.ts`. Host “go live” switch not built yet — flip that flag false when we want Thursday-only invites again. Title card still says THURSDAYS.

### 29 Sep 2026 — Rizzle, mobile Explorer (`rizzle.dcl.eth`)

- **Daily worked.** Walked through the gold podium, tapped the thing that said daily, left-wall spinner ran.
- **Walls unreadable.** Same on desktop. Sky jumbotrons were never the information layer.
- **Spawn is too far.** You arrive across the lot from anything that explains the room. Layout and graphic style feel unintuitive and clunky.
- **Phone flagged as limited specs.** ~160 marquee bulbs repainted every frame, two 14 m walls of boxes, 26 letter chips.

Proof 2 (mechanic) is closer than we thought. Proofs 1 and 3 fail on **distance and type**, not on the loop.

### 29 Sep 2026, 5:33 PM — Rizzle, Creator Hub preview (desktop)

Screenshot showed the **old** scene: left jumbotron, ticker, waist-high pink cube, far spawn. "Looks kinda cool, not intuitive. Spun the daily, could not spin the wheel."

**Root cause: pipeline.** Creator Hub was previewing its own copy at `~/Library/Application Support/creator-hub/Scenes/WIP Wheel` (`src/` dated Sep 22). Nothing from this repo had reached it. That copy also had `assets/images/` (lower-case) while code asks for `assets/Images/` — works on a Mac, breaks textures on the content server.

Fix applied: repo rsynced into the Hub copy so the running preview hot-reloaded; folder case corrected. **Permanent fix (pending Hub quit):** point the Hub at `~/Projects/wip-wheel` and drop the stale copy from its scene list. Rule from here: Creator Hub opens the repo folder. There is no second copy.

Likely reason the wheel "would not spin" in the old build: after a spin lands on a prize the game waits for a letter (`canGuess`), and the old pad gave no readable hint. New build says `Call a letter` on hover, on the SHOW sign, and on the objective strip.

### 29 Sep 2026 — Onboarding layer (code, built, synced to Hub preview)

Decentraland has no start screen, so the scene has to explain itself the instant the loading screen drops. Added, per the SDK game-design guidance:

- **Welcome card** gated on `EngineInfo.sceneHidden` flipping false (the only reliable "player can see the set" signal). Three lines + GOT IT: `THE WIP WHEEL` / `LIVE GAME SHOW · THURSDAYS 12 PM PT` / `TODAY: FREE SPIN ON THE GOLD PAD`. Auto-dismisses after 14 s or the moment the player takes the daily.
- **Objective strip**, top centre, one line, always on: `FREE DAILY SPIN · STEP ON THE GOLD PAD` → after the daily, `NEXT LIVE SHOW · THU 12 PM PT · 2D 4H` → `LIVE NOW · SPIN THE WHEEL AT THE PINK PAD` on Thursday → `CALL A LETTER · prize` while a guess is owed. Same on phone.
- **Gold pad breathes** (renderer-side yoyo scale tween, no per-frame code) under a **gold spotlight**, with three gold runway bars from spawn to the pad.
- **Magenta spotlight** on the wheel. Stage reads as stage.

### 30 Sep 2026 — Rizzle, desktop Hub preview (new layout, still broken)

Two shots: welcome card covering the set; then the set itself with DAILY + SHOW signs stacked in front of the puzzle board. CTA clear but cluttered. Not a game-show floor — everything in one line of depth. Could not spin daily or the show wheel on desktop.

**Clicks:** Hub `SpinButton` still carried a composite PointerEvent with no callback; first POINTER wins, so our bind never fired. Daily: people click the READY sign (no collider) from ~7 m; only a 0.3 m pad at maxDistance 5 was wired. Fix: wipe Hub PointerEvents before bind; daily sign is a click target; maxDistance 10–14; pads a bit taller.

**Stage:** Re-blocked to three columns (board back-centre, wheel left, daily right). Spawn is audience. Welcome modal gone — HUD strip only.

### 30 Sep 2026, 1:07 — layout landed, type and pads still weak

Spawn finally reads as a studio. Remaining V0 holes in that frame: Thursday strip too small to read (proof 3), gold pad looked like stairs, SHOW/DAILY labels duplicated the signs. Fix: two-line spawn-size Thursday strip; one disc per pad, both breathe; pad label on the show is `SPIN THE WHEEL`; daily sign is TODAY / READY.

Skipped for V0 (polish / V1): particles, NPC host, welcome modal, progression, extra lights, sit-on-benches. Phone check still required after one publish.

### 1 Oct 2026, ~3:03 PM — Rizzle, desktop Hub preview (Thursday, live window)

Set finally reads as a studio. Could not spin **either** wheel on desktop. Thursday / spectator proofs still fail: banner and lower-third too small, and because it was Thursday the strip said `LIVE NOW / ON AIR` with no Thursday on it.

**Why clicks died (do not recreate):**

1. **Stage/Floor Hub colliders are `collisionMask: 3` (POINTER + PHYSICS).** The pads sit on that slab. First POINTER wins. The stage has no callback, so every click on a pad is a silent miss. `physicsOnly('Stage')` is required, and it must only *narrow* an existing collider — never `setBox` onto a mesh that had none.
2. **`physicsOnly('WheelFrame')` added a collider the frame never had.** WheelFrame is a 4.22 × 4.22 × 1 plane. `MeshCollider.setBox` turned it into a 4 m steal-box around the wheel.
3. **Click volumes with no `MeshRenderer`.** Babylon / some explorers will not raycast a collider-only entity. Hidden box mesh + `VisibilityComponent` + `CL_POINTER`.
4. **The visual disc was the click target, and it was tweened 0.38 m tall.** From spawn (~8 m) you are aiming at a pancake that is also scaling. Clicks go on a separate 2 m volume. Do not tween the entity that owns the collider.
5. **`MeshCollider.setBox(entity, [POINTER, PHYSICS])` is wrong.** The SDK stores a bitmask. Use `POINTER | PHYSICS`.
6. **Do not take Thursday off the board on Thursday.** Proof 3 is “recognise Thursday as the main live event.” `LIVE NOW / ON AIR` fails that on the one day it matters.

Fix in code: `muteCollider` / `physicsOnly` that never adds; tall hidden hit volumes on pad 1, the wheel face, the gold pad, and the daily sign; Thursday line under the banner; lower-third always says Thursday; three contestant pads; audience benches.

### 1 Oct 2026, ~3:21 PM — Rizzle, desktop Hub preview

Clicks work. Remaining hole is the wall: banner still reads as a thin web header, and the pink lower-third is magenta-on-magenta (illegible). That space should be the Wheel of Fortune game — used letters + three contestant scores — not another promo. Thursday stays on the title card.

### 2 Oct 2026, ~10:36 AM — Rizzle, desktop Hub preview

Game loop works (spin, call W, P1 shows 50 $WIP). Two remaining type bugs:

1. **Banner is a stretched `banner.png`.** Independent X/Y scale on a designed graphic crops the title and duplicates Thursday (texture subtitle + overlay bar). Fix: hide the Hub Banner; build the card from the square WIP logo + TextShape. Never stretch a poster to the wall aspect.
2. **P1 pod washed pink.** `paintSolid` with magenta emissive on the whole panel. Cream name disappears, gold score sits on pink, last prize reprints `50 $WIP`. Fix: ink panel, gold rule, three centered lines (`1  RIZZLE` / `50 $WIP` / last slice only if it is not the total).

### 2 Oct 2026, ~10:47 AM — Rizzle, desktop Hub preview

Title card is the right idea: square logo + type, not a stretched poster. Type was still small on a wide navy bar. V2 logo now lives in `assets/Images/wip-logo.png` and is the only brand mark (`makeLogo`). Daily sign and explorer thumbnail use it too. Old `banner.png` is leftover art, not drawn.

---

## Pre-publish (this is the remaining V0 work)

Do not add features. Do this:

1. Creator Hub opens **this repo** (`~/Projects/wip-wheel`), not the Scenes copy. Cmd+Q if it doesn't.
2. Desktop preview from spawn: three messages, Meetup CTA tap, daily wearable hover, pad 1 show spin.
3. **One publish** to `rizzle.dcl.eth` after wearables smoke (see [v0-scorecard.md](v0-scorecard.md)).
4. Phone Explorer (not Safari): same checklist. Spec warning?
5. Server Storage enforces one claim per wallet per UTC day — no client flag to flip.
6. Cold drop a friend. Then a real Thursday Meetup.

Then **pause production** until there is a green light. Next paths are in [v1-progression.md](v1-progression.md), not in more floor rebuilds.

### 5 Oct 2026 — mobile: no gold podium in first frame

Desktop still fine. Phone FOV is narrower: gold at x 22 sat off the right edge of the spawn camera, so proof 2 failed before anyone walked. Spotlights can also abort setup on older mobile clients if `LightSource` throws.

Fix (same scene on both platforms, no desktop fork): pull daily to x 20.4 / z 17.6 inside the spawn frame; nudge `cameraTarget` slightly toward stage-right; billboard `DAILY SPIN` on the pad; fail-safe `spotlightDown`; proximity 4 m. Desktop three-column layout unchanged.

**Published 5 Oct 2026** to `rizzle.dcl.eth`. Phone check next: leave+re-enter World so spawn/cameraTarget pick up; gold pad should be in the first frame with `DAILY SPIN` billboard; stand on it and tap `Spin the daily`.

### 5 Oct 2026, ~9:02 AM — Rizzle, in-world

After some show-wheel spins, slice labels on `wheel-face.png` read mirrored (backwards); fresh spawn was always correct. Root cause: unbounded spin angle on `WheelRoot` (e.g. 1800° after five turns) produced a quaternion with `w = -1` for the same visual pose as 0°. Fix: normalize to [0, 360) in `facingSpinZ` and when the spin tween ends. See `design/learnings.md` (wheel spin angles).

### 6 Oct 2026 — Bay: real rewards + daily wheel in V0

Creator Success wants real rewards + daily **spin**. Locked proof **5 Real rewards**.  

**Path chosen:** DCL **Multiplayer Server** (`@dcl/sdk@auth-server`) — one claim per wallet in `Storage`, no Render/Railway. Wearables from Rizzle treasury; credits reserved off. See [SHIP.md](SHIP.md), [bay-handoff.md](bay-handoff.md), [v0-scorecard.md](v0-scorecard.md).

**Polish while waiting on wearables (6 Oct):** honest wearables copy; Meetup CTA; scene tags; docs aligned to Option A.

**Autopilot note (7 Oct):** fat `viem`/heavy eth in the scene blanked Explorer. Restored lean in-server path (`micro-eth-signer` + `src/server/onchainTransfer.ts`, ~+199KB) with EnvVar `FULFILLER_PRIVATE_KEY`. External `FULFILL_URL` worker remains optional fallback only.

**Autopilot fix (8 Oct):** Bay demo left 6 wearable wins in `pendingFulfillment` (manual fulfill after). Root cause: no `crypto.getRandomValues` in the Multiplayer Server isolate → noble sign throws. Polyfill in `onchainTransfer.ts`; errors also land in Storage `lastFulfillError`.

---

## How we stay on track

Every working session:

1. Read **this file**, [V0-FREEZE.md](V0-FREEZE.md), and [learnings.md](learnings.md) “Never again”.
2. **`npm run verify:preview-path`** before any daily/show spin debug. Then confirm the Preview start log bundles `Projects/wip-wheel`.
3. Prefer **week card / Meetup / docs** over spin edits while V0 is frozen. Pipeline edits → [pipelines.md](pipelines.md) + full regression.
4. Iterate on Hub Preview. Publish once per pass. **Do not republish mid-Meetup.**
5. Log the playtest here the same day (date, platform, checklist answers).
6. **Creator Hub opens `~/Projects/wip-wheel` directly.** Never a `Scenes/` mirror.
7. **14 Oct:** wrong folder / pipeline mix / guest lies paid tuition — see freeze + audit docs.

**Two games stay two games.** Gold runs the **daily** claim (server RNG + physical wheel). Pink / pad 1 runs the **show** spin. Do not merge their prize tables.

**Guests stay first-class.** Fun if you never get paid — but daily prizes need a wallet.

**No extra ops for Rizzle** beyond Storage fulfillment on win days.

---

## Jump in

- Mobile: Decentraland **app** (Safari will not load the World). Search **The WIP Wheel** / **rizzle**, or chat `/goto rizzle.dcl.eth`.
- Desktop Explorer: `/goto rizzle.dcl.eth`
- Hand-off link: https://decentraland.org/play/?realm=rizzle.dcl.eth

---

## Paperwork

MSA / PO / JC — Rizzle + Foundation. Not scene work. Blocks getting paid, not the build.
