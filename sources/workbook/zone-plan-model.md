---
document: "Granite Ridge Zone Plan Model (Excel workbook), Jennifer's planning model built before the bills and meter data were in hand, updated Oct 2026 with a Quick Wins tab"
provided_by: "Jennifer, 2026-10-07, uploaded as Granite_Ridge_Zone_Plan_Model_1.xlsx"
transcription: "Cell values exported with openpyxl (formulas evaluated as last saved). Row numbers below are the order of non-empty rows, not Excel row numbers. Numbers rounded to 4 decimals."
redactions: "Account numbers and meter numbers shortened to the last 4 digits."
scope: "Tabs in scope for the app are transcribed in full: Start, Quick Wins, Inputs, Sources, History, Meters (top table). The rain-garden and zone-conversion tabs (Dashboard, Zones, Catchments, ZoneBalance, PhasePlan) are summarized only, because rain gardens, rainwater harvesting, and landscape conversions are out of scope (CLAUDE.md). QW Calc holds only the formulas behind Quick Wins and is described, not copied. The original file is kept outside git."
---

# Granite Ridge Zone Plan Model

Jennifer: "This is a modeling spreadsheet I built prior to having water bills and water data. I think the information is useful and valuable, just might be outdated. The community cannot afford to invest a large sum of money into rain gardens and water harvesting, but some small wins under $20k, if the math maths, will help."

## Start

| Row | A | B |
|---|---|---|
| 1 |  | START HERE: Granite Ridge zone-by-zone plan to take common areas off irrigation |
| 2 |  | NEW (Oct 2026): start with the Quick Wins tab. It uses the four real meters and actual metered use from the Mesa bills, and models the no-construction steps first (leaks, controller, no overseeding, gradual summer turf and desert drip cuts). The rain-garden phase plan (Dashboard, Zones, PhasePlan) remains as the long-term option. |
| 3 |  | The idea |
| 4 |  | Work zone by zone. Each zone gets rain gardens (sunken, mulched basins) and curb cuts that route street and sidewalk runoff in, then is replanted with desert natives. After a short drip establishment period, the zone runs on rain. When every zone on a meter is rain-fed, that meter can be shut off, which also ends its monthly service charge. Turf green space goes last. |
| 5 |  | How the model decides if a zone can live on rain |
| 6 |  | ZoneBalance keeps a monthly 'soil bank' for each zone: rain on the zone plus routed runoff goes in, plant water need comes out, and the bank can only hold what the root zone stores. Winter and monsoon rain fill it; May and June draw it down. If the bank runs dry, the shortfall is irrigation. If the shortfall is zero, the zone is rain-fed. If not, Zones shows how much more street area you'd need to route in. |
| 7 |  | Fill it in this order |
| 8 |  | 1. History: the HOA's annual water cost (2020-2025) is already entered and converted to estimated gallons to calibrate the model. Meters: describe what each meter serves and its size (from any Mesa bill). If you later get per-meter use, enter it there and it overrides the HOA-wide calibration. |
| 9 |  | 2. Zones: list every common area, which meter waters it, square footage, plant type today, target plant type, phase number, and whether it gets rain gardens. |
| 10 |  | 3. Catchments: list the streets, sidewalks and roofs that can drain into each zone, and pick the zone each one feeds. |
| 11 |  | 4. PhasePlan: set which plan year each phase starts. Inputs: confirm the yellow assumptions and cost quotes. |
| 12 |  | 5. Dashboard: read the results, then switch the rain year to 'Dry year (2020)' to see which zones would need backup water in a drought. |
| 13 |  | Where the real numbers come from |
| 14 |  | Meters and use: the Waterfluence tab holds actual monthly use by meter (Sep 2023 to Aug 2026) and a summary of hourly reads (Jul to Sep 2026). Confirm which tract each meter serves from the Waterfluence site/landscape details or the meter locations. Areas: Maricopa County Assessor aerial map measuring tool, or the landscape contract. Streets: confirm whether they're HOA tracts or city right-of-way, since curb cuts into city right-of-way need a permit. |
| 15 |  | Caveats |
| 16 |  | Tract areas, street area and home count come from Maricopa County Assessor parcels; the turf area is measured from satellite imagery. Which meter serves which tract, which areas are actually irrigated, and project costs are still assumptions. Plant factors and soil storage are planning values; a landscape architect or Watershed Management Group-style designer should confirm basin sizing. Very dry years (like 2020 at 4.6 in) may still need a few deep waterings, so keep a hose bib or quick-coupler even after a meter is off. Mesa's turf incentive is first-come and not guaranteed. |

