# Next year: need and cost tab (2026-10-18)

Jennifer asked for the need-based model of the next 12 City bills (December 2026 to November 2027) on its own tab, easy to read.

* New tab under Where the water goes: `#water?tab=next-year` (`?case=cautious` for the cautious estimate).
* Inputs live in `data/budget/need-model.md`, each with a source and confidence. Weather comes from `data/weather/monthly-normals.md`, prices from `data/rates/`. Nothing is hardcoded in the component.
* `src/engine/needModel.ts` is pure and prices bills with the existing `calculateBill`. It appends the modeled bills to each meter's read history, so the modeled December to February bills set the winter average for March on, the same rule that reconciles the real bills.
* `tests/needModel.test.ts` pins the hand-worked example (meter 1, July 2027: 237,000 gallons, $2,628.20) and the analysis totals (lean 3,243,000 gallons and $36,076; cautious 4,374,000 and $46,149; today's pace 6,359,000).
* The 2027 rates are the City's recommendation, assumed adopted (Jennifer). The tab says so. Replace with the adopted ordinance after the December 8, 2026 vote.
* Method write-up: `docs/analysis/2026-10-18-need-based-model-dec-2026-to-nov-2027.md`.
