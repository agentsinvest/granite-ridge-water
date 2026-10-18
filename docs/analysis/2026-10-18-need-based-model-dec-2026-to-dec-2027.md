# Need-based water model, December 2026 to December 2027 (2026-10-18)

Question from Jennifer: do we have enough data to model water by month for December 2026 to December 2027 from what the landscape actually needs (not past use), priced at 2026 and 2027 City rates, with December to February setting the winter base? She thinks leaks, watering through rain, and overwatering are the problem, and notes a desert zone that was turned off is thriving.

Short answer: **there is enough data for a planning model with honest ranges. There is not enough for a firm zone-by-zone budget.** On plant need, the site should use about **3.0 to 3.7 million gallons in 2027, against 6.5 million today: 43% to 53% less water.** At the City's recommended 2027 rates that costs about **$37,000 to $44,000**, against about **$65,000 if nothing changes** (same water as the last 12 months at 2027 prices).

Three findings matter more than the rest:

1. **Most of the extra water is the schedule, not leaks.** Known leaks today add up to under 100,000 gallons a year. The gap between use and need is about 2.8 to 3.4 million.
2. **Cutting winter water to need raises the price of every summer gallon.** With almost no water in December to February, each meter's lower-price allowance drops to about zero. Then nearly every summer gallon pays the top 2027 rate ($10.58 per thousand, against $6.84). This costs about $2,400 to $4,100 a year in higher prices. The water cut still saves far more than that.
3. **The winter base starts in mid-November, not December.** The "December" read period runs from about November 13 to December 12. Whatever the board decides about overseeding and winter watering needs to be in place by about November 13, 2026.

This is a planning estimate. It is not shown on the public site, and no number here has been reconciled against bills. The rates for February 2027 on are recommended, not adopted (the Council votes on December 8, 2026).

## Is there enough data?