## Quick Wins

| Row | A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | QUICK WINS PLAN: cut water without construction, keep the green |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 2 | Low-hanging fruit first: fix leaks, add a smart controller, stop winter overseeding, then step summer turf water and desert drip down a little each year. Baseline is actual metered use by meter. Bills use Mesa's proposed 2027 rates (tiered surcharge) and escalate after that. |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 3 | 1. ASSUMPTIONS |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 4 | Mesa usage rate 2027 ($ per 1,000 gal over 3,000) | 6.8425 | Proposed FY26/27: $5.95 +15% |  |  |  |  |  |  |  |  |  |  |  |
| 5 | Surcharge Tier 1, up to 150% of winter average ($/1,000) | 3.4385 | Proposed: $2.99 +15% |  |  |  |  |  |  |  |  |  |  |  |
| 6 | Surcharge Tier 2, above 150% of winter average ($/1,000) | 3.7375 | Proposed: $2.99 +25% |  |  |  |  |  |  |  |  |  |  |  |
| 7 | Drought charge ($/1,000) | 0.13 | Proposed |  |  |  |  |  |  |  |  |  |  |  |
| 8 | Superfund ($/1,000) | 0.0066 | From the bills |  |  |  |  |  |  |  |  |  |  |  |
| 9 | Sales tax | 0.0829 | From the bills |  |  |  |  |  |  |  |  |  |  |  |
| 10 | Environmental mandate fee ($ per account per month) | 7.32 | From the bills |  |  |  |  |  |  |  |  |  |  |  |
| 11 | Service charge increase in 2027 | 0.035 | Proposed |  |  |  |  |  |  |  |  |  |  |  |
| 12 | Annual rate escalation after 2027 | 0.1 | ASSUMPTION; Mesa has raised landscape rates 5% to 25% a year |  |  |  |  |  |  |  |  |  |  |  |
| 13 | Homes | 56 | County parcels |  |  |  |  |  |  |  |  |  |  |  |
| 14 | Target annual water bill ($) | 30000 | Board goal |  |  |  |  |  |  |  |  |  |  |  |
| 15 | Turf area (sq ft) | 86354 | Waterfluence measured turf |  |  |  |  |  |  |  |  |  |  |  |
| 16 | Turf healthy-minimum plant factor (summer) | 0.5 | ASSUMPTION; Bermuda stays green at roughly 0.5 to 0.6 |  |  |  |  |  |  |  |  |  |  |  |
| 17 | Turf sprinkler efficiency after the wet check | 0.75 | ASSUMPTION |  |  |  |  |  |  |  |  |  |  |  |
| 18 | 2. METERS AND BASELINE (actual water use, 1,000s of gallons, by meter-read month) |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 19 | Baseline to use | Last 12 months |  | Last 12 months = meter reads Sep 2025 to Aug 2026. The 2024-2025 average includes the Oct/Nov 2024 overseed spike. |  |  |  |  |  |  |  |  |  |  |
| 20 | Meter | Account | Location | Size | Service $/mo (2026) | Turf share of water |  |  |  |  |  |  |  |  |
| 21 | ...8300 | ...4865 | East side of the green, 99th Way | 1 1/2" | 55.01 | 0.88 | Turf share: hourly smart-meter data shows ~88% (...8300) and ~90% (...4031) of green-meter water flows at sprinkler-level rates; the rest is treated as desert drip. |  |  |  |  |  |  |  |
| 22 | ...4031 | ...4867 | West side of the green, 98th Pl | 1 1/2" | 55.01 | 0.9 |  |  |  |  |  |  |  |  |
| 23 | ...4706 | ...4868 | NW entry, McKellips & 98th Pl | 1" | 39.3 | 0 |  |  |  |  |  |  |  |  |
| 24 | ...5793 | ...4866 | 99th Way near June St | 1" | 39.3 | 0 |  |  |  |  |  |  |  |  |
| 25 | Month | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Year |
| 26 | ...8300 last 12 months | 115 | 159 | 166 | 260 | 310 | 575 | 575 | 374 | 313 | 342 | 232 | 104 | 3525 |
| 27 | ...4031 last 12 months | 58 | 85 | 88 | 147 | 192 | 325 | 324 | 229 | 191 | 200 | 135 | 57 | 2031 |
| 28 | ...4706 last 12 months | 18 | 27 | 21 | 27 | 27 | 52 | 59 | 37 | 35 | 31 | 32 | 19 | 385 |
| 29 | ...5793 last 12 months | 30 | 30 | 37 | 32 | 29 | 43 | 36 | 26 | 49 | 42 | 40 | 32 | 426 |
| 30 | ...8300 2024-2025 average | 99.5 | 82 | 138 | 220 | 304.5 | 487 | 632.5 | 462.5 | 299.5 | 185 | 474.5 | 169.5 | 3554.5 |
| 31 | ...4031 2024-2025 average | 60 | 43.5 | 73.5 | 128 | 177.5 | 284.5 | 379 | 277 | 178.5 | 104.5 | 284 | 99 | 2089 |
| 32 | ...4706 2024-2025 average | 18.5 | 14.5 | 26.5 | 32 | 50 | 58.5 | 74.5 | 59 | 44.5 | 38 | 39.5 | 22.5 | 478 |
| 33 | ...5793 2024-2025 average | 45.5 | 38.5 | 40 | 38.5 | 41 | 49.5 | 61.5 | 50 | 47 | 44.5 | 46 | 81 | 583 |
| 34 | ...8300 BASELINE USED | 115 | 159 | 166 | 260 | 310 | 575 | 575 | 374 | 313 | 342 | 232 | 104 | 3525 |
| 35 | ...4031 BASELINE USED | 58 | 85 | 88 | 147 | 192 | 325 | 324 | 229 | 191 | 200 | 135 | 57 | 2031 |
| 36 | ...4706 BASELINE USED | 18 | 27 | 21 | 27 | 27 | 52 | 59 | 37 | 35 | 31 | 32 | 19 | 385 |
| 37 | ...5793 BASELINE USED | 30 | 30 | 37 | 32 | 29 | 43 | 36 | 26 | 49 | 42 | 40 | 32 | 426 |
| 38 | All meters, baseline | 221 | 301 | 312 | 466 | 558 | 995 | 994 | 666 | 588 | 615 | 439 | 212 | 6367 |
| 39 | Turf need at healthy minimum (1,000s gal) | 46.2667 | 74.242 | 143.1041 | 244.9627 | 314.9008 | 337.1375 | 305.2171 | 246.756 | 206.9451 | 165.3409 | 83.5671 | 35.507 | 2203.9469 |
| 40 | 3. THE PLAN: levers by year (edit the yellow cells) |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 41 | Lever | 2027 | 2028 | 2029 | 2030 | Why / notes |  |  |  |  |  |  |  |  |
| 42 | Leak repair and wet check (cut in all water) | 0.05 | 0.05 | 0.05 | 0.05 | Year 1. Fix heads, valves, laterals; the hourly data shows small daytime flows and odd one-off runs |  |  |  |  |  |  |  |  |
| 43 | Smart controller with rain shutoff (cut in all water) | 0.1 | 0.1 | 0.1 | 0.1 | Year 1. One controller runs everything; Mesa pays 50% (up to $2,000). Today it waters full schedules after storms |  |  |  |  |  |  |  |  |
| 44 | Stop winter overseeding (1 = yes) | 1 | 1 | 1 | 1 | Year 1. Bermuda goes tan Dec to Feb but the green stays |  |  |  |  |  |  |  |  |
| 45 | Winter turf water Nov to Feb, if not overseeding (% of baseline) | 0.2 | 0.2 | 0.2 | 0.2 | Dormant Bermuda needs only occasional water |  |  |  |  |  |  |  |  |
| 46 | October turf water, if not overseeding (% of baseline) | 0.6 | 0.6 | 0.6 | 0.6 | No germination watering |  |  |  |  |  |  |  |  |
| 47 | Summer turf water May to Sep (% of baseline) | 0.85 | 0.75 | 0.7 | 0.7 | Step down a little each year; check against the healthy-minimum line below |  |  |  |  |  |  |  |  |
| 48 | Desert drip, all meters (% of baseline) | 0.75 | 0.5 | 0.35 | 0.25 | Established natives need little or no drip; step down and watch the plants |  |  |  |  |  |  |  |  |
| 49 | 4. RESULTS |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 50 |  | 2026 actual pace | 2027 | 2028 | 2029 | 2030 |  |  |  |  |  |  |  |  |
| 51 | Water used, do nothing (gallons) | 6367000 | 6367000 | 6367000 | 6367000 | 6367000 | 2026 pace: last 12 months of metered water (6.37M gal); ~$56K/yr at today's rates |  |  |  |  |  |  |  |
| 52 | Water used, with the plan (gallons) |  | 4010858.01 | 3445103.655 | 3131508.465 | 3008636.415 |  |  |  |  |  |  |  |  |
| 53 | Water cut |  | 0.3701 | 0.4589 | 0.5082 | 0.5275 |  |  |  |  |  |  |  |  |
| 54 | Water bill, do nothing ($) | 56000 | 63725.4005 | 69970.7177 | 76840.5666 | 84397.4004 |  |  |  |  |  |  |  |  |
| 55 | Water bill, with the plan ($) |  | 44559.5566 | 42645.7249 | 43014.4902 | 45640.7366 |  |  |  |  |  |  |  |  |
| 56 | Savings ($/yr) |  | 19165.844 | 27324.9928 | 33826.0764 | 38756.6638 |  |  |  |  |  |  |  |  |
| 57 | Plan vs $30K target (+ = over target) |  | 14559.5566 | 12645.7249 | 13014.4902 | 15640.7366 |  |  |  |  |  |  |  |  |
| 58 | Plan water cost per home per month ($) |  | 66.3089 | 63.4609 | 64.0097 | 67.9178 |  |  |  |  |  |  |  |  |
| 59 | Peak-month turf water vs healthy minimum (Jul) |  | 1.2576 | 1.0824 | 0.9906 | 0.9737 | Below 100% means summer turf water is under the healthy-minimum estimate: watch the lawn and ease off the summer cut |  |  |  |  |  |  |  |
| 60 | How to read this: each year's levers apply on top of a baseline of actual metered use. Year 1 (2027) is the low-hanging fruit: leaks, controller, no overseeding, and a modest summer and desert cut. Years 2 to 4 step summer turf water and desert drip down further. Cutting summer peaks saves the most per gallon because it also avoids the Tier 2 surcharge. |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Inputs

