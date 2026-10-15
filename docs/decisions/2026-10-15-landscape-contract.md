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

## Follow-up: landscape problems on the Problems screen

Jennifer asked that every landscape-related problem be listed on the Problems screen. Leak flags need a meter and counted gallons, which contract problems do not have, so they get their own data type instead of being forced into `data/flags/`:

* `data/landscape/<id>.md` (schema `landscapeProblemSchema`, format in `data/landscape/README.md`): rank, status, contract sections, an optional P&L account, and links to the fixing action and to related leak flags. The build fails on an unknown action, flag, or account.
* Dollar amounts are never written in these files. A problem names its P&L account (51110 overseeding, 51120 irrigation repairs) and the page reads the actuals from `data/financials/`.
* Problems screen: a "Landscape contract" section after Watering checks, plus a count in the stats row. Seven problems: no check or leak reporting duty, overseeding billed extra, repairs billed extra with no price list, manual watering billed extra, one-way liability, conflicting fertilizer and weed control terms, and the unsigned copy on file.
* The site is public. The cards describe contract terms factually and never name the landscaper.
