# 2026-10-07: Summer surcharge and the winter base on Problems

## Decision

Jennifer noted that the Problems screen never mentioned the summer surcharge or how the December to February "winter base" sets it. Added a "Summer surcharge set by winter use" section to Problems, after Watering checks.

* `src/engine/winterBase.ts` (pure, tested in `tests/winterBase.test.ts`):
  * `winterBase()` returns each meter's winter base (average of the read periods ending December, January, and February, the same rule `calculateBill` uses), the read periods priced with it so far, how many went above it and by how much, the busiest period and its multiple of the base, and the City's recommended top-tier line (1.5 times the base) when the next rate has one.
  * `winterCutEffect()` prices the latest 12 read periods with and without 1,000 fewer gallons in each winter period, each with its own steady-state base (as `runScenario` does), and splits the result into winter savings and the surcharge added to the rest of the year.
* `priceYear()` in `src/engine/scenarios.ts` is now exported (was the private `price()`), so both use the same pricing.
* Dollars paid above the base by year come from `data/history/by-meter-year.md` (Peak surcharge column).

## What it shows today

* Winter base, December 2025 to February 2026 reads: meter 1 126, meter 2 67, meter 3 21, meter 4 31 thousand gallons a month.
* Busiest month since March 2026: 1.4 to 4.9 times the base. 64% of the water since March was above the base.
* $7,506 paid above the base in 2026 so far (January to August bills), $7,078 in 2025.
* Using 1,000 fewer gallons a month in December to February saves about $19.62 in winter but adds about $29 to the rest of the year on meters 1 to 3 at today's prices (net +$9.51 on meter 1), and more at the recommended 2027 prices. This agrees with the overseeding and meter 4 winter-watering actions.
* The December 2026 to February 2027 reads set the base for March 2027 to February 2028, the first bills under the recommended two-tier surcharge.

## Open questions

* The winter base rule is derived from bills, not confirmed by the City in writing.
