# Water need and cost, the 12 City bills from December 2026 to November 2027 (2026-10-18, revised)

Question from Jennifer: model how much water the landscape actually needs (not what it used in the past), by month, for the next 12 City bills, and what that water will cost. December to February sets each meter's winter base for the rest of the year.

The plan this models (Jennifer, 2026-10-18):

* The park lawn is overseeded with winter rye this fall and next fall. The entry turf is artificial turf from late August 2026, so it gets no water and no overseed.
* The City adopts the 2027 rates as recommended (Council vote December 8, 2026), starting with the bill that ends in February 2027.
* Normal weather: average rain and evapotranspiration.

This is a planning estimate. It is not shown on the public site, and no number here has been reconciled against bills.

## The answer

The next 12 bills should total about **3.2 to 4.4 million gallons, costing about $36,100 to $46,100.** The same water as the last 12 months, priced at these rates, would be about 6.4 million gallons and $63,500.

The range comes from two sets of assumptions, explained below: Case A (lean) and Case B (cautious).

| Bill ending | Covers about | Gallons, A | Gallons, B | Cost, A | Cost, B |
|---|---|---|---|---|---|
| Dec 2026 | Nov 13 to Dec 12 | 69,000 | 140,000 | $645 | $1,077 |
| Jan 2027 | Dec 13 to Jan 13 | 51,000 | 98,000 | $528 | $835 |
| Feb 2027 | Jan 14 to Feb 12 | 72,000 | 131,000 | $739 | $1,185 |
| Mar 2027 | Feb 13 to Mar 15 | 125,000 | 254,000 | $1,365 | $2,567 |
| Apr 2027 | Mar 16 to Apr 14 | 288,000 | 389,000 | $3,197 | $4,134 |
| May 2027 | Apr 15 to May 13 | 484,000 | 466,000 | $5,472 | $5,027 |
| Jun 2027 | May 14 to Jun 13 | 582,000 | 601,000 | $6,609 | $6,594 |
| Jul 2027 | Jun 14 to Jul 15 | 518,000 | 597,000 | $5,867 | $6,547 |
| Aug 2027 | Jul 16 to Aug 12 | 334,000 | 484,000 | $3,731 | $5,236 |
| Sep 2027 | Aug 13 to Sep 14 | 229,000 | 422,000 | $2,513 | $4,517 |
| Oct 2027 | Sep 15 to Oct 13 | 220,000 | 372,000 | $2,408 | $3,936 |
| Nov 2027 | Oct 14 to Nov 12 | 271,000 | 420,000 | $3,000 | $4,493 |
| **12 bills** | | **3,243,000** | **4,374,000** | **$36,076** | **$46,149** |

The "covers about" dates are typical read dates. The City's exact read dates vary by a day or two.

The overseed charge from the landscaper is not on the City bill and is not included.

### By meter, thousand gallons

**Case A, lean:**

| Bill ending | Dec 26 | Jan 27 | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov 27 | 12 bills | Cost |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Meter 1 (park, east) | 43 | 32 | 45 | 77 | 143 | 215 | 255 | 237 | 175 | 132 | 117 | 154 | 1,625 | $17,337 |
| Meter 2 (park, west) | 26 | 19 | 27 | 47 | 97 | 156 | 186 | 169 | 116 | 84 | 77 | 98 | 1,102 | $12,099 |
| Meter 3 (entry drip) | 0 | 0 | 0 | 0 | 15 | 35 | 44 | 35 | 13 | 4 | 8 | 6 | 160 | $2,188 |
| Meter 4 (interior strip) | 0 | 0 | 0 | 1 | 33 | 78 | 97 | 77 | 30 | 9 | 18 | 13 | 356 | $4,451 |

**Case B, cautious:**

