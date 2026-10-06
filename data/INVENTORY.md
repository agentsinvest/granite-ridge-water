# Data inventory

Status as of 2026-10-06: **HOA year-end P&Ls for 2020 to 2025 and an annotated area map received. No 2026 P&L exists yet. No City of Mesa bills or rate documents yet.** Phase 1 (bill conversion and reconciliation) cannot start until the bills and rate documents below are in `/raw/`.

Originals go in `/raw/` (git-ignored, never deployed). Only public-safe extracts go in `/data/`.

## Source files in hand

Full transcriptions of every file below are in `/sources/` (see `sources/README.md`).

| File in /raw/ | What it is | Meter | Date range | Converted to | Notes |
|---|---|---|---|---|---|
| `pl/2020_PL.pdf` | HOA balance sheet and Statement of Revenues and Expenses, December 2020 with year to date | all (combined) | 2020-01-01 to 2020-12-31 | `financials/2020.md` | Text PDF; values verified against text layer |
| `pl/2021_PL.pdf` | Same, 2021 | all (combined) | 2021-01-01 to 2021-12-31 | `financials/2021.md` | Text PDF; values verified against text layer |
| `pl/2022_PL.pdf` | Same, 2022 | all (combined) | 2022-01-01 to 2022-12-31 | `financials/2022.md` | Scanned image, no text layer; read visually, marked `needs_review` |
| `pl/2023_PL.pdf` | Same, 2023 | all (combined) | 2023-01-01 to 2023-12-31 | `financials/2023.md` | Text PDF; values verified against text layer |
| `pl/2024_PL.pdf` | Deposit summary, balance sheet, Statement of Revenues and Expenses, December 2024 with year to date | all (combined) | 2024-01-01 to 2024-12-31 | `financials/2024.md` | Text PDF; values verified against text layer |
| `pl/2025_PL.pdf` | Balance sheet, Statement of Revenues and Expenses, December 2025 with year to date | all (combined) | 2025-01-01 to 2025-12-31 | `financials/2025.md` | Text PDF; values verified against text layer |
| `waterfluence/energy-star-report-2026-09-30.csv` | Usage per Mesa read period, 4 meters | all 4 | 2023-09-15 to 2026-08-12 (35 periods per meter) | `billing-periods/meter-*.md` | Unit is thousand gallons, confirmed by the Waterfluence monthly chart |
| `waterfluence/ami-report-outdoor-2026-09-30.csv` | Hourly AMI gallons, 4 meters | all 4 | 2026-07-03 to 2026-09-30 | `usage/meter-*/2026.md` (daily totals) | Gaps: meter-3 has no reads on 22 of 90 days; other meters miss scattered hours |
| (screenshot in chat) | Waterfluence dashboard, Monthly 1000 Gallons chart with budget band | all (combined) | 2023-10 to 2026-09 shown; history back to 2021 | `sources/waterfluence/monthly-chart-2026-09-30.md` | Confirms the usage unit; image not saved |
| (screenshot in chat) | Waterfluence dashboard, Daily Gallons by meter | all 4 | 2026-09-08 to 2026-10-06 | `sources/waterfluence/daily-chart-2026-10-06.md`, flag `2026-09-meter-4-step-change` | Matches AMI export on overlapping days; October values read by eye only |
| (3 screenshots in chat) | Waterfluence Monthly 1000 Gallons 2021 to 2026, Daily Water Cost, Daily Inches Applied | all 4 | 2021-01 to 2026-10 | `sources/waterfluence/monthly-chart-2021-2026.md`, `daily-cost-chart-2026-10-06.md`, `daily-inches-chart-2026-10-06.md` | Monthly chart matches the export where they overlap; other values read by eye |
| `maps/areas-aerial.webp` | Aerial with 5 named areas (A to E), square footages, slope note | n/a | n/a | `areas.md` | Gross common-area square footage (no homeowner lots, confirmed by Jennifer 2026-10-06); not irrigated area |

The P&Ls also contain bank account digits and owner names (construction deposits). Those were not copied into `/data/`.

## What the P&Ls show so far

HOA water spend (account 50110, Water - Irrigation, all 4 meters combined):

