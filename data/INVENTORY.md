# Data inventory

Status as of 2026-10-06: **HOA year-end P&Ls for 2020 to 2025, an annotated area map, Waterfluence exports and settings, and a summary of 48 City of Mesa bills (all 4 meters, bills dated 2025-08-26 to 2026-07-28) received. No published City rate schedule yet.** Phase 1: rates were derived from the 48 bills and 46 of 48 bills reconcile (see `RECONCILIATION.md`). Bills before August 2025 and the published rate schedule are still needed.

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
| `waterfluence/ami-report-outdoor-2026-10-06.csv` | Hourly AMI gallons, 4 meters | all 4 | 2026-07-08 to 2026-10-06 | merged into `usage/meter-*/2026.md` and `sources/waterfluence/ami-hourly-*` | Agrees with the 2026-09-30 export on all 6,594 overlapping hours; adds 439 new hours |
| (3 screenshots in chat) | Waterfluence Hourly Cubic Feet, Hourly Gallons, Tree & Shrub Environmental Benefits | all | 2026-07 to 2026-10 | `sources/waterfluence/hourly-charts-2026-10-06.md`, `tree-shrub-benefits.md` | Benefits table cites a site Budget Table with tree and shrub area (728,295 ft2 times density factor) |
| `waterfluence/energy-star-report-2026-10-06.csv` | Usage per Mesa read period, 4 meters | all 4 | 2023-09-15 to 2026-09-14 (36 periods per meter) | `billing-periods/meter-*.md` | Supersedes the 2026-09-30 export; identical on all shared rows |
| (9 screenshots in chat) | Waterfluence Landscape Map, 4 Controller Maps, Water Budget, Default Budget Factors, Agency, Water Meters | all 4 | map updated about late 2024 | `sources/waterfluence/landscape-and-controller-maps.md`, `water-budget-and-site-settings.md`; `meters/*.md`, `areas.md`, `config/plant-factors.md`, `config/site.md`, `map.md` | Account numbers last 4 only; service addresses kept out of `/data/` |
| `bill-summary/meter-*.jpg` (4 images) | HOA water usage summary of City of Mesa bills: every charge line, total due, grand total, gallons | all 4 | bills dated 2025-08-26 to 2026-07-28 (12 per meter) | `bills/meter-*/*.md` (48 files), `rates/*.md` (3 derived rate periods); `sources/bills/water-usage-summary-2025-2026.md` | Account and meter columns redacted in saved images. 3 rows do not add up and are marked `needs_review` |
| `invoices/invoices.pdf` (334 scanned pages, downloaded 2026-10-06) | City of Mesa summary bills, December 2019 to August 2026 (76 bill dates) | all 4 | 2019-12-26 to 2026-08-26 | 214 more bills in `bills/meter-*/` (266 in all); see `scripts/ocr/README.md` | OCR. 253 meter-bills validated; about 50 not readable yet. Gallons unknown for most 2020 to 2022 bills (meter reads did not OCR). |
| `invoices/invoices-text.txt` (Google Drive text of `Invoices (1)_opt (1).pdf`, 18.6 MB) | City of Mesa summary bills with meter reads and every charge | all 4 | Drive returned bills dated 2024-12-27 to 2026-08-26 only (text cut off at about 127,000 characters) | 25 summary bills confirmed line by line and given meter reads; 4 bills for 2026-08 added; `sources/bills/city-bills-2024-12-to-2026-08-text.md` | Older bills (2020 to 2024) in the PDF not yet readable: file is over the connector's 10 MB download limit and direct download is blocked |
| (screenshot in chat) | Waterfluence Summary of 1 Sites: landscape characteristics and annual performance | all | last 12 months | `sources/waterfluence/summary-landscape-and-annual-performance.md` | Applied 2.8 ft vs budget 3.0 ft (95%) |
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
* Meter-4 looks like a valve that does not shut off: three times since 2026-09-18 its 2 AM cycle kept running (until about 7 PM on 09-18, until about 10 AM on 09-22, and for about 62 hours at a steady 300 gallons an hour from 10-02 to 10-04). About 39,500 gallons in all. Logged as a suggested flag in `data/flags/2026-09-meter-4-step-change.md`. A similar jump happened in fall 2024.
* Some AMI hours repeat an identical value across several hours. These are filled-in hours, so hourly timing on those days is approximate. Daily totals are unaffected.
* Waterfluence's 2021 to 2026 monthly chart (read by eye) shows summers 2021 to 2023 well below its water budget, with summer 2023 the lowest. From 2024, summer use rose to the budget level (about 1,100 to 1,200 thousand gallons at peak vs about 900 in 2021 and 2022 and about 630 in 2023). Every fall has a spike above budget, the largest in November 2024 (1,249). So the 2023 to 2024 cost jump is mostly more water, before any rate change. Needs the 2021 to 2023 export to confirm.
* Waterfluence also calculates daily cost and inches applied, so it already holds a rate assumption and an irrigated area for each meter.
* Meter locations (Waterfluence Controller Map): meter-1 (...8300) and meter-2 (...4031), the two largest users, sit at the northeast and northwest corners of the park; meter-3 (...4706) is at the entry gate; meter-4 (...5793) is on the east side at the end of the interior strip. Which areas each meter waters is still unknown.
* Waterfluence's budget uses AZMET Encanto weather, shrub 728,295 ft2 at 12% of ETo and turf 86,354 ft2 at 86% of ETo (20% overall), and prices water at a flat $8.35 per thousand gallons.
* City bills, August 2025 to July 2026: $50,269.45 (corrected: the summary's meter-3 September 2025 grand total was $0.10 high) for 6,496,000 gallons (meter-1 $27,738.81, meter-2 $16,328.94, meter-3 $3,165.89, meter-4 $3,035.81). This includes $123.76 in late charges on meter-1 after the August 2025 bills were paid late. That is about $20,300 above the $30,000 target.
* Rate structure, derived from the bills: a service charge, the first 3,000 gallons included, then two price blocks split at each meter's winter allowance (its December to February average). Block prices rose from $4.76 and $7.15 per thousand gallons to $5.71 and $8.46 (read periods ending from 2026-02-12) and to $5.95 and $8.94 (from 2026-05-13): about 25% in six months. Water above the winter allowance costs about 50% more.
* Because the allowance comes from winter use, winter watering (including overseed and leaks) raises the following year's cheaper block. The fall 2024 spike on meter-4 raised its 2025 allowance; cutting winter water lowers next year's allowance. Scenarios must model this.
* Waterfluence rates the site at 95% of its water budget (2.8 ft applied vs 3.0 ft budget over the density-adjusted area), so on Waterfluence's own factors the landscape is not heavily overwatered overall. Reaching $30,000 means using less than Waterfluence's budget or changing the landscape factors, not only fixing leaks.
* Meter-3's meter was replaced on 2025-04-30 (old meter ...3703, new meter ...4706). Meters 1 and 2 water the park turf and the shrubs and trees around it (Jennifer); the extent beyond the park is not confirmed.
* The derived rates also reproduce the four August 2026 bills, which were not used to derive them: an independent check of the rate model.
* The full bill PDF shows all four meters were replaced: meter-2 about December 2023 (old ...1425), meter-1 about April 2024 (old ...1424), meter-4 about October 2024 (old ...3676), meter-3 on 2025-04-30 (old ...3703). The two big meters were replaced just before the 2024 cost jump; old meters can under-read, which may account for part of the jump (to be tested).
* Block 1 price per thousand gallons (from low-use bills): about $3.47 (2019 to 2020), $3.55 (2021 to 2022), $4.01 (from about April 2023), $4.31 (from about April 2024), $4.76 (from about February 2025), $5.71 (February 2026), $5.95 (May 2026).
* Meter-4 used about 46,000 to 61,000 gallons every month through 2023 and 2024, summer and winter, until its meter was replaced in October 2024: the never-zero pattern of continuous flow.
* Bill totals by calendar year do not yet reconcile with the P&L (missing bills, and 2022 bills sum $7,138 above the P&L). To be resolved once the remaining bills are read.
* These are P&L totals, not bills. They may follow payment dates rather than service periods, and they cannot split cost into price, volume, and fees. Bills are still required.

## Coverage by meter

| Meter | Bills (target: 5 years, about 60 per meter) | Waterfluence daily usage | Meter facts | Zones mapped |
|---|---|---|---|---|
| all (P&L only) | 2020 to 2025 annual totals, no per-meter split | none | none | none |
| meter-1 (...8300) | 0 bills; usage for 35 read periods | 2026-07-03 to 2026-09-30 hourly | meter number only | none |
| meter-2 (...4031) | 0 bills; usage for 35 read periods | 2026-07-03 to 2026-09-30 hourly | meter number only | none |
| meter-3 (...4706) | 0 bills; usage for 35 read periods | 2026-07-03 to 2026-09-30 hourly, 22 days missing | meter number only | none |
| meter-4 (...5793) | 0 bills; usage for 35 read periods | 2026-07-03 to 2026-09-30 hourly | meter number only | none |

Meter labels meter-1 to meter-4 are labels only. Meter-1 and meter-2 are the two largest users; meter-4 uses slightly more than meter-3 (1,622 vs 1,431 thousand gallons, 2023-09 to 2026-09), despite the numbering. An earlier note said all four were numbered largest first; that was wrong for 3 and 4.

## What we need from Jennifer

Ranked by what unblocks the most.

1. **Nothing more needed for bills right now.** The full PDF is in. About 50 meter-bills did not OCR cleanly and most 2020 to 2022 bills lack readable meter reads; these can be filled by reading the scanned pages directly.
2. **Which meter waters what.** Meters 1 and 2 water the park turf and nearby shrubs and trees; still needed: how far their zones reach, and which meter waters the west and south desert, the perimeter, and the interior strip. A controller printout or the landscaper's zone list works.
3. **Zone list with schedules.** For each controller station: what it waters, plant type, irrigation type (spray, rotor, drip, bubbler), approximate square footage, whether it has trees, and the current schedule (days, run minutes, start times, seasonal adjust).
4. **Meter-4 valve.** Whether the landscaper shut water off on 2026-09-18, 09-22, and 10-04, and whether the 2 AM valve has been inspected.
5. **City of Mesa rate schedules.** Published rates and fees for landscape water (2025 to 2027). Rates are now derived from bills; the published schedule would confirm them and give the City's effective dates.
6. **Waterfluence history and settings.** Read-period usage back to 2021, the monthly budget numbers behind the green band, and the longest AMI history available.
7. **Event history.** Dates of leak finds and repairs, controller or schedule changes, landscape changes, and overseeding. Rough dates are fine. Also the invoice for the 2024 reserve landscape and irrigation project ($15,522.41).
8. **Quotes.** Any quotes or proposals for controllers, flow sensors, nozzles, audits, or other investments.

## Open questions

1. Is each meter billed monthly, and on what read cycle? Does it differ by meter? (Answered: monthly, same read cycle for all four.)
2. Do the 4 meters share one Mesa account or have separate accounts? (Answered: separate, consecutive accounts ending 865-1 to 868-1.)
3. Were all 4 meters in service for the full 5 years, or was any meter added (the spec mentions "new meters and fees" as a possible cost driver)?
4. Does Mesa bill irrigation meters on a flat volumetric rate, tiers, or seasonal rates? (Derived from bills: two blocks split at a per-meter winter allowance. Confirm from the rate schedule.)
5. How does Mesa bill a period that crosses a rate change: prorated or at the rate in effect at period end? (If the documents are silent, we test both against real bills.)
6. Which taxes and fees appear on the bills, and which charges are they applied to? (Partly answered: water drought, Superfund, $7.32 other fees, and about 8.29% taxes. The exact tax split needs one full City bill.)
7. Does Waterfluence calculate its own water budget, and which weather source does it use? (Answered: yes, Landscape Coefficient Method with AZMET Encanto weather. See `config/plant-factors.md`.)
8. Which AZMET station is closest and representative for Granite Ridge? (Partly answered: Waterfluence uses Encanto, in central Phoenix. Check for a closer station once azmet.arizona.edu is reachable.)
9. The P&Ls show overseeding every year ($2,520.00 to $4,137.00). Is the turf Bermuda overseeded with winter rye, and in which months does overseed watering run?
10. Who is the landscaper, and do they have a zone map with square footage? (Name stays out of `/data/`; we only need the map.)
11. Which plant factor and efficiency source does the HOA want to treat as authoritative (for example WUCOLS, ADWR, AMWUA, or the landscaper)?
12. Does the management company report the P&L on a cash or accrual basis? (Decides whether P&L water totals should match bill service periods.)
13. What was the 2022 "Landscape Irrigation Equipment Incentives" rebate for (controllers, nozzles, something else), and when was it installed?
14. Why were 2022 irrigation repairs $7,402.00 against a $2,000.00 budget? Was that the start of the leak chasing?
15. Which map areas are irrigated at all, and on what (drip to trees and shrubs, spray, none)? (Answered: the areas include no homeowner lot area.)
16. Is the drywell (2023 reserve budget, $14,000) at the park green low point, and does irrigation runoff collect there?
17. Which meter feeds the park green turf? (Answered by Jennifer: meters 1 and 2, which also water the surrounding shrubs and trees. Which shrub and tree zones, and which meter waters areas B, C, and D, is still unknown.)
18. What was the 2024 reserve landscape/irrigation project ($15,522.41), and when was it done? Did water use change before or after it?
19. Was the 2024 drywell maintenance ($10,800.00) related to irrigation water pooling at the park green?
20. Why did the water budget drop to $24,006.00 for 2025 after a $44,708.39 actual in 2024?
21. Is the Waterfluence usage unit thousand gallons? (Answered: yes, per the Waterfluence monthly chart.)
22. Do the AMI timestamps mark the start or the end of each hour?
23. Was meter-1 shut off in fall 2023 and fall 2024 for overseeding, and is that what the near-zero periods are?
24. Did someone shut off meter-4 on 2026-09-18 (about 7 PM), 09-22 (about 10 AM), and 10-04 (about 4 PM)? Which valve runs at 2 AM on meter-4, and has it been inspected?
25. What were the $120.51 extra on meter-1's 2025-09-26 bill and the $3.25 extra on its 2025-10-24 bill? (Answered from the City bills: a late fee of $111.27 plus $9.24 tax, and a $3.00 delinquent letter charge plus $0.25 tax.)
26. What are Waterfluence's "Lost $" ($3.6k) and "Score" (98)?

## Unknown values in /data/ right now

Every field below is `null` with a `todo` note until a source is in hand.

* `meters/meter-1.md` to `meter-4.md`: all facts.
* `areas.md`: zone membership and irrigated square footage for all 5 areas.
* `events.md`: all events except the 2022 rebate (date known to the year only).
* `config/plant-factors.md`: minimum plant factors, tree allowance, and our own effective rainfall method (site factors now from Waterfluence).
* `bills/*`: meter reads (not in the bill summary); bills before August 2025.
* `rates/*`: City effective dates, meter sizes, service type, and the exact tax split.
* `investments/*.md`: all effect values, ranges, costs, and lifespans (7 entries).