| Row | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | INPUTS |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 2 | Blue = sourced input. Yellow fill = assumption or placeholder to confirm. Black = formula. Green = link to another tab. |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 3 | CLIMATE |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 4 | Month | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Annual |  |
| 5 | Average | 1.2 | 1.23 | 0.97 | 0.26 | 0.17 | 0.08 | 0.98 | 1.55 | 1.2 | 0.59 | 0.73 | 1.23 | 10.19 | Rain rows: NOAA COOP East Mesa, 2003-2025 average; 2020 driest; 2021 wettest |
| 6 | Dry year (2020) | 0.19 | 1.26 | 2.29 | 0 | 0.02 | 0 | 0.12 | 0.24 | 0 | 0 | 0 | 0.45 | 4.57 |  |
| 7 | Wet year (2021) | 1.45 | 0 | 0.16 | 0.02 | 0 | 0.06 | 3.96 | 5.89 | 1.86 | 0.28 | 0.05 | 2.7 | 16.43 |  |
| 8 | ETo, reference evapotranspiration (in) | 2.49 | 3.3 | 4.96 | 7.09 | 8.95 | 9.48 | 9.49 | 8.43 | 6.97 | 5.2 | 3.06 | 2.22 | 71.64 | AZMET Queen Creek Penman-Monteith, 2021-2025 |
| 9 | Rain year being tested (set on Dashboard) | Average |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 10 | Rain used in the model (in) | 1.2 | 1.23 | 0.97 | 0.26 | 0.17 | 0.08 | 0.98 | 1.55 | 1.2 | 0.59 | 0.73 | 1.23 | 10.19 |  |
| 11 | WATER RATES: City of Mesa Commercial Landscape Water Service, effective 04/01/2026 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 12 | Usage charge ($ per 1,000 gal) | 5.95 | Mesa Utility Rate Book W-5 |  |  |  |  |  |  |  |  |  |  |  |  |
| 13 | Peak surcharge ($ per 1,000 gal above the Dec-Feb average) | 2.99 | Applies to summer use above the winter baseline |  |  |  |  |  |  |  |  |  |  |  |  |
| 14 | Drought commodity charge ($ per 1,000 gal) | 0.08 | While a Colorado or Salt River shortage is declared |  |  |  |  |  |  |  |  |  |  |  |  |
| 15 | Pumping-zone surcharge ($ per 1,000 gal) | 0 | CHECK THE BILLS: 0 base zones; Desert Sage 0.1106; County Line 0.2138; Apache Junction 0.3228; Range Rider 0.4273 |  |  |  |  |  |  |  |  |  |  |  |  |
| 16 | Annual rate escalation | 0.05 | Assumption; Mesa raised this rate 15% in the last cycle |  |  |  |  |  |  |  |  |  |  |  |  |
| 17 | Meter size | $/month | Monthly service charge per meter. Shutting a meter off removes this fixed cost too. |  |  |  |  |  |  |  |  |  |  |  |  |
| 18 | 3/4" | 35.08 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 19 | 1" | 39.3 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 20 | 1 1/2" | 55.01 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 21 | 2" | 72.15 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 22 | 3" | 142.9 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 23 | 4" | 226.34 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 24 | HOW ZONES GET WATER |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 25 | Share of direct rain plants can use (no basin) | 0.5 | Assumption |  |  |  |  |  |  |  |  |  |  |  |  |
| 26 | Share of direct rain captured in a rain garden / sunken basin | 0.9 | Assumption; mulched basins hold nearly all rain that falls on them |  |  |  |  |  |  |  |  |  |  |  |  |
| 27 | Gallons per sq ft per inch | 0.623 | Unit conversion |  |  |  |  |  |  |  |  |  |  |  |  |
| 28 | Root-zone water storage in a rain garden (inches of water) | 4 | Assumption; deep, mulched basins in sandy loam. The soil 'bank' that carries plants through May-June |  |  |  |  |  |  |  |  |  |  |  |  |
| 29 | Root-zone water storage without a basin (inches of water) | 1.5 | Assumption |  |  |  |  |  |  |  |  |  |  |  |  |
| 30 | Establishment period with drip irrigation (years) | 2 | Typical for desert-adapted plants before they go rain-fed |  |  |  |  |  |  |  |  |  |  |  |  |
| 31 | Establishment watering vs a normal drip schedule | 1 | 1.00 = water like a low-water landscape during establishment |  |  |  |  |  |  |  |  |  |  |  |  |
| 32 | Treat a meter as 'off' below this use (gal/yr) | 5000 | Small dry-year hand watering can come from a hose bib or water truck |  |  |  |  |  |  |  |  |  |  |  |  |
| 33 | PLANT TYPES |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 34 | Plant type | Plant factor | Drip / spray efficiency | Examples |  |  |  |  |  |  |  |  |  |  |  |
| 35 | Turf (Bermuda) | 0.6 | 0.7 | Park lawns, basin grass on spray heads |  |  |  |  | Typical ADWR / AMWUA planning values; tune with your landscape pro |  |  |  |  |  |  |
| 36 | Natural desert (rain only) | 0.1 | 0.9 | Established, undisturbed Sonoran desert; survives on rain once established |  |  |  |  |  |  |  |  |  |  |  |
| 37 | Moderate water | 0.5 | 0.85 | Mixed shrubs, non-native shade trees |  |  |  |  |  |  |  |  |  |  |  |
| 38 | Low water (desert-adapted) | 0.3 | 0.9 | Palo verde, mesquite, sages |  |  |  |  |  |  |  |  |  |  |  |
| 39 | Very low (native desert) | 0.15 | 0.9 | Desert natives kept on light drip |  |  |  |  |  |  |  |  |  |  |  |
| 40 | IRRIGATION NEED WITHOUT RAIN GARDENS (gal per sq ft per month) = MAX(0, ETo x PF - rain x 50%) x 0.623 / efficiency |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 41 | Plant type | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | Annual |  |
| 42 | Turf (Bermuda) | 0.7957 | 1.2148 | 2.217 | 3.6704 | 4.7036 | 5.0267 | 4.6316 | 3.8119 | 3.188 | 2.5143 | 1.3092 | 0.6381 | 33.7212 |  |
| 43 | Natural desert (rain only) | 0 | 0 | 0.0076 | 0.4008 | 0.5607 | 0.6285 | 0.3177 | 0.0471 | 0.0671 | 0.1557 | 0 | 0 | 2.1853 |  |
| 44 | Moderate water | 0.4727 | 0.7586 | 1.4622 | 2.503 | 3.2176 | 3.4448 | 3.1187 | 2.5213 | 2.1145 | 1.6894 | 0.8539 | 0.3628 | 22.5196 |  |
| 45 | Low water (desert-adapted) | 0.1018 | 0.2596 | 0.6943 | 1.3824 | 1.7998 | 1.941 | 1.6316 | 1.2142 | 1.0321 | 0.8757 | 0.3828 | 0.0353 | 11.3504 |  |
| 46 | Very low (native desert) | 0 | 0 | 0.1793 | 0.6462 | 0.8705 | 0.9567 | 0.6462 | 0.3388 | 0.3084 | 0.3357 | 0.0651 | 0 | 4.3468 |  |
| 47 | RUNOFF COEFFICIENTS |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 48 | Surface | Coefficient |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 49 | Metal roof | 0.95 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 50 | Tile or shingle roof | 0.85 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 51 | Asphalt street | 0.8 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 52 | Concrete | 0.85 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 53 | Pavers | 0.6 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 54 | Decomposed granite | 0.3 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 55 | Compacted soil | 0.4 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 56 | Turf | 0.1 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 57 | COSTS AND INCENTIVES |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 58 | Conversion cost ($ per sq ft converted) | 6 | PLACEHOLDER: turf removal, grading basins, plants, temporary drip, mulch. Get quotes |  |  |  |  |  |  |  |  |  |  |  |  |
| 59 | Mesa Grass-to-Xeriscape incentive ($ per sq ft of turf removed) | 2 | City of Mesa HOA program; pre-approval required; funding limited |  |  |  |  |  |  |  |  |  |  |  |  |
| 60 | Minimum turf removed per application (sq ft) | 2500 | Program rule |  |  |  |  |  |  |  |  |  |  |  |  |
| 61 | Incentive cap per property per 12 months ($) | 50000 | Program rule |  |  |  |  |  |  |  |  |  |  |  |  |
| 62 | Curb cut / inlet into a rain garden ($ each) | 2500 | PLACEHOLDER. City permit if in public right-of-way |  |  |  |  |  |  |  |  |  |  |  |  |
| 63 | Maintenance savings ($ per sq ft converted per year) | 0 | Optional: mowing, overseeding, spray repairs. Pull from the landscape contract |  |  |  |  |  |  |  |  |  |  |  |  |
| 64 | HOA CONTEXT |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 65 | Number of homes | 56 | Maricopa County Assessor: 56 residential lots in the Granite Ridge subdivision |  |  |  |  |  |  |  |  |  |  |  |  |
| 66 | Current monthly dues ($) | 230 | 2026 |  |  |  |  |  |  |  |  |  |  |  |  |
| 67 | Proposed monthly dues ($) | 271 | Trestle proposal |  |  |  |  |  |  |  |  |  |  |  |  |
| 68 | Calendar year of plan Year 1 | 2027 |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Sources

