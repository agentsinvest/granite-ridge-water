# 2026-10-07: Quick wins plan from the Zone Plan Model

## Decision

Jennifer shared her Zone Plan Model workbook, built before the bills and meter data were in, and asked to bring its useful modeling into the site. The community cannot afford a large investment, so the focus is small wins under $20,000. Added a "Quick wins" screen that models the workbook's Quick Wins tab: leak repair, a smart controller, no winter overseeding, and summer turf and desert drip stepped down each year from 2027 to 2030.

Rain gardens, rainwater harvesting, and landscape conversion (the workbook's Dashboard, Zones, Catchments, ZoneBalance, and PhasePlan tabs, about $679,000 of projects) stay out of scope, as in CLAUDE.md and as Jennifer asked.

## How it works

* `data/scenarios/quick-wins.md` holds the workbook's levers by year, each with a source and confidence, plus the controller rebate note and the proposed FY26/27 City prices (labeled proposed, low confidence).
* `src/engine/quickWins.ts` splits each meter's water into turf and desert drip by its turf share, applies the levers in order (they multiply), and turns them into ordinary scenario changes priced by `runScenario`. The plan uses the same billing engine, winter allowance, fees, and taxes as the rest of the site.
* `calculateBill` now accepts a third price block whose limit is a multiple of the winter average, for the proposed two-tier peak surcharge. Real rate files still have two blocks; all bills reconcile as before.
* Tests reproduce the workbook: the turf healthy minimum month by month, plan water for all four years to the gallon, and the 2027 bill under proposed prices within 1%.
* The screen is editable (every lever, every year), shareable by URL, priced at today's City prices by default with a switch to the proposed prices, and has a "leave the park turf as it is" switch.
* Upfront costs: no costs are invented. Leak repair and the controller show "Needs a quote", with each step's first-year savings on its own and a 2-year-payback ceiling to compare quotes against. Schedule changes and stopping overseeding are $0 if the landscape contract covers them (to confirm).

## What changed from the workbook, and why

* Baseline: the latest 12 read periods (now Oct 2025 to Sep 2026), not Sep 2025 to Aug 2026.
* Months follow the middle of each read period, the site's convention, not the month the read ends.
* After 2027 prices are held flat (site default) instead of rising 10% a year.
* The winter allowance is the City's rule as reproduced from bills.

## Also from the workbook

* `data/weather/monthly-normals.md`: monthly ETo (AZMET Queen Creek, 2021 to 2025) and rain (NOAA East Mesa), so the turf healthy minimum is now computed, not copied.
* The annual rainfall totals match NOAA East Mesa for 2020 and 2021, which most likely answers which station they came from.
* `config/site.md`: homes (56) and the $20,000 small-wins budget.
* The workbook cites the Mesa Utility Rate Book W-5, effective 04/01/2026, at $5.95, $2.99 peak surcharge, and $0.08 drought, which agrees with the rate derived from the bills.
* Outdated in the workbook: the Meters tab lists meter ...8300 as 2 inch; bills show the 1 1/2 inch service charge.

## Finding

Stopping overseeding alone saves almost no money (about $79 in 2027) even though it cuts a lot of winter water, because the City's lower-price allowance comes from December to February use. It pays off only when paired with the summer steps.

## Open questions

* Quotes for a wet check and leak repair, and for a smart controller (how many controllers, and the rebate terms).
* Whether the landscape contract covers schedule changes and ending overseeding.
* The City's FY26/27 rate proposal or adopted rate book.
* A cited source for the 0.50 turf healthy-minimum plant factor.
