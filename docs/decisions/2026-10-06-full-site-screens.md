# 2026-10-06: All screens live, experiments, data needs, bill filters

## Decisions

* Every screen in the spec is now built: Overview, How we got here, Meters and leaks, How much should we use, What if, Recommended moves, Bills, and Data and accuracy. An Experiments screen is added.
* **How we got here** splits each year-over-year change into water used, price, and fixed fees, using only meter bills on file for the same month in both years, so the pieces add up exactly. Gallons by year use October to September windows of Waterfluence read periods, the only full years on file.
* **How much should we use** shows the annual site-level check from `docs/analysis/2026-10-06-are-we-overwatering.md` (now `data/budget/annual-check.md`), labeled low confidence. It was kept off the site before; it is shown now because neighbors need a sense of "enough water", and every row carries its source. The daily, per-zone budget still needs AZMET weather (blocked from the build environment) and the zone list.
* **What if** prices scenarios at the latest derived City rate and assumes changes have been in place a full year, so the winter allowance (the cheaper first block) is recalculated from the scenario's own December to February use. This shows that cutting winter water alone can raise the bill; the Recommended moves screen lists such options as "would not save money as written" instead of ranking them.
* **Recommended moves** come from leak flags, the investment catalog, and new `data/options/` files. Option percents are proposed sizes, not results; savings are computed by the engine. Options touching the park turf are hidden unless the greenspace toggle is on, per the spec. Upfront cost 0 for setting changes assumes the landscaper's contract covers them (to confirm).
* **Experiments** live in `data/experiments/`. The check compares average daily gallons on complete days before and after the start; thresholds live in `config/site.md` under `experiment_check`. Weather is not adjusted for. A planned experiment for the meter 4 valve repair is seeded with no start date.
* **Data needs** are a ranked table in `data/data-needs.md`, shown on Data and accuracy along with freshness, estimates, quotes needed, and every open `todo`.
* **Bills** can be filtered by preset period (last 12 or 24 months, any year, all) or chosen months, and by meter. The filter is kept in the link.
* Meter replacement dates (meters 1, 2, and 4) were added to `events.md` from the meter numbers printed on the bills, at month precision.
* Charts use Recharts with a fixed color per meter, and each has a "Show as a table" view.

## Merge with main (2026-10-07)

* Main added an investment calculator at `src/pages/WhatIf.tsx` while this branch built the scenario builder under the same name. Both are kept: the scenario builder is "What if" (`#whatif`), and the calculator moved to `src/pages/Investment.tsx` as "Is an investment worth it?" (`#invest`). Old `#what-if` links open the calculator with their inputs.
* Investments on Recommended moves and in the What if investments list link to the calculator, prefilled from the catalog.