| Input | Have it? | Confidence |
|---|---|---|
| City rates, through January 2027 | Derived from 48 bills; reproduce real bills within $0.18 of tax | medium |
| City rates, February 2027 on | AF&E recommended column; reproduces the City's own Commercial Landscape example | medium (not adopted) |
| Winter base rule | Derived from bills; reproduces every excess-usage charge to the cent | medium |
| Monthly weather (ETo, rain) | AZMET Queen Creek 2021 to 2025 means; NOAA East Mesa 2003 to 2025 rain | medium |
| Turf area | Waterfluence measured 86,354 sq ft (Jennifer's map says about 76,600) | medium |
| Park turf split by meter | 62% meter 1, 38% meter 2, from station flows and hourly data | medium |
| Desert irrigated area by meter | **No.** Gross map areas only, split by guesswork (see assumptions) | low |
| Zone schedules and run times | **No** for the park and meter 4; March printout only for the entrance | n/a |
| Plant factors | WUCOLS and ADWR/AMWUA planning values, plus Jennifer's workbook | low to medium |

The two gaps that most limit accuracy: the **park controller run times** (pages 1, 2, and 4 to 9 of the settings report) and the **irrigated desert area per meter**. Turf drives about 80% of the modeled water, and its inputs are the better ones.

## How need was calculated

For each meter and each City read period:

irrigation need (gallons) = max(0, ETo x plant factor - rain x 50%) x area x 0.623 / efficiency

Read periods end about the 12th to 15th of the month, so each period uses the average of the two calendar months it spans. Leaks are not included in need; they are listed separately below.

Two cases bracket the answer:

| | Case A: lean | Case B: cautious |
|---|---|---|
| Bermuda, March to October | plant factor 0.5 (healthy minimum, Jennifer's workbook) | 0.6 (WUCOLS warm-season turf) |
| Bermuda, November | 0.3 (going dormant) | 0.3 |
| Bermuda, December to February | 0.1 (dormant, no overseed) | 0.1 |
| Sprinkler efficiency | 0.75 (after leak repair and a wet check) | 0.70 (Waterfluence's current setting) |
| Desert drip | plant factor 0.10 "natural desert" on the gross area, efficiency 0.9 | plant factor 0.15 "very low native", capped at what each meter uses today |

With overseeded rye, the turf plant factor is 0.8 from November to March (WUCOLS cool-season; Jennifer's rain-check factors). That is shown as its own scenario.

## Results by month (normal weather, no overseed)

Thousand gallons. Bills at derived 2026 rates for periods ending December 2026 and January 2027, and recommended 2027 rates from the period ending February 2027. December 2026 to February 2027 are priced with the current winter base (set last winter); March 2027 on use the base the modeled winter sets.

**Today's water, repriced (for comparison only):** the last 12 read periods, repeated.

| Period ending | Dec 26 | Jan 27 | Feb 27 | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec 27 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Meter 1 | 104 | 115 | 159 | 166 | 260 | 310 | 575 | 575 | 374 | 399 | 342 | 232 | 104 |
| Meter 2 | 57 | 58 | 85 | 88 | 147 | 192 | 325 | 324 | 229 | 221 | 200 | 135 | 57 |
| Meter 3 | 19 | 18 | 27 | 21 | 27 | 27 | 52 | 59 | 37 | 42 | 31 | 32 | 19 |
| Meter 4 | 32 | 30 | 30 | 37 | 32 | 29 | 43 | 36 | 26 | 32 | 42 | 40 | 32 |
| **All meters** | 212 | 221 | 301 | 312 | 466 | 558 | 995 | 994 | 666 | 694 | 615 | 439 | 212 |
| **Bills, $** | 1,544 | 1,600 | 2,636 | 2,757 | 4,532 | 5,608 | 10,666 | 10,657 | 6,872 | 7,177 | 6,257 | 4,215 | 1,755 |

**Case A, lean need:**

| Period ending | Dec 26 | Jan 27 | Feb 27 | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec 27 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Meter 1 | 12 | 0 | 0 | 34 | 135 | 235 | 278 | 260 | 194 | 148 | 130 | 73 | 12 |
| Meter 2 | 8 | 0 | 0 | 21 | 93 | 168 | 200 | 182 | 128 | 93 | 85 | 49 | 8 |
| Meter 3 | 0 | 0 | 0 | 0 | 15 | 35 | 44 | 35 | 13 | 4 | 8 | 6 | 0 |
| Meter 4 | 0 | 0 | 0 | 1 | 33 | 78 | 97 | 77 | 30 | 9 | 18 | 13 | 0 |
| **All meters** | 20 | 0 | 0 | 56 | 276 | 516 | 619 | 554 | 365 | 254 | 241 | 141 | 20 |
| **Bills, $** | 325 | 234 | 241 | 804 | 3,298 | 6,084 | 7,279 | 6,524 | 4,331 | 3,043 | 2,892 | 1,732 | 398 |

**Case B, cautious need:**

| Period ending | Dec 26 | Jan 27 | Feb 27 | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec 27 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Meter 1 | 17 | 0 | 0 | 47 | 165 | 261 | 329 | 328 | 271 | 229 | 194 | 106 | 17 |
| Meter 2 | 12 | 0 | 0 | 31 | 97 | 156 | 192 | 190 | 162 | 137 | 114 | 63 | 12 |
| Meter 3 | 2 | 0 | 0 | 7 | 27 | 27 | 52 | 59 | 36 | 24 | 24 | 15 | 2 |
| Meter 4 | 5 | 0 | 0 | 15 | 32 | 29 | 43 | 36 | 26 | 32 | 42 | 33 | 5 |
| **All meters** | 36 | 0 | 0 | 100 | 321 | 473 | 616 | 613 | 495 | 422 | 374 | 217 | 36 |
| **Bills, $** | 397 | 234 | 241 | 1,243 | 3,808 | 5,572 | 7,231 | 7,197 | 5,827 | 4,980 | 4,423 | 2,601 | 513 |

January and February are zero water in both cases: dormant Bermuda and established desert need nothing beyond average winter rain. The bills those months are service charges and fees only. In a dry winter some deep watering of trees would still be needed.

## Calendar 2027 totals (read periods ending January to December 2027)

| Scenario | Million gallons | Cost at 2027 rates | Per home per month (56 homes) |
|---|---|---|---|
| Today's water, repriced | 6.47 | $64,700 | $96 |
| A lean, no overseed | 3.04 | $36,900 | $55 |
| A lean, overseed | 3.62 | $38,200 | $57 |
| A lean, no overseed, winter water kept at last year's level | 3.56 | $33,400 | $50 |
| A lean, no overseed, dry year (2020 rain) | 4.10 | $47,200 | $70 |
| B cautious, no overseed | 3.67 | $43,900 | $65 |
| B cautious, overseed | 4.29 | $45,400 | $68 |
| B cautious, no overseed, winter water kept at last year's level | 4.19 | $39,700 | $59 |

For scale: rates alone add about $14,000 a year. The last 12 actual bills were $50,269 for 6.5 million gallons; the same water at 2027 prices is about $64,700.

## The winter base trade-off

The City prices each meter's water in three steps from February 2027: up to the winter average at $6.84, up to 1.5 times the winter average at $10.28, and above that at $10.58 (plus drought charge and tax). The winter average comes from the read periods ending in December, January, and February.

Watering only to need in winter leaves the park meters with a winter average of about 3,000 to 4,000 gallons, against about 126,000 (meter 1) and 67,000 (meter 2) last winter. Summer water then pays almost entirely at $10.58.

What the model shows:

* Keeping each park meter's winter water near last winter's level costs about 560,000 more gallons and lowers the year's bills by about $2,400 (Case A). Each extra thousand winter gallons "saves" about $4.20.
* On meters 3 and 4 it makes no real difference.
* Overseeding works the same way. In Case A it adds about 580,000 gallons but only about $1,400 in water cost, because it lifts the winter base. That excludes the overseed itself ($2,520 to $4,137 a year on the P&Ls).

Blunt version: **the City's rate design pays the HOA a little to waste water in winter.** The dollars are modest (about $2,400 to $4,100 a year), and the water does nothing for the landscape. If the goal is consumption, water winter to need and accept the higher summer price. That is a board decision. The model should not make it quietly.

## Where the extra water is going

Gap between today's water and Case A: about 3.4 million gallons a year.

| Source | Gallons a year | How sure | Evidence |
|---|---|---|---|
| Cool-season watering (November to March periods), including overseed | about 1.3 million | medium | 1.49 million used today vs 0.22 million needed |
| Park summer schedule (April to October), including the nightly 10 PM program | about 2.0 million | medium | Park meters use 2.1 million more than need in April to October; the 10 PM program, 7 nights a week, is about a third of park water (controller run-time analysis, 2026-10-07) |
| Watering after rain | about 0.1 to 0.2 million | low | Since July, the park ran full cycles in the 4 days after 4 of 8 storms of 0.20 in or more (07-21, 08-20, 08-31, 09-04), about 21,000 to 33,000 gallons each. It did pause after the other 4. Meter 4 watered during the 10-11 rain. |
| Known leaks today | about 0.03 to 0.07 million | medium | Meter 1 trickle about 100 gallons a day when present; meter 4 valve stuck 3 times (about 39,500 gallons) |
| Meter 4 valve, if it keeps sticking | up to about 0.5 million | low | Same rate as September to October 2026, every month |

Your instinct is right about overwatering and rain. On the numbers we have, **leaks are a small share.** The exception is meter 4's valve: if it keeps sticking at the fall rate, it could become the single costliest problem on that meter, and every gallon would pay the top price. It should be repaired before mid-November regardless.

## The desert zone that was turned off

The west wash drip (entrance station 5, meter 3) has been off since at least March 29, 2026, and is thriving. That is strong evidence for Case A's desert factor, or lower: established native desert here lives on rain.

But the standard formulas say the desert drip is **not** heavily overwatered in total. Meter 4 used 409,000 gallons in the last 12 periods against a lean need of about 356,000. The desert savings come from the shape: no drip in December to February (meter 4 used about 30,000 gallons a month last winter), and summer watering only as deep, infrequent tree watering. If more desert zones behave like the west wash, the real need is below Case A and the model overstates it.

The cheapest way to find out: **turn off one more no-tree desert zone on meter 4 from mid-November through March**, when ETo is lowest and the risk is smallest, and photograph it monthly. Leave tree zones on a deep, infrequent schedule.

## About the $30,000 goal

You're right that the HOA cannot control the price. At 2027 rates, even the lean case costs about $37,000 in a normal year. It costs about $33,000 if winter water is kept up to protect the base, and about $47,000 in a dry year. Fixed service charges and fees alone are about $2,900 a year.

A consumption target is more useful and is within the HOA's control: **about 3.0 to 3.7 million gallons a year** (normal weather), against 6.5 million today. Tracked per read period, the monthly rows above give a target for each bill.

## Assumptions

| Assumption | Value | Source | Confidence |
|---|---|---|---|
| ETo, monthly | 2.22 to 9.49 in | AZMET Queen Creek, 2021 to 2025 means (data/weather/monthly-normals.md) | medium |
| Rain, monthly | average 2003 to 2025; dry year 2020 | NOAA ACIS East Mesa (same file) | medium |
| Share of rain plants use | 50% | Jennifer's Zone Plan Model, Inputs | low |
| Turf area | 86,354 sq ft | Waterfluence measured turf | medium |
| Turf split | 62% meter 1, 38% meter 2 | Station flows and hourly data (docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md) | medium |
| Bermuda plant factor | 0.5 (A), 0.6 (B) March to October | Workbook healthy minimum; WUCOLS warm-season | low (A), medium (B) |
| Dormant Bermuda | 0.1 December to February, 0.3 November, 0.4 March (A only; B uses 0.6) | Set for this model; no published source in hand | low |
| Rye overseed | 0.8 November to March | WUCOLS cool-season; data/config/site.md rain check | medium |
| Turf efficiency | 0.75 (A), 0.70 (B) | Workbook after wet check; Waterfluence IE | low |
| Desert plant factor | 0.10 (A), 0.15 (B), efficiency 0.9 | Workbook plant types (ADWR/AMWUA planning values) | low |
| Desert area | meter 1 and meter 2: 127,652 sq ft each; meter 3: 73,721; meter 4: 162,429 | Gross map areas (data/areas.md). Park non-turf plus half of area B split between the park meters; area C split evenly between meters 3 and 4; area D on meter 4. The halves are guesses. | low |
| Rates through January 2027 | data/rates/2026-05-13.md | Derived from bills | medium |
| Rates from February 2027 | data/rates/2027-02-01.md | City AF&E recommendation, not adopted | medium |
| Rate change timing | by read period end date | Matches how the 2026 changes were billed | medium |

The bill calculator mirrors `src/engine/billing.ts` and reproduces meter 1's bill of 2026-07-28 ($5,260.02).

## What would firm this up

1. Park controller settings pages 1, 2, and 4 to 9: which program runs at 10 PM, and the run minutes per station.
2. Irrigated (drip) area per meter, or at least which desert zones have trees.
3. The adopted 2027 rate ordinance after December 8, 2026.
4. A catch-can audit on 2 or 3 park turf zones, to replace the 0.70 to 0.75 efficiency guess.
5. A decision on overseeding and winter watering before about November 13, 2026.
