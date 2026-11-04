# Change safeguards — stop breaking the live World

**Date:** 9 Oct 2026 (updated 14 Oct)  
**Why:** Letter pad, STILL SPINNING, blank room, fat eth blank Explorer, Sepolia deploy, autopilot silent fail, **wrong Hub folder**, **daily↔show mix** — we already paid tuition. Use this before every UI/UX or server edit.

Companion: [ui-ux-audit.md](ui-ux-audit.md), [learnings.md](learnings.md), [pipelines.md](pipelines.md), **[V0-FREEZE.md](V0-FREEZE.md)**.

**V0 freeze (14 Oct):** Spin/claim/fulfill stack is frozen for crowd testing. Prefer week-card / Meetup / docs work. See [V0-FREEZE.md](V0-FREEZE.md).

**Session start:** `npm run verify:preview-path` before any spin/pipeline debug.

---

## 1. Frozen surfaces (do not “improve” casually)

| Surface | Why frozen | Break symptom |
|---|---|---|
| Creator Hub workspace = `~/Projects/wip-wheel` only (never `Scenes/WIP Wheel`) | 29 Sep + 14 Oct: dual tree / pre–auth-server | “Fixes don’t stick”; gold `$WIP`; unlimited daily |
| Daily busy copy = calm `SPINNING` / `DAILY SPIN` (no LOOK LEFT) | 14 Oct: directional nag during reel | Noise / false station cues |
| `wheel-face.png` corners alpha 0 (circular cutout) | 14 Oct: opaque black corners after WEARABLE regen | Black diamond “box” behind spinning wheel |
| Show wheel = `wheel-face-live-4.png` + `livePrizes.ts` always | Nov 2026: phase-based 8-slice practice face | Pointer/label mismatch; Bay pitch drift — [show-wheel.md](show-wheel.md) |
| Daily claim via `assertDailyClaimant` (wallet + identity + !guest + hasConnectedWeb3) | 14 Oct mobile guest “won” WEARABLE | Fake win / burned pending / no backpack |
| Claimer-only `landDailyPrize`; no optimistic `dailyDoneHere` | 14 Oct spectator/guest sticky ALREADY CLAIMED | Room CRDT ≠ my claim |
| `src/ui.tsx` letter-pad **flex column** (spacer → pad → gutter), no `screenInset:'interactable'` | 7 Oct: “CALL A LETTER” with no keys | Show unplayable |
| `setupUi()` static import from `index.ts` | Dynamic/skip on mis-probed server | No HUD |
| `defineComponent` / `registerMessages` only via static imports | Seal race | Red billboard / dead room |
| `watchingWheel` **not** in daily busy-gate before send | 7 Oct: STILL SPINNING, never sent | Daily dead |
| Daily land must `restoreShowHover()`; never silent `sendShowSpin` | 9 Oct: show “dead” after daily | Hover stuck / no spin |
| Client + server spin seconds from `shared/spinTiming.ts` | 9 Oct: 5.6 vs 4.2 mismatch | Busy flags lie |
| Do not gate show on `isDailySpinBusy` / `landedUntil` | Meta-audit: hover lied for 3.8s | Clicks no-op after daily |
| `wheelReserve` before `await performDailySpin` | Async message interleave | Dual anim / race |
| Show busy feedback → hover + scoreboard (not ResultText) | ResultText scaled dead (F8) | Invisible “feedback” |
| Late join: snap daily (`dailySyncedFromNetwork`), never replay YOU WON | 13 Oct enter auto-daily | Fake claim / fake win |
| Daily vs show pipelines stay split — see [pipelines.md](pipelines.md) | 13 Oct gold→$WIP / multi-claim | Wrong labels / unlimited daily |
| Day lock = server memory + Storage; client `dailyDoneHere` on send | Preview Storage 404 | Reclaim every gold click |
| Lean `micro-eth-signer` + `ensureCryptoRng()` only under `src/server/` | viem bloated bundle; missing crypto | Blank Explorer / unpaid wins |
| Title card keeps **THURSDAYS** even when live | Proof 3 | Meetup unreadable |
| Pointer: wipe Hub events before `bindUse`; stage/floor physics-only | Ray steal | Wrong pad fires / nothing fires |
| `layout.ts` as single blocking source — see [LAYOUT-MOVE.md](LAYOUT-MOVE.md) | Dual layouts / Hub-only moves | Phone FOV miss / broken hit volumes |
| Layout steps vs [layout-baseline.md](layout-baseline.md) | Draft A regressions | Broken spin/sit or daily sign walling the board |
| Sit via `bindUse` + `Sit` hover ([audience-sit.md](audience-sit.md)) | TriggerArea → RestrictedAction | Silent no-sit |

