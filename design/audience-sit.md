# Audience sit — official contract (not guesses)

**Status:** V1 additive. Does not touch claim / show spin / letter pad.  
**Code:** `src/audienceSit.ts`  
**Authority:** Creator Hub [`Seat.ts`](https://github.com/decentraland/creator-hub/blob/main/packages/asset-packs/packs/smart_items/assets/classic_bench/Seat.ts) (`smart_items` / `classic_bench`)

---

## What we got wrong (and the doc that closes it)

| Our guess | What was wrong | Official / docs |
|---|---|---|
| Place feet on plank top (`seatY≈0.52`) | `sittingChair*` is authored for **feet on floor**; hips drop onto the seat. Feet on plank ⇒ float. | `classic_bench` Sit Spot children use **local `y: 0`** on the furniture root |
| `await movePlayerTo` then emote | Await lets **physics settle** and eject the avatar onto/above the seat box **before** the emote starts | `Seat.ts`: `void movePlayerTo` then `void triggerEmote` in the **same sync handler** (no await) |
| Invisible `SEAT_HIT` volumes | Hard to aim; not how seats work | `Seat.ts` binds **the visible seat entity** |
| `InputModifier` freeze + click Stand | Freeze blocks the official exit | Docs + `Seat.ts`: **walk > 1.5 m** frees the seat / interrupts the emote |
| Same-tick move+emote is “always bad” | Order matters; **await** was the bug, not “move then emote” | `Seat.ts` comment: move **before** emote; reverse order cancels. Both are fire-and-forget. |

### Docs that apply

| Fact | Source |
|---|---|
| Seats: click to sit; free when walk > 1.5 m | [Smart items — Seats](https://docs.decentraland.org/creator/scene-editor/interactivity/smart-items.md) |
| While animating: **not affected by collisions**; visual displace ≠ Transform | [Avatar animations](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/avatars/avatar-animations.md) |
| Walk/jump interrupts full-body emotes | Same |
| `sittingChair1` / `sittingChair2` | Same + [Player avatar](https://docs.decentraland.org/creator/scenes-sdk7/interactivity/player-avatar.md) |
| MOVE + EMOTE permissions | `scene.json`; sdk7-test-scenes `80,-4` |
| Bevy `sittingChair*` resolution | [bevy-explorer#1290](https://github.com/decentraland/bevy-explorer/pull/1290) (2026-09-18) |

---

## Working contract (Seat.ts port)

```text
Audience row GLB — `_collider` is physics only. The Sit prompt is a POINTER volume the size of the visible row (3.6 × 1.05 × 1.05), not the old plank.
bindUse(Sit, maxDistance SIT_SPOT.reach 1.7, priority 1)
  → LMB (IA_POINTER) + E (IA_PRIMARY) + proximity ≤1.7 m
Four Sit Spot entities per row, at the cushion centers, world feet y: 0.
Local +X is the row (`cos yaw`, `−sin yaw`); local +Z is the look (`sin yaw`, `cos yaw`) from `benchYawTowardBoard`. Backrest is the opposite of that look. Click volume uses the same yaw.

Click / E Sit
  → void movePlayerTo(spot, avatarTarget = look toward stage)
  → void triggerEmote(sittingChair1|2)     // same tick, no await
  → claim spot; wait until distance ≤ 1.5 m (“arrived”)

Walk farther than 1.5 m
  → free claim (emote already interrupted by locomotion)
```

Wheels / daily use the same `bindUse` at **priority 10** so audience HIT never steals spin proximity. Sit reach is 1.7 m so the cabinet, about 2.2 m from BenchR, does not offer Sit.

`SIT · WATCH THE SHOW` is the gold `AudienceLabel` TextShape — not the pointer hover.

---

## Cross-cutting lessons (reuse elsewhere)

1. **Prefer Foundation scripts over inventing.** Asset-pack `Seat.ts` / Actions handlers are the reference for Restricted Actions.
2. **Do not await `movePlayerTo` before an emote** unless you have frozen inputs *and* a clear destination outside colliders. Await ⇒ physics resolve ⇒ often wrong pose.
3. **Emote Y is feet Y.** Chair sits use floor/root Y; ground sits use ground. Never assume “put Transform on the mesh surface.”
4. **Click the thing players see.** Invisible volumes are a last resort (spin HIT is intentional because the disc tweens).
5. **Locomotion is the interrupt.** Freezing walk to “protect” a sit fights the platform; use freeze only for true cutscenes.

---

## Preview checklist

1. Restart Preview (permissions already include MOVE + EMOTE).  
2. Aim at an orange seat, hover **Sit**, click/E. The nearest of the four cushions is the one you land on.  
3. Feet on the floor, hips on that cushion — not floating, not in the aisle.  
4. **Walk away** ~2 m — sit ends.  
5. Console: `[WIP] sit: sittingChair… @ (…,0.00,…)` then later `walked away`.