| Row | A | B |
|---|---|---|
| 1 | Item | Source |
| 2 | Rainfall | NOAA ACIS, COOP station EAST MESA USC00022782: 2003-2025 monthly averages; 2020 (driest, 4.57 in) and 2021 (wettest, 16.43 in) actual months. |
| 3 | ETo | University of Arizona AZMET, Queen Creek (az22), daily Penman-Monteith ETo, 2021-2025 monthly means. |
| 4 | Water rates and meter charges | City of Mesa Utility Rate Book, Commercial Landscape Water Service, effective 04/01/2026: $5.95/kgal, $2.99/kgal peak surcharge, $0.08/kgal drought charge, pumping-zone surcharges, monthly service charges by meter size. |
| 5 | Incentives | City of Mesa Water Management for HOAs: Grass-to-Xeriscape $2/sq ft, 2,500 sq ft minimum, $50,000 cap per 12 months, pre-approval and 50% low-water plant canopy required. |
| 6 | Method | Soil-bank water balance per zone per month (two-year run, year 2 reported). Need = ETo x plant factor x area x 0.623. Supply = rain x capture share x area x 0.623 + routed runoff (area x rain x coefficient x 0.623). Irrigation = shortfall after the soil bank, divided by drip efficiency. Rain-garden design approach follows Brad Lancaster's Rainwater Harvesting for Drylands and Beyond. |

