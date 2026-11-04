# Station clarity — build spec (no guesswork)

**Status:** Ready **after** the honesty pass in [ui-ux-audit.md](ui-ux-audit.md) (esp. daily wheelIndex ↔ face **LIE**).  
**Parent:** [post-demo-zoom-out.md](post-demo-zoom-out.md) step 1.  
**Safeguards:** [CHANGE-SAFEGUARDS.md](CHANGE-SAFEGUARDS.md) — frozen letter pad, size gate, Mainnet-only deploy.  
**Sources:** MASTER floor rules, learnings playtest log, live `src/layout.ts` / `studio.ts` / `dailyWall.ts` / `game.ts` / `interact.ts` / `scene.json`, DCL interactivity + camera docs, Bay V0 “physical wheel for daily.”

Do not reopen “maybe two wheels?” as an open question mid-build — the decision tree below is closed from evidence. Do not add ownership chrome while the wheel still lies on daily misses.

---

## 1. What “confusing” actually is (proven causes)

| Cause | Evidence | File / note |
|---|---|---|
| **One physical wheel serves both games** | Bay V0 proof 2 locked “physical wheel” for daily. Daily click → calm `SPINNING` on gold sign → shared wheel spins → prize lands on daily sign. Show click → same wheel → letter pad. (LOOK LEFT copy removed 14 Oct.) | `dailyWall.ts`, MASTER proof 2, [pipelines.md](pipelines.md) |
| **Color grammar broken on the show pad** | Floor rule: gold = daily, magenta = show. Pad 1 disc is magenta but label `SHOW SPIN` is `LOOK.gold`. Gold reads as “daily” from spawn. | `studio.ts` `setNamedText('SpinLabel', 'SHOW SPIN', LOOK.gold)` |
| **Hover verbs asymmetric / vague** | Daily: `Spin the daily` (good). Show: `Spin the wheel` (does not say *show*; same wheel daily just used). Hover = mobile UI. | `dailyWall.ts`, `game.ts` `spinHover()` |
| **Weak daily feedback** | 7 Oct: standing on gold pad, hard to tell stage-left wheel moved; felt like a no-op. Floating pad billboard was jank → removed. Sign still says LOOK LEFT. | MASTER playtest 7 Oct |
| **Spare pads look like content** | Pads 2/3 glow magenta, captions `2` / `3`. Players may try them. They are physics-only placeholders for V2. | `studio.ts` `placeSparePad` |
| **People do not read walls** | Every rebuild: pads + hover + spawn camera, not jumbotron copy. | learnings “Floor UX” |

Not the primary bug (already fixed or separate): letter-pad layout, STILL SPINNING busy-gate, collider steal (keep those rules while editing).

---

## 2. Constraints we will not violate

From MASTER / learnings / Bay — treat as hard:

1. **Daily keeps a physical wheel spin** (Bay proof 2). We do **not** revert to “jumbotron-only daily” unless Bay says so.
2. **Two games, two pads** — never one pad for both.
3. **Hover = verbs** — phone proximity shows this string.
4. **No billboard labels on pads** that float over the wheel (Y-billboard drift).
5. **Same layout desktop + mobile** — only HUD scales.
6. **All V0 words** within ~8 m of spawn, y 0.5–3.5.
7. **Pointer hygiene** — only pad 1 hit volume, wheel face, gold volume, daily sign. Wipe Hub `PointerEvents` before `bindUse`. Proximity `maxDistance: 4` (pads ~8 m apart — already safe in `interact.ts`).
8. **Do not “improve” the letter-pad flex column** while doing this pass.

---

## 3. Closed decisions (research → choice)

### D1 — Shared wheel: keep, but own the spin with color + copy + light

| Option | Verdict |
|---|---|
| A. Separate daily spinner mesh | Reject for this pass — fights Bay “physical wheel,” more entities, phone budget |
| B. Shared wheel, no UX change | Reject — demos already called this confusing |
| **C. Shared wheel + station grammar + spin ownership cues** | **Accept** — matches constraints; fixes proven confusion |

**Spin ownership cues (concrete):**

- While **daily** reel/`watchingWheel`: daily sign owns copy; **magenta show spotlight dim / gold spotlight lean on wheel** (or existing gold path); daily hover temporarily `Watch the wheel` / keep sign `LOOK LEFT · DAILY`; show pad hover → `Show spin — wait` or disable show bind while daily busy (optional, if cheap).
- While **show** spinning/`canGuess`: show pad + wheel are active; daily sign idle copy stays `DAILY SPIN` / wearable line — do not flash LOOK LEFT.

### D2 — Color grammar (re-assert, fix violations)

| Element | Color |
|---|---|
| Gold pad + DAILY SPIN sign title | Gold (already) |
| Show pad disc + SHOW label | **Magenta / cream** — fix gold `SHOW SPIN` text |
| Pads 2/3 | Dimmer navy/magenta; caption `SOON` or `—` not playable digits if still confusing |

