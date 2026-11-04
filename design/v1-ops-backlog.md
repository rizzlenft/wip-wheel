# V1 ops backlog — gaps, World facts, host live

**Date:** 4 Nov 2026  
**Purpose:** Single checklist so Bay demos, Meetups, and doc drift don’t reopen design loops. Code for the Bay pitch is **done**; items here are **ops + polish + host control**.

**Playtest gate:** [v1-solo-playtest.md](v1-solo-playtest.md) · **Show wheel:** [show-wheel.md](show-wheel.md)

---

## World vs Genesis City LAND (this project)

**You are on a World**, not a public-map LAND estate.

| | **This repo (`rizzle.dcl.eth`)** | **Genesis City LAND** |
|---|----------------------------------|------------------------|
| **Reach** | Link / `/goto rizzle.dcl.eth` / Places | Map coordinates, walk-by discovery |
| **Config** | `scene.json` → `worldConfiguration.name` | Parcels you own/rent on the map |
| **Footprint** | Still defined by **`scene.parcels`** in `scene.json` (today: 2×2 = four 16×16 m cells) | Same parcel grid, but tied to LAND tokens |
| **Grow the floor** | Add more parcel coords in `scene.json` **without buying LAND** (World cap **300×300** parcels per [kinds-of-project](https://docs.decentraland.org/creator/scenes-sdk7/kinds-of-projects/kinds-of-project)) | Must own/rent **adjacent** LAND |
| **Upload budget** | NAME-based **shared storage pool** (100 MB per NAME + bonuses); ENS Worlds fixed **36 MB** | **15 MB per parcel** on LAND |
| **Runtime limits** | Same per-parcel **scene budgets** (triangles, materials, textures, entities) — more parcels = higher caps | Same |
| **Extras** | Public/private World, optional multi-scene World (`--multi-scene`) | Shared sky with neighbors |

**Implication:** Expanding the studio is **edit parcels + layout + redeploy**, not “buy the next deed.” Layout regression rules still apply ([positioning.md](positioning.md), [LAYOUT-MOVE.md](LAYOUT-MOVE.md)).

---

## Backlog (priority order)

### P0 — Before Bay self-serve on World

| # | Item | Owner | Done when |
|---|------|-------|-----------|
| P0-1 | Run `npm run verify:v1-preview` + solo script **including one live round** | Rizzle | Logged in [MASTER.md](MASTER.md) |
| P0-2 | Set Scene Storage **`ROUND_EVERY_SEC`** on World (e.g. `900` Meetup, `120` Bay solo test) | Rizzle | Log shows `[SERVER] live round every …` |
| P0-3 | **`FULFILLER_PRIVATE_KEY` + treasury** if Bay should see backpack on live solve | Rizzle | [fulfill-verify.md](fulfill-verify.md) once |
| P0-4 | **Bay cheat sheet** (3 bullets + link to play URL) | Rizzle | Sent with deploy notice |
| P0-5 | Wake note: first visitor ~15s auth-server connect | Rizzle | In cheat sheet |

### P1 — Host “go live” (**shipped** Nov 2026)

| Piece | Detail |
|-------|--------|
| Allowlist | Scene Storage **`HOST_WALLETS`** — comma-separated `0x…` addresses (you control the list; add co-hosts without republish) |
| UI | **START LIVE** / **END LIVE** (HUD) when your wallet is on the list |
| Server | `hostOpenLive` / `hostEndLive` — same roster rules as auto live |
| Heading | **HOST LIVE ROUND** when host-opened; auto clock still runs when you don’t host |

**Setup:** Creator Hub → this project → **Settings / Scene storage / Environment variables** (same for **Preview** and **World** deploy):

```text
HOST_WALLETS=0xYourWalletAddress
```

Use the wallet you connect with in Explorer (lowercase ok). Comma-separate to add co-hosts. Save, **restart Preview** (or redeploy World), connect wallet — **START LIVE** / **END LIVE** appear under the countdown. Preview log should show `[SERVER] host wallets configured: 1` (not `0`).

**Later (not built):** in-world delegate UI — today delegation = you edit `HOST_WALLETS`.

### P2 — Copy & discovery

| # | Item | Notes |
|---|------|--------|
| P2-1 | Update `scene.json` **display.description** | **Done** Nov 4 pre-publish |
| P2-2 | In-world one-liner | **Done** — HUD `GOLD = DAILY · PAD 1 = SHOW` |
| P2-3 | Pod labels | **Done** — OPEN/LIVE on pods 2–3; Join live hover |

### P3 — Confidence before 3-up demo

| # | Item | Notes |
|---|------|--------|
| P3-1 | Two-wallet pass | [v1-solo-playtest.md](v1-solo-playtest.md) § Two-client sync |
| P3-2 | Fourth wallet blocked | Roster full copy |
| P3-3 | Turn order | Lose turn / bankrupt with 2–3 seats |

### P4 — Explicitly V2 (do not scope-creep V1)

- 5th `$WIP` slice + Base send  
- Live **winners** board (second board)  
- Marketplace Credits weight  
- Host `movePlayerTo` contestant ritual  
- Weighted slice odds (optional V1.1 if Bay asks)

---

## Decision log

| Date | Decision |
|------|----------|
| 4 Nov 2026 | Show wheel always 4-slice — [show-wheel.md](show-wheel.md) |
| 4 Nov 2026 | Track ops/host/copy here; pitch code complete per [NOW.md](NOW.md) |
| 4 Nov 2026 | P1 host live shipped — `HOST_WALLETS`, HUD START/END LIVE |