## History

| Row | A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|---|
| 1 | HOA WATER COST HISTORY: turning dollars into gallons |  |  |  |  |  |  |  |
| 2 | Annual common-area water cost from the HOA (all 4 meters combined). Gallons are estimated by backing out meter service charges and dividing by the all-in rate. Used to calibrate the model when per-meter use isn't available. |  |  |  |  |  |  |  |
| 3 | Year | Water cost ($) | Rain that year (in) | Change vs prior year | Rate level vs 2025 | Estimated gallons | Chart label | Metered gallons (Mesa bills) |
| 4 | 2020 | 36340 | 4.57 |  | 0.7835 | 5934157.5725 | 2020 / 4.6 in rain | 7431000 |
| 5 | 2021 | 30152 | 16.43 | -0.1703 | 0.8227 | 4628795.1629 | 2021 / 16.4 in rain | 6388000 |
| 6 | 2022 | 32959 | 9.83 | 0.0931 | 0.8638 | 4830596.17 | 2022 / 9.8 in rain | 6106000 |
| 7 | 2023 | 26016 | 10.42 | -0.2107 | 0.907 | 3559927.3909 | 2023 / 10.4 in rain | 4247000 |
| 8 | 2024 | 44708 | 7.81 | 0.7185 | 0.9524 | 6009731.8358 | 2024 / 7.8 in rain | 7053000 |
| 9 | 2025 | 45239 | 12.53 | 0.0119 | 1 | 5781075.0496 | 2025 / 12.5 in rain | 6356000 |
| 10 | ASSUMPTIONS FOR CONVERTING DOLLARS TO GALLONS |  |  |  |  |  |  |  |
| 11 | Rate increase from 2025 to the 2026 rate book | 0.15 | Assumption: Mesa proposed a 15% commercial-landscape increase for this cycle (Mesa Tribune, Sept 2025). Confirm with a 2025 bill |  |  |  |  |  |
| 12 | Assumed yearly rate change before 2025 | 0.05 | Placeholder, only affects the 2020-2024 gallon estimates |  |  |  |  |  |
| 13 | All-in 2025 rate ($ per 1,000 gal, incl. typical peak surcharge) | 7.454 |  |  |  |  |  |  |
| 14 | 2025 meter service charges, all 4 meters ($/yr) | 2147.0609 |  |  |  |  |  |  |
| 15 | CALIBRATION |  |  |  |  |  |  |  |
| 16 | Year used to calibrate | 2025 | Most recent full year. 2024 and 2025 are both much higher than 2020-2023; see note below |  |  |  |  |  |
| 17 | Estimated common-area use that year (gal) | 5781075.0496 |  |  |  |  |  |  |
| 18 | Modeled need of the zones mapped so far (gal/yr) | 7359315.2049 |  |  |  |  |  |  |
| 19 | Calibration factor (bills / mapped zones) | 0.7855 |  |  |  |  |  |  |
| 20 | How to read the factor: above 1 means the HOA buys more water than the mapped plants need. That's either (a) common area not yet listed on the Zones tab, or (b) overwatering, leaks, or overseeding. Once the Zones tab holds the real areas, whatever factor remains is mostly waste, and it's the cheapest water to cut: controller settings, leak repair, and ending winter overseeding cost far less than conversion. |  |  |  |  |  |  |  |