| Year | Actual | Budget | Over (under) budget |
|---|---|---|---|
| 2020 | 36,340.05 | 36,590.00 | (249.95) |
| 2021 | 30,152.64 | 24,650.00 | 5,502.64 |
| 2022 | 32,959.62 | 39,771.00 | (6,811.38) |
| 2023 | 26,016.31 | 32,915.00 | (6,898.69) |
| 2024 | 44,708.39 | 28,054.00 | 16,654.39 |
| 2025 | 45,239.28 | 24,006.00 | 21,233.28 |

* Water spend fell from 2020 to 2023 (2023 was under the $30,000 target), then jumped 72% in 2024 and stayed there in 2025. The increase the app must explain is the step from about $26,000 (2023) to about $45,000 (2024 and 2025). Bills will show whether it came from rates, gallons, or fees.
* The water budget kept going down (to $24,006.00 for 2025) while actual spend went up, so the operating fund ran large losses and borrowed $15,000.00 from reserves in 2025.
* In 2024 the HOA spent $15,522.41 from reserves on landscape and irrigation and $10,800.00 on drywell maintenance, the same year water spend jumped.
* Irrigation repairs: $3,037.00 (2020), $2,251.50 (2021), $7,402.00 (2022), $4,498.30 (2023), $2,555.00 (2024), $3,214.00 (2025).
* 2022 shows $1,138.60 of "Landscape Irrigation Equipment Incentives" income, which suggests a rebate for irrigation equipment that year.
* Waterfluence read-period usage (thousand gallons) for read periods ending in each calendar year: 2024: 7,053; 2025: 6,356. Meter-1 is about half of all use and meter-2 about 30%. Gallons fell about 10% from 2024 to 2025 while P&L water dollars stayed flat, which points to a price increase. This is preliminary until rates and sample bills are in.
* Read-period patterns worth checking against events: meter-1 used 28 units in the 2024-09-13 to 2024-10-11 period and then 717 the next period (largest of any period), and 0 in 2023-11-15 to 2023-12-14. Meter-2 used 0 in 2023-09-15 to 2023-10-16. These look like overseed shutoff and grow-in, but that is unconfirmed. Meter-4 used 130 in 2024-11-13 to 2024-12-12 against a usual 30 to 50.
* Hourly AMI (July to September 2026): meter-1 shows a steady low flow of about 3 gallons per hour in 593 of 2,002 reported hours, and on 13 days with at least 20 hours of reads its flow never reached zero. That is the never-zero pattern the leak engine looks for. At 3 gallons per hour it is roughly 26,000 gallons a year, small in dollars, but it may point to a valve that does not fully close. Meters 3 and 4 also show watering during daytime hours.
* Meter-4 jumped from a median of 75 gallons a day (July and August 2026) to 12,626 on 2026-09-18, 8,759 on 2026-09-22, and about 5,000 to 7,000 a day on 2026-10-02 to 10-04 (Waterfluence chart). Logged as a suggested flag in `data/flags/2026-09-meter-4-step-change.md`. A similar jump happened in fall 2024.
* Some AMI hours repeat an identical value across several hours. These are filled-in hours, so hourly timing on those days is approximate. Daily totals are unaffected.
* Waterfluence's 2021 to 2026 monthly chart (read by eye) shows summers 2021 to 2023 well below its water budget, with summer 2023 the lowest. From 2024, summer use rose to the budget level (about 1,100 to 1,200 thousand gallons at peak vs about 900 in 2021 and 2022 and about 630 in 2023). Every fall has a spike above budget, the largest in November 2024 (1,249). So the 2023 to 2024 cost jump is mostly more water, before any rate change. Needs the 2021 to 2023 export to confirm.
* Waterfluence also calculates daily cost and inches applied, so it already holds a rate assumption and an irrigated area for each meter.
* These are P&L totals, not bills. They may follow payment dates rather than service periods, and they cannot split cost into price, volume, and fees. Bills are still required.

## Coverage by meter

| Meter | Bills (target: 5 years, about 60 per meter) | Waterfluence daily usage | Meter facts | Zones mapped |
|---|---|---|---|---|
| all (P&L only) | 2020 to 2025 annual totals, no per-meter split | none | none | none |
| meter-1 (...8300) | 0 bills; usage for 35 read periods | 2026-07-03 to 2026-09-30 hourly | meter number only | none |
| meter-2 (...4031) | 0 bills; usage for 35 read periods | 2026-07-03 to 2026-09-30 hourly | meter number only | none |
| meter-3 (...4706) | 0 bills; usage for 35 read periods | 2026-07-03 to 2026-09-30 hourly, 22 days missing | meter number only | none |
| meter-4 (...5793) | 0 bills; usage for 35 read periods | 2026-07-03 to 2026-09-30 hourly | meter number only | none |

