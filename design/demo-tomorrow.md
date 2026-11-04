# Demo day card — do not republish unless the room is dead

**World:** `rizzle.dcl.eth`  
**Play link:** https://play.decentraland.org/?realm=https%3A%2F%2Fworlds-content-server.decentraland.org%2Fworld%2Frizzle.dcl.eth&position=0%2C0  

Scene is in a known-good state for desktop testing (show spin + letter pad + daily claim lock). **Do not ship code changes the morning of the demo** unless the World fails to load.

---

## What is already true (verified 7 Oct evening)

| Item | Status |
|---|---|
| World published, `authoritativeMultiplayer: true` | Live |
| Show wheel open for demo (`SHOW_OPEN_ALWAYS`) | On — anyone can spin pad 1 |
| Daily: one claim / wallet / UTC day | Server Storage |
| Hot treasury wearables | **~77** on hot `0xd961…` + ~4.2 POL (14 Oct `npm run treasury-status`) — staging still holds **~45** (optional sweep) |
| Catalog wearable weight / dailyMax | 40 / 6 — most spins TRY AGAIN; max **6** wearable awards / UTC day (not limited by the old “3 in hot” note) |
| Live stock for rolls | Server syncs NFT count from hot lambdas on wake + before spins — catalog `inventory` is a seed only |
| Credits / crypto weights | Off (`0`) — do not promise them |
| Letter pad | Restored flex-column layout; leave/re-enter if someone still has a stale client |

**Autopilot:** in-server via EnvVar `FULFILLER_PRIVATE_KEY` (no Railway). Confirm key is set before people arrive.

---

## Stocking wearables (do this before people arrive)

Put prize NFTs on the **operating hot** wallet, not only staging:

| Wallet | Address | Role |
|---|---|---|
| **Hot (pays winners)** | `0xd9618C06458e98a831F503194cC8b62fB0384d45` | Load wearables **here** |
| Staging / Bay deposit | `0x351764F8Ef0A80953F80885Fa0f7a7c5F097fC29` | Sweep into hot before the hang |

Confirm: `npm run treasury-status` (count should match what you transferred).

The server **re-reads on-chain NFT count** when the World wakes — you do **not** need a republish just to add stock. Keep ~5+ POL on hot for gas if autopilot is on.

**Odds reality (so tomorrow is not a surprise):**

- Every **wallet** gets **one daily spin attempt** per UTC day. That is the “successful attempt.”
- Landing **WEARABLE** is still a roll (~40% weight vs TRY AGAIN when stock remains).
- Hard cap: **`dailyMax: 6` wearables awarded per UTC day** across the whole room. After that, further spins only hit TRY AGAIN until tomorrow.
- Guests (no wallet) can watch; they cannot claim the daily.

If you want “almost everyone who wins the roll gets paid today,” stock the hot wallet with **more wearables than you expect to award** (and remember the 6/day cap unless you intentionally republish a higher `dailyMax` *after* the demo — not morning-of).

---

## How a wearable actually reaches someone

```text
1. Walleted player uses gold pad
2. Multiplayer Server rolls prize + writes Storage (claim + pendingFulfillment if WEARABLE)
3. Scene animates the wheel
4. Same server reads EnvVar FULFILLER_PRIVATE_KEY, sends Polygon safeTransferFrom
   from hot treasury → winner; clears pending row (retries ~45s while room is occupied)
```

**What to tell players (copy-paste):**

> Gold pad is your one free daily spin — you need a connected wallet, not a guest account.  
> Most spins land on TRY AGAIN; that is normal.  
> If you land on **WEARABLE**, a Decentraland wearable is sent to **the same wallet you used in Explorer**.  
> Check Backpack in a minute or two (Polygon). Stay in the World briefly so the server can finish the transfer.  
> You will not get a second daily spin until tomorrow (UTC).  
> The pink pad is the show wheel for the room; that is separate from the daily prize.

---

## Morning of (15 minutes, off-stage)