To change a frozen surface: write the reason in the PR/commit body and run the matching regression below.

---

## 2. Branch + publish discipline

1. **Never edit on the assumption the Hub copy is truth** — Hub `Scenes/` mirror lied twice (29 Sep, 14 Oct). Repo path only. `npm run verify:preview-path` first.  
2. **Confirm bundling path** in the Preview start log before diagnosing any spin bug.  
3. **One concern per publish** (e.g. “daily wheelIndex honesty” OR “show label color” — not both plus letter pad).  
4. **Preview before Worlds deploy:** `npm run start` / Creator Hub Preview from this repo.  
5. **Deploy only on Ethereum Mainnet** in the linker (Sepolia → `fetch failed`).  
6. **Fully quit Explorer** after publish (reload ≠ new content).  
7. **Do not republish mid-Meetup** (MASTER).  
8. Prefer a **git branch** for any non-freeze work; do not mix week-card edits with claim/fulfill edits in one publish.  
9. **Git:** commit a known-good V0 snapshot when the room is stable (ask before agent commits). Tag mentally as “pre-Meetup V0” so rollback is a redeploy away.

---

## 3. Size and bundle gate (every scene build)

After `npx sdk-commands build`:

```bash
# Rough gate — lean scene ~2.0MB; fail closed if we blew up again
python3 -c "from pathlib import Path; n=Path('bin/index.js').stat().st_size; print(n); assert n < 2_400_000, n"
```

Also grep that **`viem` is not** in `bin/index.js`.  
Strip sourceMappingURL if you ship size-sensitive (existing habit).

---

## 4. Regression checklist (run before calling a pass “done”)

### Desktop (5 min)

- [ ] `npm run verify:preview-path` green; start log bundling `Projects/wip-wheel`  
- [ ] Spawn: name show wheel, Thursday, daily gold in ~3s  
- [ ] Daily spin: wheel moves; **slice matches sign** (audit F1); land is WEARABLE or TRY AGAIN (not `$WIP`)  
- [ ] While spinning: gold sign calm — no LOOK LEFT  
- [ ] Second daily same wallet: ALREADY CLAIMED / COME BACK  
- [ ] Show spin: letter pad appears; can guess  
- [ ] No STILL SPINNING on first daily click  

### Phone (5 min) — MASTER checklist

- [ ] First frame three things  
- [ ] Daily tappable without hunting  
- [ ] Show spin findable  
- [ ] Spec warning?  
- [ ] Unreadable dependency?  

### Autopilot (if touching server/fulfill)

- [ ] Hot nonce bumps after a WEARABLE (or Storage `lastFulfillError` empty)  
- [ ] No new fat eth imports in client path  

### Deploy

- [ ] Linker network pill = **Ethereum**, not Sepolia  
- [ ] Worlds URL opens; leave/re-enter  

---

## 5. Safe edit patterns (from scars)

| Want to change | Safe way | Unsafe way |
|---|---|---|
| Hover copy | `setHoverText` / `spinHover()` string | Re-`bindUse` inside click callback |
| Pad label color | `setNamedText(..., LOOK.cream)` | Billboard on pad labels |
| Daily feedback | Daily sign strings in `dailyWall.ts` | New full-screen HUD / second pad label |
| Letter pad layout | **Don’t** | `screenInset:'interactable'`, gate on `!anim` |
| Busy gates | Exclude click-feedback flags from “busy” | Set `watchingWheel` before `room.send` |
| Show vs daily anim copy | Branch on `mode` in `startWheelAnim` | Paint both boards with the same headline always |
| Fulfillment | `src/server/onchainTransfer.ts` + EnvVar | `viem` in scene bundle |

---

## 6. Rollback

If a publish nukes the room:

1. Revert the git commit (or check out last-known-good).  
2. `npx sdk-commands build` + deploy Mainnet.  
3. Quit Explorer fully.  
4. Log *why* in [learnings.md](learnings.md) the same day (MASTER rule 9).

Do not stack boot markers / experimental composites on an unknown seal bug.

---

## 7. Who touches what

| Area | Prefer | Avoid |
|---|---|---|
| Floor copy / color / hover | `studio.ts`, `dailyWall.ts`, `game.ts` hover helpers | Hub composite text left live |
| Puzzle / week | `week.ts` (+ matching `week.json`) | Hardcoding in `game.ts` |
| Server prizes | `shared/dailyCatalog.ts` | Client-only `DAILY_PRIZES` as source of truth in prod |
| Letter HUD | leave `ui.tsx` | “Quick” layout experiments |