### D3 — Hover strings (final copy)

| Target | Hover (desktop + phone proximity) |
|---|---|
| Gold pad + daily sign | `Spin the daily` (keep) |
| Show pad hit + wheel face | `Spin the show` (replace `Spin the wheel`) |
| During opposite game busy | Prefer `setHoverText` mutate — never re-`bindUse` inside callback (double-fire rule) |

### D4 — Spawn / first frame (numbers already chosen)

Live spawn (`scene.json`):

- Position ~`(15.2–16.8, 0, 14.4–15.6)`
- `cameraTarget` `(17.4, 2.9, 23.2)` — biased right so gold at `DAILY_PAD x=20.6` stays in **phone** FOV

Layout live (`layout.ts`):

- Wheel `(9.6, 3.2, 23.4)` · pads z `18.2` · daily `(20.6, 17.4)` · sign `(20.6, 20.8)` · board `(16.0, 29.55)`

**Do not move parcels unless phone checklist fails.** If gold is off-frame on device, nudge `cameraTarget.x` toward `20–21` or daily `x` toward `19–20` — measure with MASTER phone checklist, not Hub alone.

### D5 — VirtualCamera for daily “look at wheel”

| Option | Verdict |
|---|---|
| Forced VirtualCamera on every daily spin | Defer — steals avatar control; better as V1 spectator polish; needs InputModifier discipline |
| Soft cue only (sign + light + audio) | **This pass** |

Camera skill is for **Thursday spectator beat** (zoom-out step 4), not required to close station clarity.

### D6 — Pads 2/3

Keep geometry (V2). Change caption to `SOON` (or hide labels) so they do not look like broken spins. Keep `physicsOnly` — no pointer.

---

## 4. Implementation checklist (files)

Ordered for one publish:

| # | Change | File(s) | Done when |
|---|---|---|---|
| 1 | `SHOW SPIN` label → cream/magenta (not gold); rename to `SHOW · PAD 1` | `studio.ts` | **Done** cream + pad name |
| 2 | `spinHover()` → `Spin the show` | `game.ts` | **Done** |
| 3 | Pads 2/3 caption `SOON` (or `—`) | `studio.ts` | **Done** |
| 4 | Daily busy: stronger sign line e.g. `LOOK LEFT · YOUR DAILY` + louder/longer existing cues; do not restore pad billboard | `dailyWall.ts` | **Done** LOOK LEFT → / hotter tween |
| 5 | Optional: while `isDailySpinBusy()`, `setHoverText` on show targets to `Wait — daily spinning` | `game.ts` + export busy from `dailyWall` | **Done** `syncStationHovers` |
| 6 | Optional: while show `spinning \|\| canGuess`, daily hover `Wait — show in progress` | `dailyWall.ts` / `game.ts` | **Done** |
| 7 | Title / lower-third unchanged (still THURSDAYS) | `countdown.ts` | Proof 3 intact |
| 8 | Phone + desktop checklist after publish | MASTER | Tick below |

**Out of scope this publish:** week card, `movePlayerTo`, VirtualCamera cut, vowels/bankrupt, layout rewrite, second wheel mesh.

---

## 5. Acceptance tests (replace vibes)

### Desktop (spawn, no walk)

1. Name three things in 3s: show wheel+pads · puzzle/Thursday · gold daily.
2. Gold reads daily; magenta pad reads show (not two gold stations).
3. Hover gold → `Spin the daily`. Hover pad 1 / wheel → `Spin the show`.
4. Daily spin: sign tells you to watch the wheel; wheel visibly moves; prize returns to **daily sign**.
5. Show spin: letter pad appears; daily sign does not say LOOK LEFT.

### Phone (MASTER checklist)

1. First frame: three things nameable?
2. Daily tappable without hunting?
3. Show spin findable without being told?
4. Spec warning?
5. Anything unreadable you had to depend on?

### Regression (must stay green)

- Letter pad still flex-column / no interactable inset.
- No STILL SPINNING self-block (`watchingWheel` not in busy gate before send).
- Colliders: stage physics-only; only intended volumes have POINTER.
- Autopilot / daily claim server path untouched.

---

## 6. Knowledge closed — what we no longer need to research for this pass

- Whether hover should be nouns → **no** (MASTER + mobile proximity).
- Whether to put tutorial HUD → **no** (learnings).
- Whether daily should leave the physical wheel → **not this pass** (Bay V0).
- Whether VirtualCamera is required for clarity → **no** (defer to spectator polish).
- Exact pad/sign coordinates → **use `layout.ts` / `scene.json` as source of truth**; only nudge after phone fail.
- OSS WoF clones → **irrelevant to station clarity**; save for V2 turn engine.

---

## 7. After this pass

Return to [post-demo-zoom-out.md](post-demo-zoom-out.md): week card → host contestant ritual → spectator camera → turn-state machine.