| Bill ending | Dec 26 | Jan 27 | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov 27 | 12 bills | Cost |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Meter 1 (park, east) | 81 | 61 | 81 | 143 | 212 | 261 | 329 | 328 | 271 | 229 | 194 | 232 | 2,422 | $24,812 |
| Meter 2 (park, west) | 52 | 37 | 50 | 89 | 126 | 157 | 192 | 191 | 161 | 137 | 114 | 140 | 1,446 | $14,941 |
| Meter 3 (entry drip) | 2 | 0 | 0 | 7 | 19 | 19 | 37 | 42 | 26 | 24 | 22 | 15 | 213 | $2,745 |
| Meter 4 (interior strip) | 5 | 0 | 0 | 15 | 32 | 29 | 43 | 36 | 26 | 32 | 42 | 33 | 293 | $3,651 |

In a few places Case A is higher than Case B (May, and meter 4 overall). That is the desert drip. Case B never lets desert drip go above what the meter uses today, because the formula on map areas came out higher than today's use and the plants are doing fine. Case A has no cap. The desert part is the least certain piece of the model.

## How the need was worked out

The model starts from what the plants need, not from past bills. It goes in five steps.

### Step 1: weather demand for each bill

ETo (reference evapotranspiration) is how many inches of water a reference lawn loses to heat, sun, and wind. The model uses AZMET Queen Creek's monthly averages for 2021 to 2025, the nearest AZMET station to east Mesa. Rain is NOAA East Mesa's monthly average for 2003 to 2025.

A City bill runs from about the middle of one month to the middle of the next. So each bill uses the average of the two calendar months it spans. For example, the July 2027 bill (about June 14 to July 15) averages June and July.

### Step 2: how much of that demand each kind of plant needs

The plant factor scales weather demand to the plant: 1.0 is a reference lawn, and lower numbers need less water.

| Plant | Months | Case A | Case B | Why |
|---|---|---|---|---|
| Bermuda lawn (park) | April to October | 0.5 | 0.6 | 0.5 keeps Bermuda green at a healthy minimum (Jennifer's workbook); 0.6 is the WUCOLS value for warm-season turf |
| Winter rye (park) | November to March | 0.6 | 0.8 | 0.8 is the WUCOLS value for cool-season turf; 0.6 is a leaner setting |
| Rye seeding | late October to early November | 3 weeks at 1.0 | 4 weeks at 1.0 | Seedbed kept moist; extra water over the Bermuda baseline only for those weeks |
| Desert plants (all meters) | all year | 0.10 | 0.15 | Workbook plant types: "natural desert" and "very low water native". The west wash zone, off since at least March 2026 and thriving, supports the low end. |

### Step 3: subtract the rain plants can use

Half of each month's average rain is counted as usable (Jennifer's workbook). Need for the month is the weather demand times the plant factor, minus usable rain, never below zero.

In winter, usable rain often covers the desert plants entirely. That is why meters 3 and 4 show zero or near zero from December to March.

### Step 4: turn inches into gallons

One inch of water over one square foot is 0.623 gallons. Sprinklers and drip lose some water to uneven coverage, so the need is divided by the system's efficiency.

