# Data inventory

Status as of 2026-10-06: **HOA year-end P&Ls for 2020 to 2023 and an annotated area map received. No City of Mesa bills or rate documents yet.** Phase 1 (bill conversion and reconciliation) cannot start until the bills and rate documents below are in `/raw/`.

Originals go in `/raw/` (git-ignored, never deployed). Only public-safe extracts go in `/data/`.

## Source files in hand

| File in /raw/ | What it is | Meter | Date range | Converted to | Notes |
|---|---|---|---|---|---|
| `pl/2020_PL.pdf` | HOA balance sheet and Statement of Revenues and Expenses, December 2020 with year to date | all (combined) | 2020-01-01 to 2020-12-31 | `financials/2020.md` | Text PDF; values verified against text layer |
| `pl/2021_PL.pdf` | Same, 2021 | all (combined) | 2021-01-01 to 2021-12-31 | `financials/2021.md` | Text PDF; values verified against text layer |
| `pl/2022_PL.pdf` | Same, 2022 | all (combined) | 2022-01-01 to 2022-12-31 | `financials/2022.md` | Scanned image, no text layer; read visually, marked `needs_review` |
| `pl/2023_PL.pdf` | Same, 2023 | all (combined) | 2023-01-01 to 2023-12-31 | `financials/2023.md` | Text PDF; values verified against text layer |
| `maps/areas-aerial.webp` | Aerial with 5 named areas (A to E), square footages, slope note | n/a | n/a | `areas.md` | Gross areas, not irrigated areas |

The P&Ls also contain bank account digits and lot owner names. Those were not copied into `/data/`.

## What the P&Ls show so far

HOA water spend (account 50110, Water - Irrigation, all 4 meters combined):

| Year | Actual | Budget | Over (under) budget |
|---|---|---|---|
| 2020 | 36,340.05 | 36,590.00 | (249.95) |
| 2021 | 30,152.64 | 24,650.00 | 5,502.64 |
| 2022 | 32,959.62 | 39,771.00 | (6,811.38) |
| 2023 | 26,016.31 | 32,915.00 | (6,898.69) |

* Water spend fell from 2020 to 2023, and 2023 was already under the $30,000 target. If costs have climbed, the climb is in 2024 to 2026, which we have no records for yet.
* Irrigation repairs ran well over budget every year: $3,037.00 (2020), $2,251.50 (2021), $7,402.00 (2022), $4,498.30 (2023).
* 2022 shows $1,138.60 of "Landscape Irrigation Equipment Incentives" income, which suggests a rebate for irrigation equipment that year.
* These are P&L totals, not bills. They may follow payment dates rather than service periods, and they cannot split cost into price, volume, and fees. Bills are still required.

## Coverage by meter

| Meter | Bills (target: 5 years, about 60 per meter) | Waterfluence daily usage | Meter facts | Zones mapped |
|---|---|---|---|---|
| all (P&L only) | 2020 to 2023 annual totals, no per-meter split | none | none | none |
| meter-1 | 0 | none | missing | none |
| meter-2 | 0 | none | missing | none |
| meter-3 | 0 | none | missing | none |
| meter-4 | 0 | none | missing | none |

## What we need from Jennifer

Ranked by what unblocks the most. Items 1 and 2 are required before any engine work.

1. **City of Mesa bills, all 4 meters, 2021 to now.** Most urgent: 2024, 2025, and 2026 to date, since that is where the cost increase must be. PDFs or exports from the Mesa utility portal. Every page, including any page with rate or fee notices. About 240 bills total if billed monthly.
2. **City of Mesa rate schedules.** Published rates and fees for irrigation / landscape water for 2025, 2026, and 2027 (the adopted schedule and any approved future increases). Older schedules back to 2021 if available. If older ones cannot be found, we will derive them from bills and mark them "derived."
3. **Waterfluence exports per meter.** Daily usage for the full history available, as CSV if possible. Include Waterfluence's own budget column if it has one.
4. **Meter facts.** For each meter: a plain name (for example, "entry" or "north greenspace"), last 4 of the Mesa account, meter size, service type as Mesa lists it, and which controller and stations it feeds.
5. **Zone list with schedules.** For each controller station: what it waters, plant type, irrigation type (spray, rotor, drip, bubbler), approximate square footage, whether it has trees, whether it is turf greenspace, and the current schedule (days, run minutes, start times, seasonal adjust). A landscaper's zone map or controller printout works.
6. **Neighborhood areas.** How you think about the parts of the neighborhood (entry, parkways, greenspace, and so on) and which zones belong to each.
7. **Event history.** Dates of leak finds and repairs, controller replacements or schedule changes, landscape changes, overseeding, and any meter changes. Rough dates are fine; mark them approximate.
8. **HOA P&Ls for 2024, 2025, and 2026 year to date**, same report as the 2020 to 2023 files. This shows the cost trend while bills are being gathered.
9. **Quotes.** Any quotes or proposals for controllers, flow sensors, nozzles, audits, or other investments.

## Open questions

1. Is each meter billed monthly, and on what read cycle? Does it differ by meter?
2. Do the 4 meters share one Mesa account or have separate accounts?
3. Were all 4 meters in service for the full 5 years, or was any meter added (the spec mentions "new meters and fees" as a possible cost driver)?
4. Does Mesa bill irrigation meters on a flat volumetric rate, tiers, or seasonal rates? (Answer from the rate documents, not assumed.)
5. How does Mesa bill a period that crosses a rate change: prorated or at the rate in effect at period end? (If the documents are silent, we test both against real bills.)
6. Which taxes and fees appear on the bills, and which charges are they applied to?
7. Does Waterfluence calculate its own water budget, and which weather source does it use?
8. Which AZMET station is closest and representative for Granite Ridge? (To confirm against the AZMET station list before backfilling weather.)
9. The P&Ls show overseeding every year ($2,520.00 to $4,137.00). Is the turf Bermuda overseeded with winter rye, and in which months does overseed watering run?
10. Who is the landscaper, and do they have a zone map with square footage? (Name stays out of `/data/`; we only need the map.)
11. Which plant factor and efficiency source does the HOA want to treat as authoritative (for example WUCOLS, ADWR, AMWUA, or the landscaper)?
12. Does the management company report the P&L on a cash or accrual basis? (Decides whether P&L water totals should match bill service periods.)
13. What was the 2022 "Landscape Irrigation Equipment Incentives" rebate for (controllers, nozzles, something else), and when was it installed?
14. Why were 2022 irrigation repairs $7,402.00 against a $2,000.00 budget? Was that the start of the leak chasing?
15. Do the map areas (A to E) include any homeowner lot area, or only HOA common area? Which areas are irrigated at all, and on what (drip to trees and shrubs, spray, none)?
16. Is the drywell (2023 reserve budget, $14,000) at the park green low point, and does irrigation runoff collect there?
17. Which meter feeds the park green turf?

## Unknown values in /data/ right now

Every field below is `null` with a `todo` note until a source is in hand.

* `meters/meter-1.md` to `meter-4.md`: all facts.
* `areas.md`: zone membership and irrigated square footage for all 5 areas.
* `financials/2022.md`: needs a second check against the scanned PDF.
* `events.md`: all events except the 2022 rebate (date known to the year only).
* `config/site.md`: AZMET station.
* `config/plant-factors.md`: all plant factors, minimums, efficiencies, and the effective rainfall method.
* `investments/*.md`: all effect values, ranges, costs, and lifespans (7 entries).
