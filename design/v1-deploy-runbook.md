# V1 deploy runbook — rizzle.dcl.eth

**When:** Big V1 update (live rounds, 4-slice wheel, host live, weekly board).  
**Audit:** [v1-pre-publish-audit.md](v1-pre-publish-audit.md) · **Bay handoff:** [bay-v1-handoff.md](bay-v1-handoff.md)

---

## 1. Automated (repo)

```bash
npm run verify:v1-publish
```

Must pass: path, week card, build, World name in `scene.json`.

---

## 2. Scene Storage (Creator Hub)

Set **before** deploy; same vars apply to Preview.

| Variable | Meetup / you | Bay solo test | If omitted |
|----------|--------------|---------------|------------|
| `HOST_WALLETS` | Your wallet | Your wallet | No START/END LIVE |
| `ROUND_EVERY_SEC` | `900` | `120` | Auto live every **2 h** |
| `LIVE_ROUND_MAX_SEC` | `600` | `600` | Default **15 min** live |
| `FULFILLER_PRIVATE_KEY` | Set | Set for backpack proof | Wearables log only |
| `PRIZE_TREASURY` | Hot wallet | Same | Fulfill fails |

After editing Storage: **restart Preview** or **redeploy** so the auth server reloads env.

---

## 3. Solo smoke (Preview, ~15 min)

Follow [v1-solo-playtest.md](v1-solo-playtest.md). Minimum before World:

| Step | Pass |
|------|------|
| Log bundles `Projects/wip-wheel/src/index.ts` | |
| `[SERVER] host wallets configured: 1` | |
| Daily once — no `$WIP` on gold | |
| Pad 1 practice spin — 4 slices | |
| **START LIVE** → join → spin → solve (or END LIVE) | |
| **WEEKLY SOLVES** updates after wallet solve | |
| `[SERVER] daily claim` / `live round open` in log | |

Log result in [MASTER.md](MASTER.md) playtest log.

---

## 4. Deploy

```bash
npm run deploy
```

- Hub workspace = `~/Projects/wip-wheel` only.  
- Quit Explorer fully after deploy; re-enter World.  
- Wake server: first visitor waits ~15s (`CONNECTING TO SHOW SERVER…`).

---

## 5. Post-deploy World smoke (15 min)

Same as Preview on https://decentraland.org/play/?realm=rizzle.dcl.eth

- [ ] Daily lock + one claim  
- [ ] Host START LIVE + one contestant flow  
- [ ] Optional: fulfill one WEARABLE — [fulfill-verify.md](fulfill-verify.md)  
- [ ] Send [bay-v1-handoff.md](bay-v1-handoff.md) to Bay  

---

## 6. Rollback

Redeploy previous git tag/commit from this repo. Do **not** hand-edit `main.composite` / `main.crdt`. Scene Storage env survives redeploy — verify vars if behavior changes.

---

## Do not thaw for deploy

Daily claim, gold table, spawn look-ray, layout regression surfaces — [V0-FREEZE.md](V0-FREEZE.md).
