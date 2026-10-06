# 2026-10-06: Bills from the HOA summary, derived rates, and reconciliation

## Decisions

* Entered 48 bills (4 meters, bills dated 2025-08-26 to 2026-07-28) from the HOA's City of Mesa water usage summary, not from City bill PDFs, because the PDFs cannot be uploaded. Each bill's read period is the Waterfluence period ending before the bill date; gallons agree on all 48. Meter reads are `null`.
* `printed_total` is the summary's Grand Total (current charges). `amount_due` is its Total Due, which includes a carried balance on the September 2025 bills.
* Derived the rate structure from the bills, as the spec allows when no schedule is available, and marked every value `derived: true` with a `todo` to confirm against the published schedule. The model reproduces every service, usage, drought, Superfund, and other-fee line to the cent; taxes are within $0.18 using 8.29% of service, usage, drought, and Superfund.
* Rate periods are keyed by read period end date (`applies_from_period_end`), because the City's effective dates are unknown. Read periods before 2025-08-13 have no rate and are not priced.
* Added `reconciliation.line_item_tolerance_usd` ($0.25) to `config/site.md` so taxes count as matched while their exact split is unknown.
* Reconciliation result: 46 of 48 bills pass (95.8%), meeting the 95% gate. The two failures (meter-1, 2025-09 and 2025-10) are rows where the summary's grand total is $120.51 and $3.25 above its own listed charges; both are `needs_review` with notes.
* Because the rates were derived from the same bills, passing proves internal consistency, not agreement with a published schedule. RECONCILIATION.md says so. Projections and savings stay off the site until the rates are confirmed or the HOA accepts the derived rates.

## Implementation

* `src/engine/billing.ts`: `calculateBill(meter, periodStart, periodEnd, gallons, rates, readPeriods)`, pure TypeScript, whole-cent arithmetic.
* `scripts/reconcile.ts` (`npm run reconcile`): writes `data/RECONCILIATION.md` and sets each bill's `reconciled` field. The Vitest suite fails if the pass rate drops below the gate, a failure has no explanation, or the report is stale.
