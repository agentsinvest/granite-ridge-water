# 2026-10-06: Cost estimates on leak flags

## Decisions

* Every flag now carries a plain-language `title` and `summary`, and an `excess_water` block with the extra gallons by date range, how they were counted, a source, and a confidence. The long `evidence` text moves behind "The numbers behind this" on the site.
* Leak water is priced at the margin: the bill for that read period recalculated without the extra gallons, using the same engine that reconciles every priced bill. Extra water on a meter above its winter allowance is charged at the block 2 price.
* Where the bill has not arrived yet, or an episode spans several read periods, the cost is a range from the block 1 price to the block 2 price (plus per-gallon fees and tax). No rate is guessed: 2023 and 2024 water stays "not priced" until rates for those years are derived.
* The meter-1 late-summer flag counts the increase over the same read period in 2025 as its extra water, at low confidence, because it may be a schedule change rather than a leak.
* The meter-4 winter-use flag has no gallon estimate until the Phase 2 water budget exists.
* Possible leaks are shown in their own section on the Meters and areas screen, most expensive first. Meter cards link to them with a one-line headline and cost.
