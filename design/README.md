# Design docs

**Daily driver: [MASTER.md](MASTER.md).** Open that first, every session. It is the north star, the playtest log, and the build plan. If another file disagrees, MASTER wins. V0 is paid. Current shipping order: [roadmap-v0-v4.md](roadmap-v0-v4.md). Next build: [NOW.md](NOW.md).

| Doc | What it is |
|---|---|
| [MASTER.md](MASTER.md) | **The working document.** Goal, mistakes, plan, playtest log. |
| [v0-scorecard.md](v0-scorecard.md) | Bay proofs + publish gate + marketing checklist. |
| [learnings.md](learnings.md) | SDK/Hub/click memory. Appendix. |
| [pipelines.md](pipelines.md) | **Daily vs show integrity.** Authorities, labels, locks — do not mix. Start with § Never again + `npm run verify:preview-path`. |
| [daily-claim-audit.md](daily-claim-audit.md) | **Daily claim source of truth.** Identity contract, claimer vs spectator, multi-prize scale. |
| [V0-FREEZE.md](V0-FREEZE.md) | **Freeze map.** What not to edit; safe V1 prep lanes. |
| [playtest-14oct.md](playtest-14oct.md) | **Latest playtest.** Desktop/mobile pass + guest WEARABLE hole + intended delivery rules. |
| [positioning.md](positioning.md) | **DCL spatial authority.** Axes, Transform, facing, Hub vs code, precision protocol. |
| [layout-next.md](layout-next.md) | **Draft A ladder** — ordered next Previews; no guesswork. |
| [layout-workflow.md](layout-workflow.md) | **Hub visual + layout sync** — simple dress without recreating pipelines. |
| [layout-hub-sync.md](layout-hub-sync.md) | **Exact sync** — MCP connect, name→constant map, checklist. |
| [layout-spawn-desync.md](layout-spawn-desync.md) | **Hub spawn ≠ Preview** — scene.json authority; `sync:spawn`. |
| [layout-position-audit.md](layout-position-audit.md) | **Current meters vs Draft A** — gaps + spawn fork. |
| [LAYOUT-MOVE.md](LAYOUT-MOVE.md) | Reposition wheel/pads/board/audience without breaking pipelines. |
| [layout-mistakes.md](layout-mistakes.md) | Spawn look-ray failures — stop the circle. |
| [audience-sit.md](audience-sit.md) | Sit contract — Restricted Actions need click/E, not walk-in. |
| [how-daily-prizes-work.md](how-daily-prizes-work.md) | Plain-English spin → claim → fulfill. Read this if confused. |
| [SHIP.md](SHIP.md) | Preview, publish, Storage fulfillment. Path to Bay’s bar. |
| [bay-handoff.md](bay-handoff.md) | Copy/paste for Bay: wearables address vs credits. |
| [rewards-architecture.md](rewards-architecture.md) | Wallet identity, server Storage, treasury. Trust model. |
| [fulfillment-workflow.md](fulfillment-workflow.md) | Spin → claim → treasury → winner. Ops path for V0. |
| [../fulfill-worker/README.md](../fulfill-worker/README.md) | **Autopilot** NFT transfers (webhook + Polygon). |
| [thursday-runbook.md](thursday-runbook.md) | Ops checklist for the first real-rewards Meetup. |
| [v1-progression.md](v1-progression.md) | Parked until V0 is proven. |
| [gdd.md](gdd.md) | Frozen pitch that got us in. Do not silently rewrite. |
| [The-WIP-Wheel-GDD.pdf](The-WIP-Wheel-GDD.pdf) | Printable GDD. |
| [apply.md](apply.md) | Application archive. |
| [v0.md](v0.md) | Stub. Content moved into MASTER so we do not maintain two briefs. |
| [week.json](week.json) | Human copy of the guest card. Live scene reads `src/week.ts`. |

**World:** `rizzle.dcl.eth`  
**Repo:** https://github.com/rizzlenft/wip-wheel
