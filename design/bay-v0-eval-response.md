# Response to Bay’s V0 Playtest Evaluation (8 Oct → 14 Oct)

**Bay doc:** Conditional V0 Pass — Creator Success  
**Our stance:** Agree with the diagnosis. Propose a **short prep order**, then book Bay + QA. Do **not** pretend we are ready to sign off today.

Companion: [bay-demo-feedback.md](bay-demo-feedback.md), [V0-FREEZE.md](V0-FREEZE.md), [station-clarity.md](station-clarity.md), [v0-scorecard.md](v0-scorecard.md).

---

## 1. Where we align with Bay (no argument)

| Bay ask | Our take |
|---|---|
| Conditional pass is fair | Yes — mechanics passed; cold onboarding did not |
| Priority 1 = clarity, not 3-contestant turns | Yes — matches MASTER “not V0” and her own §4 |
| New player should complete **daily** without a guide | Yes — that is the V0 acceptance bar |
| V1 list (turns, host, prize bank, stage, contracts) | Yes — park; same as our [v1-progression](v1-progression.md) |
| Puzzle between Thursdays | Promising V1 — not a V0 sign-off blocker |
| Follow-up with Bay + QA | Yes — after a focused prep, not as a rubber stamp today |

---

## 2. Honest pushback / reframes (she invited adjustments)

### A. “Prevent repeated interactions from disrupting another player”

Bay’s §4 correctly says **turn management is not required for V0**. Full “prevent” (only one spiller, locked letter picker) **is** turn management.

**V0-acceptable substitute (recommend):**

- Busy hover / HUD: `Wheel busy — watch` / show whose spin when cheap  
- Existing shared-wheel **mutex** (already: one spin at a time on the physical wheel)  
- Do **not** block other wallets from daily while show is idle  

**Park for V2:** contestant-only spin, letter ownership, lineup.

If we over-build “prevent disrupt” now, we thaw show/letter paths under freeze and ship a fake turn system.

### B. “Indicate when another player is selecting a letter”

Nice-to-have for V0 if it is **copy/HUD only** (e.g. strip: `LETTER IN PLAY`). Full “highlight your key vs theirs” on the pad = pad restyle risk → **V1 polish**, not sign-off gate.

### C. Weekly guest / puzzle without rebuild

**Already true:** `src/week.ts` + `design/week.json` (FRACTILIANS live).  
**QA item:** demonstrate a content swap in the follow-up — do not treat as greenfield build.

### D. Thursday countdown / event communication

**Already on the title card** (`THURSDAYS · 12 PM PT`, live flip).  
**QA item:** cold user verbalizes “Thursday is the show.” Optional one-line HUD reinforce — not a new countdown system.

### E. One claim / wallet / day + reward delivery

Day lock is **World-proven** for us; Bay still marks “needs verification.” Fair.  
**Must do before sign-off:** two wallets on World — (1) WEARABLE → backpack, (2) second spin blocked; optional TRY AGAIN → COME BACK TOMORROW. That closes her table row and our scorecard proof 5 smoke.

---

## 3. Correct order of operations (make Bay happy without breaking freeze)

```text
NOW (before booking sign-off)
  1. Freeze-safe onboarding / clarity pass (copy + pad grammar + return copy)
  2. World smoke: daily WEARABLE → backpack + day lock (2 wallets)
  3. Script for QA: gold = daily, magenta = show, Thursday line, week.ts swap demo

THEN
  4. Book Bay + QA follow-up as acceptance test (her §5)

AFTER sign-off → V1
  5. Spectator / week ritual / optional letter feedback
  6. Solo puzzle between shows (her promising direction)
  7. Turns / host / prize bank — only when floor stays honest through a Meetup
```

### Clarity pass scope (freeze-safe — prefer these)

| Item | How | Touches frozen spin? |
|---|---|---|
| Gold vs pink identification | Pad colors, labels, hover verbs (`Spin the daily` / show verb) | No — dress/hover |
| Simple how-to | Spawn/HUD one line: daily once/day; pad 1 = show | No — copy |
| Win / loss / claimed feedback | Sign + hover: YOU WON / TRY AGAIN / **COME BACK TOMORROW** | Soft — `dailyWall` copy only |
| Busy / whose wheel | Hover + strip while mutex held | Soft — no claim RNG |
| Disrupt prevention | Mutex already; busy copy — **not** turn locks | No full turn system |

Out of scope for this pass: letter-pad layout rewrite, contestant seats, VirtualCamera, payout automation.

---

## 4. Suggested reply to Bay (DM)

> Love the eval — Conditional Pass matches what we saw.  
>  
> One tweak to Priority 1: full “stop players disrupting each other” is turn management, which you correctly parked for V1. For V0 we’ll do **clear stations + busy/return feedback + the existing one-spin mutex**, not contestant locks.  
>  
> Before we book Bay+QA sign-off I’d like ~one short clarity publish + a **two-wallet backpack smoke** (claim → NFT in backpack, second spin blocked) and a 2-minute demo that **week guest/puzzle swaps via `week.ts`** without rebuild. Thursday is already on the title card — QA can verify cold.  
>  
> After that, yes — book the follow-up with you + QA to sign off first stage. Happy to adjust if you want different acceptance checks.

---

## 5. Answer to “Anything you’d change? Or book follow-up?”

| Option | Recommendation |
|---|---|
| “All good — book sign-off now” | **No** — Conditional Pass still has open verification + clarity |
| “Book follow-up after prep” | **Yes** — best for Bay and for us |
| Change her V1 list | **No** — it’s right |
| Change her Priority 1 | **Narrow “prevent disrupt”** as above so V0 stays shippable |

When clarity + smoke are done, flip [v0-scorecard.md](v0-scorecard.md) proof 5 smoke and run [bay-qa-checklist.md](bay-qa-checklist.md) with Bay + QA.