## Meters

Top table only. Note: this tab lists meter ...8300 as 2 inch ($72.15 a month); the Quick Wins tab and the City bills show 1 1/2 inch ($55.01).

| Row | A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | THE FOUR HOA WATER METERS |  |  |  |  |  |  |  |  |  |  |
| 2 | Four meters per Waterfluence. Column E is actual use for the 12 billing periods ending Aug 12, 2026, linked from the Waterfluence tab. Meter locations are confirmed from the Waterfluence controller map; the areas each one serves are inferred from location and flow patterns (valve lines can run farther). |  |  |  |  |  |  |  |  |  |  |
| 3 | Meter | What it serves | Meter size | Service charge $/mo | Actual use, last 12 mo (gal) | Modeled use today (gal) | Calibration factor | Share of use hit by peak surcharge | Zones on meter | First plan year meter is off | Calendar year |
| 4 | ...8300 | CONFIRMED location: 99th Way, east side of the green. Serves (inferred): east half of the turf and the green's desert edges | 2" | 72.15 | 3525000 | 2176819.841 | 1.6193 | 0.7539 | 2 | Not yet |  |
| 5 | ...4031 | CONFIRMED location: 98th Pl, west side of the green. Serves (inferred): west half of the turf and the interior strip | 1 1/2" | 55.01 | 2031000 | 1841577.4564 | 1.1029 | 0.7594 | 2 | Not yet |  |
| 6 | ...4706 | CONFIRMED location: NW entry at McKellips / 98th Pl. Serves (inferred): west and south desert, Tract B | 1" | 39.3 | 385000 | 1667396.9816 | 0.2309 | 1 | 1 | 3 | 2029 |
| 7 | ...5793 | CONFIRMED location: 99th Way near June St. Serves (inferred): McKellips / Crismon perimeter, Tract C | 1" | 39.3 | 426000 | 1673520.9259 | 0.2546 | 0.8714 | 1 | 3 | 2029 |