| | Area | Efficiency |
|---|---|---|
| Park lawn | 76,600 sq ft (A, Jennifer's map) or 86,354 (B, Waterfluence's measured turf); 62% on meter 1 and 38% on meter 2 | 0.75 (A, after repairs and a wet check) or 0.70 (B, Waterfluence's current setting) |
| Desert drip | meter 1 and meter 2: 127,652 sq ft each; meter 3: 73,721; meter 4: 162,429 | 0.9 |

The park's 62/38 split comes from the controller station flows and the hourly meter data (docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md). The desert areas are gross map areas (data/areas.md): the park's non-turf area plus half of the west and south desert, split between the park meters; the perimeter split evenly between meters 3 and 4; and the interior strip on meter 4. The splits are guesses.

### Step 5: price each bill with the City's rules

Each bill has a service charge, a $7.32 fee, a drought charge, a Superfund charge, and 8.29% tax. Usage is charged in blocks set by the meter's winter average.

| | Bills ending Dec 2026 and Jan 2027 (today's rates) | From the bill ending Feb 2027 (2027 rates) |
|---|---|---|
| Service charge, meters 1 and 2 | $55.01 | $56.94 |
| Service charge, meters 3 and 4 | $39.30 | $40.68 |
| First 3,000 gallons | included | included |
| Up to the winter average | $5.95 per thousand | $6.84 |
| Above the winter average | $8.94 | $10.28 up to 1.5 times the average, $10.58 above that |
| Drought charge | $0.08 per thousand above 3,000 | $0.13 |

The winter average is the average of the bills ending December, January, and February.

* The December 2026 to February 2027 bills are priced with last winter's average.
* The March to November 2027 bills are priced with the average this model's own December to February water sets.

The bill calculator follows `src/engine/billing.ts` and reproduces meter 1's real bill of 2026-07-28 ($5,260.02).

### Worked example: meter 1, bill ending July 2027 (Case A)

**Water:**

| | Lawn | Desert drip |
|---|---|---|
| June: ETo x plant factor - half of rain | 9.48 x 0.5 - 0.04 = 4.70 in | 9.48 x 0.10 - 0.04 = 0.91 in |
| July | 9.49 x 0.5 - 0.49 = 4.26 in | 9.49 x 0.10 - 0.49 = 0.46 in |
| Average for the bill | 4.48 in | 0.68 in |
| Area | 76,600 x 62% = 47,492 sq ft | 127,652 sq ft |
| Gallons | 4.48 x 0.623 x 47,492 / 0.75 = 176,600 | 0.68 x 0.623 x 127,652 / 0.9 = 60,400 |

Total: about **237,000 gallons.**

**Cost.** Meter 1's modeled winter bills are 43,000, 32,000, and 45,000 gallons, an average of 40,000. So:

| Line | Calculation | Amount |
|---|---|---|
| First 3,000 gallons | included | $0.00 |
| Next 37,000 (up to the winter average) | 37 x $6.84 | $253.08 |
| Next 20,000 (up to 1.5 x 40,000 = 60,000) | 20 x $10.28 | $205.60 |
| Remaining 177,000 | 177 x $10.58 | $1,872.66 |
| Drought charge | 234 x $0.13 | $30.42 |
| Superfund | 237 x $0.0065 | $1.54 |
| Service charge | | $56.94 |
| Tax | 8.29% of the lines above | $200.64 |
| Fee | | $7.32 |
| **Bill** | | **$2,628.20** |

### How much of the cost is surcharge

Every bill in the tables is priced through the City's blocks, so the surcharge above the winter base is already included. Over the 12 bills:

| Thousand gallons billed at | Case A | Case B |
|---|---|---|
| Included (first 3,000 a bill) | 121 | 131 |
| Base price, up to the winter average ($5.95, then $6.84) | 696 | 1,372 |
| Tier 1 surcharge, up to 1.5 times the average ($10.28; $8.94 on the December and January bills) | 312 | 567 |
| Tier 2 surcharge, above 1.5 times the average ($10.58) | 2,114 | 2,304 |
| **Surcharge paid above the base price** | **about $9,000** | **about $10,600** |

About two-thirds of the water lands in Tier 2, because the winter average is low:

* **Park meters (rye watered to need):** meter 1 averages 40,000 (A) to 74,000 (B) gallons on the December to February bills, and meter 2 averages 24,000 to 46,000.
* **Meters 3 and 4 (desert drip):** both average about zero in winter. Desert drip needs almost no winter water, so all of their spring and summer water pays $10.58.

## The two cases

| | Case A: lean | Case B: cautious |
|---|---|---|
| Lawn plant factors | 0.5 summer, 0.6 rye | 0.6 summer, 0.8 rye |
| Seeding | 3 weeks | 4 weeks |
| Lawn area | 76,600 sq ft | 86,354 sq ft |
| Sprinkler efficiency | 0.75 (after repairs) | 0.70 (as set today) |
| Desert plant factor | 0.10 | 0.15, never above today's use |
| Gallons, 12 bills | 3.24 million | 4.37 million |
| Cost, 12 bills | $36,100 | $46,100 |

Case A assumes the leaks are fixed and sprinklers are tuned. Case B is closer to the system as it runs today, but watered to plant need.

## What is not in these numbers

* **Leaks.** Need excludes leaks. If meter 4's valve keeps sticking at its fall 2026 rate, it could add up to about 500,000 gallons a year at the top price. Meter 1's trickle is small (about 100 gallons a day when present).
* **Watering through rain.** Need subtracts average rain. Since July 2026 the park ran full cycles in the days after 4 of 8 storms, and meter 4 watered during the October 11 rain. Any watering after rain is on top of need.
* **A dry year.** With 2020's rain (the driest recent year), Case A rises by about 1.1 million gallons and about $9,800.
* **The overseed charge** from the landscaper.

## Why actual use is above need today

Today's pace is 6.4 million gallons over 12 bills (the last 12 actual bills, less the entry turf). Need is 3.2 to 4.4 million.

* **Most of the difference is the watering schedule:**
  * The park waters every night at about 10 PM on top of its early-morning program. The evening program is about a third of park water (docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md).
  * Last winter the park used about twice Case A's rye need.
* **Known leaks are a small share,** unless meter 4's valve keeps sticking.
* **Desert drip is close to need in total.** Meter 4 used 409,000 gallons against a need of about 290,000 to 360,000. The savings are in the timing: little or no drip from December to March.

## Data gaps that limit accuracy

| Gap | Effect |
|---|---|
| Park controller run times (settings pages 1, 2, and 4 to 9) | Can't confirm what the 10 PM program waters |
| Irrigated desert area per meter | Desert drip need could be off by half or more |
| Catch-can audit of the park sprinklers | Efficiency (0.70 to 0.75) is a guess |
| Adopted 2027 rate ordinance (after December 8, 2026) | Prices from February 2027 are the recommendation |
| City's exact read dates | Bills may shift a few thousand gallons between months |

## Assumptions

| Assumption | Value | Source | Confidence |
|---|---|---|---|
| ETo, monthly | 2.22 to 9.49 in | AZMET Queen Creek, 2021 to 2025 means (data/weather/monthly-normals.md) | medium |
| Rain, monthly | average 2003 to 2025; dry year 2020 | NOAA ACIS East Mesa (same file) | medium |
| Share of rain plants use | 50% | Jennifer's Zone Plan Model, Inputs | low |
| Park turf area | 76,600 (A) or 86,354 (B) sq ft | Jennifer's map; Waterfluence measured turf | medium |
| Turf split | 62% meter 1, 38% meter 2 | Station flows and hourly data | medium |
| Bermuda plant factor | 0.5 (A), 0.6 (B), April to October | Workbook healthy minimum; WUCOLS warm-season | low (A), medium (B) |
| Rye plant factor | 0.6 (A), 0.8 (B), November to March | Set for this model (A); WUCOLS cool-season (B) | low (A), medium (B) |
| Seeding | 3 (A) or 4 (B) weeks at plant factor 1.0, late October to early November | Jennifer, 2026-10-18; plant factor set for this model | low |
| Turf efficiency | 0.75 (A), 0.70 (B) | Workbook after wet check; Waterfluence IE | low |
| Desert plant factor | 0.10 (A), 0.15 (B), efficiency 0.9 | Workbook plant types (ADWR/AMWUA planning values) | low |
| Desert area | meters 1 and 2: 127,652 sq ft each; meter 3: 73,721; meter 4: 162,429 | Gross map areas (data/areas.md), split by guesswork | low |
| Entry turf | none; artificial turf from late August 2026 | Jennifer | high |
| Rates, bills ending December 2026 and January 2027 | data/rates/2026-05-13.md | Derived from bills | medium |
| Rates from the bill ending February 2027 | data/rates/2027-02-01.md, assumed adopted | City AF&E recommendation | medium |
| Rate change timing | by read period end date | Matches how the 2026 changes were billed | medium |
