# 2026-10-15: Landscape maintenance contract

## Decision

Jennifer shared the landscape maintenance contract (dated 2024-07-17, $3,442.00 a month, month to month). Transcribed in full to `sources/landscape/maintenance-contract-2024-07-17.md` with review notes. The landscaper's name stays out of `/data/`; data files cite it as "the landscape maintenance contract".

## What changed

* The "assumes the landscaper's contract covers it (to confirm)" note on four options and two actions is replaced with a citation: section 6a puts schedule adjustment in the monthly price. Upfront cost stays $0. This closes the open item in 2026-10-07-quick-wins-plan.md.
* `entrance-drip-back-on` and `rain-response` cite 6a for the setting change; `rain-response` notes that moving the rain sensor is repair work, billed extra (6b, 7m), so it still needs a quote.
* `overseeding-decision` now states that overseeding is billed on top of the contract ($4,137.00 a year on the P&L, 2022 to 2025). That amount is not added to the water savings, because the $30,000 target is water spend only.
* New action `landscape-contract-irrigation-duties`: the contract has no check frequency, no reporting duty, and no water-use responsibility, and every repair is extra.
* `src/lib/publicText.ts` names `sources/landscape` "the landscape maintenance contract" for homeowners.

## Not changed

* Repair costs stay "needs quote": the contract has no labor rate or price list.
* No overseeding cost was added to the scenario engine. It is a landscape cost, not water, and the engine prices water only.