1. Open the play link yourself on **desktop Explorer**. Confirm: studio loads, gold pad + pink pad visible, HUD strip reads something sane (not stuck on CONNECTING forever).
2. If first load says **CONNECTING TO SHOW SERVER…** — wait ~15s. First wallet into an empty World wakes the hosted server. Do this **before** you paste the link in Meetup chat.
3. Optional smoke (your wallet, once):
   - Gold pad → wheel moves → result on left board.
   - If already claimed today, that is success (lock works).
   - Pad 1 → show spin → letter pad near bottom → tap a letter → board updates.
4. Pin in Meetup / Discord / wherever people are:
   - `/goto rizzle.dcl.eth`
   - or the play link above
   - One line: **Gold pad = daily chance (wallet). Pink pad / pad 1 = show wheel — watch it slow down.**
5. Skim [decentraland.org/storage](https://decentraland.org/storage) Scene tab for `pendingFulfillment` so you know the queue before people win.

---

## Host script (in-world, voice on)

Keep it short. People will click the biggest thing anyway.

1. **Welcome (30s):** “You’re in The WIP Wheel. Gold pad = today’s free spin. Pink pad = the show wheel — that’s the one we watch together.”
2. **Spectator beat:** Ask one walleted person onto **pad 1**. Everyone else stands in the audience. Call the spin. Let the wheel finish. When CALL A LETTER appears, have them tap a letter on the on-screen pad so the board flips — that is the shared moment.
3. **Daily:** “Wallet required for the gold pad. One spin per wallet today. TRY AGAIN is normal — we only have a few wearables in the treasury.”
4. **If someone wins a wearable:** Congratulate, note their name/wallet, fulfill after (or quietly during) from the hot treasury. Do not halt the hang for ops.
5. **Meetup CTA:** Eye-height plaque / hover opens thewipmeetup.com if you want the hang link.

Do **not** explain Thursday mechanics for five minutes. Title card already says THURSDAYS.

---

## Expectation setting (say this out loud)

- Guests can **watch**; daily claim needs a **wallet**.
- Wearable inventory is **tiny** (~3). Most people hit TRY AGAIN. That is fine for V0 proof.
- Show bank / puzzle is the game-show toy; real daily payouts are the gold pad.
- Phone may feel heavier than desktop — if someone is on mobile and stuck, ask them to try desktop or just spectate.

---

## If something wedges (no republish first)

| Symptom | What to do |
|---|---|
| Empty room / black set | Soft-reload World; wait 15s for server wake. Only redeploy if many people see empty. |
| CONNECTING stuck >30s | Leave and re-enter. Confirm you are not Guest if testing daily. |
| Daily “already claimed” | Working as designed for that wallet/UTC day. |
| Show won’t spin | Someone may still owe a letter (`canGuess`). Call a letter or wait for try-again path. Leave/re-enter clears a stuck client view. |
| Letter prompts but no A–Z pad | Leave/re-enter (stale client). Pad sits **near bottom centre**. |
| Wheel mirrored / weird | Leave/re-enter (known quaternion edge; rare). |
| Wearable win, no NFT yet | Check Storage `pendingFulfillment`; transfer from `0xd961…` manually; clear that row. |

**Do not** flip `SHOW_OPEN_ALWAYS`, edit catalog weights, or “quick polish” mid-demo.

---

## After the session (same day)

1. Transfer any pending wearables; clear fulfilled Storage rows.
2. Note in [MASTER.md](MASTER.md) playtest log: crowd size, desktop vs phone, one thing that confused people, one thing that landed.
3. Tick what you can on [v0-scorecard.md](v0-scorecard.md) (especially spectator + enter).
4. Only then open a fix list — not during the hang.

---

## Links

- Publish / Storage CLI: [SHIP.md](SHIP.md)  
- Thursday ops (full): [thursday-runbook.md](thursday-runbook.md)  
- Fulfillment detail: [fulfillment-workflow.md](fulfillment-workflow.md)  
- Contract / Bay: [MASTER.md](MASTER.md)