Meter labels meter-1 to meter-4 are assigned by usage, largest first. They are labels only until Jennifer confirms which meter serves which area.

## What we need from Jennifer

Ranked by what unblocks the most. Items 1 and 2 are required before any engine work.

1. **City of Mesa bills, all 4 meters, 2021 to now.** Most urgent: 2023 through 2026 to date, since the jump is between 2023 and 2024 and we need bills on both sides of it. PDFs or exports from the Mesa utility portal. Every page, including any page with rate or fee notices. About 240 bills total if billed monthly.
2. **City of Mesa rate schedules.** Published rates and fees for irrigation / landscape water for 2025, 2026, and 2027 (the adopted schedule and any approved future increases). Older schedules back to 2021 if available. If older ones cannot be found, we will derive them from bills and mark them "derived."
3. **Waterfluence settings and history.** Most useful: the site or meter setup page showing irrigated square footage, plant type, and budget settings for each meter, and the rate Waterfluence uses for its $ Cost view. Also: received read-period usage from 2023-09 and hourly AMI from 2026-07-03. The dashboard shows history back to 2021, so please export: read-period usage from 2021 (covers the 2023 to 2024 jump), the monthly budget numbers behind the green band, the $ Cost view if it can be exported, and the longest AMI history available.
4. **Meter facts.** Which area each meter (...8300, ...4031, ...4706, ...5793) serves, plus for each meter: a plain name (for example, "entry" or "north greenspace"), last 4 of the Mesa account, meter size, service type as Mesa lists it, and which controller and stations it feeds.
5. **Zone list with schedules.** For each controller station: what it waters, plant type, irrigation type (spray, rotor, drip, bubbler), approximate square footage, whether it has trees, whether it is turf greenspace, and the current schedule (days, run minutes, start times, seasonal adjust). A landscaper's zone map or controller printout works.
6. **Neighborhood areas.** How you think about the parts of the neighborhood (entry, parkways, greenspace, and so on) and which zones belong to each.
7. **Event history.** Dates of leak finds and repairs, controller replacements or schedule changes, landscape changes, overseeding, and any meter changes. Rough dates are fine; mark them approximate.
8. **Quotes.** Also the invoice or proposal for the 2024 reserve landscape/irrigation project ($15,522.41). Any quotes or proposals for controllers, flow sensors, nozzles, audits, or other investments.

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
15. Which map areas are irrigated at all, and on what (drip to trees and shrubs, spray, none)? (Answered: the areas include no homeowner lot area.)
16. Is the drywell (2023 reserve budget, $14,000) at the park green low point, and does irrigation runoff collect there?
17. Which meter feeds the park green turf?
18. What was the 2024 reserve landscape/irrigation project ($15,522.41), and when was it done? Did water use change before or after it?
19. Was the 2024 drywell maintenance ($10,800.00) related to irrigation water pooling at the park green?
20. Why did the water budget drop to $24,006.00 for 2025 after a $44,708.39 actual in 2024?
21. Is the Waterfluence usage unit thousand gallons? (Answered: yes, per the Waterfluence monthly chart.)
22. Do the AMI timestamps mark the start or the end of each hour?
23. Was meter-1 shut off in fall 2023 and fall 2024 for overseeding, and is that what the near-zero periods are?
24. What changed on meter-4 around 2026-09-18 (overseed watering, schedule change, manual run, or a stuck valve)?

## Unknown values in /data/ right now

Every field below is `null` with a `todo` note until a source is in hand.

* `meters/meter-1.md` to `meter-4.md`: all facts.
* `areas.md`: zone membership and irrigated square footage for all 5 areas.
* `events.md`: all events except the 2022 rebate (date known to the year only).
* `config/site.md`: AZMET station.
* `config/plant-factors.md`: all plant factors, minimums, efficiencies, and the effective rainfall method.
* `investments/*.md`: all effect values, ranges, costs, and lifespans (7 entries).
