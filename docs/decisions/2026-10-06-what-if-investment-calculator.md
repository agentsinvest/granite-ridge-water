# 2026-10-06: What if screen, first slice (is an investment worth it?)

## Decision

Built the first part of Phase 5: a calculator where anyone can enter a change or investment, its upfront cost, yearly cost, expected life, and expected water saving (percent of a meter's water, or gallons per month, with optional worst and best case), and see whether it pays back. Jennifer asked for this with the example of $6,000 on a smart controller for meter 4.

## How it works

* `src/engine/investment.ts` is pure and unit tested (`tests/investment.test.ts`). It re-prices each chosen meter's last 12 read periods through `calculateBill` at the latest rate file, once as is and once with the saving applied, so blocks, the winter allowance, fees, and taxes are all handled the way the City bills them.
* The saving is applied to the winter read periods too, so the cheaper winter allowance shrinks with it. This is the steady state after a permanent change's first winter. The 2026-10-06 smart controller analysis held the allowance fixed and used an earlier 12-month window, so its figures differ slightly.
* Outputs: lower bills a year, simple payback, 5-year net, net over the expected life, the most any change could save (the same bills with no water), and the break-even cut needed to pay back in 5 years and within the expected life.
* Results stay hidden unless the reconciliation gate is met (today 52 of 52 priced bills).
* Catalog investments can prefill the form. All catalog values are still `null`, so the page says "needs a quote" and the user enters their own numbers. User entries are labeled as the user's estimate, not a quote.
* Open leak flags on the chosen meters are shown next to the result, because a percent cut does not stop a leak or a stuck valve.
* Inputs are saved in the URL hash (`#what-if?m=meter-4&cost=6000&val=20`), so a result can be shared.

## Limits

* Changes apply to a whole meter. Zones and areas are not tied to meters in the data yet.
* Stacking several changes, turn down or off levers, saved scenarios in `data/scenarios/`, and side-by-side compare are not built yet.
* Rates are the derived 2026-05-13 rate held flat. No published 2025 to 2027 schedule is on file.