## QW Calc

Formulas behind Quick Wins. For each year 2027 to 2030, for each meter, "Do nothing" and "Plan" blocks of four rows: water by month, Tier 1 surcharge gallons, Tier 2 surcharge gallons, and bill.

* Plan water, by month = baseline x (1 - leak repair) x (1 - smart controller) x (turf share x turf factor + (1 - turf share) x desert drip factor). Turf factor: Jan, Feb, Nov, Dec = winter % if not overseeding (else 1); Mar, Apr = 1; May to Sep = summer %; Oct = October % if not overseeding (else 1).
* Winter average = round(average of that year's Dec, Jan, Feb). Tier 1 gallons = min(max(0, water - winter average), 0.5 x winter average). Tier 2 gallons = max(0, water - 1.5 x winter average).
* Bill = (service x (1 + 2027 service increase) x (1 + escalation)^(year - 2027) + max(0, water - 3) x (usage price x escalation factor + drought + superfund) + Tier 1 x Tier 1 price x escalation factor + Tier 2 x Tier 2 price x escalation factor) x (1 + sales tax) + environmental fee.

## Rain-garden and conversion tabs (summary only, out of scope)

* Dashboard: headline results of converting zones to rain-fed desert landscape with rain gardens and curb cuts: about $678,716 total project spending, $100,000 in Mesa incentives, final-year water savings about $81,308 a year, cumulative net cash after 10 years about -$95,550.
* Zones, Catchments, ZoneBalance, PhasePlan: zone list with areas and plant types, runoff catchments, a monthly soil-moisture water balance per zone, and a phased conversion schedule with costs.


