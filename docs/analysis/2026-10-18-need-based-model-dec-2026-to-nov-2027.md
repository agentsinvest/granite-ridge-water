# Need-based water model, 12 bills from December 2026 to November 2027 (2026-10-18, revised)

Question from Jennifer: model water by month for the next 12 City bills from what the landscape actually needs (not past use), priced at 2026 and 2027 City rates, with December to February setting the winter base. She thinks leaks, watering through rain, and overwatering are the problem, and notes a desert zone that was turned off is thriving.

Revised the same day after Jennifer's review:

* 12 read periods, ending December 2026 through November 2027 (was 13).
* The entry turf is artificial turf from late August 2026: no entry turf in need or in "today".
* Overseed watering is now modeled as a few weeks of germination plus watering the established rye, at a leaner rye plant factor.
* The City's 2027 rates are assumed to pass as recommended (Council vote December 8, 2026).

Short answer: **there is enough data for a planning model with honest ranges, not for a firm zone-by-zone budget.** On plant need, the next 12 bills should total about **2.8 to 3.6 million gallons without overseeding, against 6.4 million at today's pace: 43% to 56% less water.** That costs about **$34,000 to $43,000**, against about **$63,500 if nothing changes.** Overseeding adds about 0.4 to 0.8 million gallons and $1,900 to $3,100 in water, plus the $4,137 overseed charge.

Three findings matter most:

1. **Most of the extra water is the schedule, not leaks.** Known leaks today are under 100,000 gallons a year. The gap between use and need is about 2.8 to 3.5 million.
2. **Cutting winter water to need raises the price of every summer gallon.** The City's lower-price allowance comes from the December to February bills. Water winter only to need and that allowance falls to about zero. Then nearly every summer gallon pays the top 2027 price ($10.58 per thousand instead of $6.84). The water cut still saves far more than the price rise costs.
3. **The winter base starts about November 13, 2026.** The "December" bill covers about November 13 to December 12. The overseed and winter-watering decision, and the meter 4 valve repair, need to be done by then.

This is a planning estimate. It is not shown on the public site, and no number here has been reconciled against bills.

## Is there enough data?

| Input | Have it? | Confidence |
|---|---|---|
| City rates, bills ending December 2026 and January 2027 | Derived from 48 bills; reproduce real bills within $0.18 of tax | medium |
| City rates, from the bill ending February 2027 | AF&E recommendation, assumed adopted as proposed | medium |
| Winter base rule | Derived from bills; reproduces every excess-usage charge to the cent | medium |
| Monthly weather (ETo, rain) | AZMET Queen Creek 2021 to 2025 means; NOAA East Mesa rain 2003 to 2025 | medium |
| Park turf area | 76,600 sq ft on Jennifer's map (lean case) to 86,354 measured by Waterfluence (cautious case). The 9,750 sq ft difference may be the old entry turf; not confirmed. | medium |
| Park turf split by meter | 62% meter 1, 38% meter 2, from station flows and hourly data | medium |
| Desert irrigated area by meter | **No.** Gross map areas only, split by guesswork (see assumptions) | low |
| Zone schedules and run times | **No** for the park and meter 4 | n/a |
| Plant factors | WUCOLS and ADWR/AMWUA planning values, plus Jennifer's workbook | low to medium |

The two gaps that most limit accuracy are the **park controller run times** (pages 1, 2, and 4 to 9 of the settings report) and the **irrigated desert area per meter**. Turf is about 80% of the modeled water, and its inputs are the better ones.

## How need was calculated

For each meter and each City read period:

irrigation need (gallons) = max(0, ETo x plant factor - rain x 50%) x area x 0.623 / efficiency

Read periods end about the 12th to 15th of the month, so each one uses the average of the two calendar months it spans. Leaks are not part of need; they are listed separately below.

| | Case A: lean | Case B: cautious |
|---|---|---|
| Bermuda, March (overseed: April) to October | plant factor 0.5 (healthy minimum, Jennifer's workbook) | 0.6 (WUCOLS warm-season turf) |
| Bermuda, no overseed | 0.3 in November, 0.1 December to February (dormant), 0.4 in March | same, but 0.6 in March |
| Established rye, November to March, if overseeded | 0.6 | 0.8 (WUCOLS cool-season) |
| Germination, if overseeded (seeded mid-October) | 3 weeks at plant factor 1.0 | 4 weeks at 1.0 |
| Turf area | 76,600 sq ft | 86,354 sq ft |
| Sprinkler efficiency | 0.75 (after leak repair and a wet check) | 0.70 (Waterfluence's current setting) |
| Desert drip | plant factor 0.10 "natural desert" on gross area, efficiency 0.9 | 0.15 "very low native", capped at what each meter uses today |

"Today's pace" is the last 12 actual read periods (ending October 2025 to September 2026), with meter 3 cut by 29% to remove the entry turf. That 29% is the turf's share of meter 3's water in the July 2026 hourly data (docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md).

## Results by month (normal weather, no overseed)

Thousand gallons. Bills ending December 2026 and January 2027 are at today's derived rates; from February 2027 they are at the 2027 rates. Bills ending December 2026 to February 2027 use the current winter base (set last winter); from March 2027 they use the base the modeled winter sets.

**Today's pace (comparison only):**

| Bill ending | Dec 26 | Jan 27 | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov 27 | 12 bills |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Meter 1 | 104 | 115 | 159 | 166 | 260 | 310 | 575 | 575 | 374 | 399 | 342 | 232 | 3,611 |
| Meter 2 | 57 | 58 | 85 | 88 | 147 | 192 | 325 | 324 | 229 | 221 | 200 | 135 | 2,061 |
| Meter 3 | 13 | 13 | 19 | 15 | 19 | 19 | 37 | 42 | 26 | 30 | 22 | 23 | 278 |
| Meter 4 | 32 | 30 | 30 | 37 | 32 | 29 | 43 | 36 | 26 | 32 | 42 | 40 | 409 |
| **All meters** | 206 | 216 | 293 | 306 | 458 | 550 | 980 | 977 | 655 | 682 | 606 | 430 | **6,359** |
| **Bills, $** | 1,505 | 1,567 | 2,554 | 2,712 | 4,464 | 5,540 | 10,517 | 10,485 | 6,770 | 7,063 | 6,178 | 4,136 | **63,490** |

**Case A, lean need:**

| Bill ending | Dec 26 | Jan 27 | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov 27 | 12 bills |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Meter 1 | 11 | 0 | 0 | 30 | 123 | 215 | 255 | 237 | 175 | 132 | 117 | 66 | 1,361 |
| Meter 2 | 7 | 0 | 0 | 19 | 85 | 156 | 186 | 169 | 116 | 84 | 77 | 44 | 943 |
| Meter 3 | 0 | 0 | 0 | 0 | 15 | 35 | 44 | 35 | 13 | 4 | 8 | 6 | 160 |
| Meter 4 | 0 | 0 | 0 | 1 | 33 | 78 | 97 | 77 | 30 | 9 | 18 | 13 | 356 |
| **All meters** | 18 | 0 | 0 | 50 | 256 | 484 | 582 | 518 | 334 | 229 | 220 | 129 | **2,820** |
| **Bills, $** | 312 | 234 | 241 | 735 | 3,066 | 5,712 | 6,849 | 6,107 | 3,971 | 2,753 | 2,648 | 1,592 | **34,221** |

**Case B, cautious need:**

| Bill ending | Dec 26 | Jan 27 | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov 27 | 12 bills |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Meter 1 | 17 | 0 | 0 | 47 | 165 | 261 | 329 | 328 | 271 | 229 | 194 | 106 | 1,947 |
| Meter 2 | 12 | 0 | 0 | 31 | 97 | 157 | 192 | 191 | 161 | 137 | 114 | 63 | 1,155 |
| Meter 3 | 2 | 0 | 0 | 7 | 19 | 19 | 37 | 42 | 26 | 24 | 22 | 15 | 213 |
| Meter 4 | 5 | 0 | 0 | 15 | 32 | 29 | 43 | 36 | 26 | 32 | 42 | 33 | 293 |
| **All meters** | 36 | 0 | 0 | 100 | 313 | 466 | 601 | 597 | 484 | 422 | 372 | 217 | **3,608** |
| **Bills, $** | 397 | 234 | 241 | 1,243 | 3,715 | 5,491 | 7,057 | 7,011 | 5,700 | 4,980 | 4,400 | 2,601 | **43,069** |

The January and February bills show zero water in both cases. Dormant Bermuda and established desert plants need nothing beyond average winter rain. Those bills are service charges and fees only. In a dry winter, trees would still need some deep watering.

**With overseed, Case A, park meters only** (meters 3 and 4 are unchanged):

| Bill ending | Dec 26 | Jan 27 | Feb | Mar | Apr | May to Oct | Nov 27 |
|---|---|---|---|---|---|---|---|
| Meter 1 | 43 | 32 | 45 | 77 | 143 | same as above | 154 |
| Meter 2 | 26 | 19 | 27 | 47 | 97 | same as above | 98 |

The bill ending November 2027 includes the October 2027 germination.

## 12-bill totals

| Scenario | Million gallons | Cost | Per home per month (56 homes) |
|---|---|---|---|
| Today's pace (entry turf removed) | 6.36 | $63,500 | $94 |
| A lean, no overseed | 2.82 | $34,200 | $51 |
| A lean, overseed | 3.24 | $36,100 | $54 |
| A lean, no overseed, winter water kept at last year's level | 3.52 | $32,100 | $48 |
| A lean, no overseed, dry year (2020 rain) | 3.86 | $44,300 | $66 |
| B cautious, no overseed | 3.61 | $43,100 | $64 |
| B cautious, overseed | 4.37 | $46,100 | $69 |
| B cautious, no overseed, winter water kept at last year's level | 4.29 | $40,200 | $60 |

Overseed charges ($4,137 a year on the P&Ls) are not in these water costs.

## Overseeding: how much water it really adds

Germination itself is small, as Jennifer said: about 112,000 gallons (Case A, 3 weeks) to 144,000 (Case B, 4 weeks).

The larger part is watering the established rye through the winter. Bermuda going dormant needs almost nothing in December to February; rye stays green and needs water every week or so. In Case A that is about 310,000 gallons from November to March; in Case B about 620,000. Last winter's actual bills support this: the park meters used 578,000 gallons in the December to February bills.

| | Case A | Case B |
|---|---|---|
| Germination | 112,000 gallons | 144,000 |
| Established rye, November to March | about 310,000 | about 620,000 |
| **Total extra water** | **about 420,000** | **about 770,000** |
| Extra water cost | $1,855 | $3,080 |
| Overseed charge | $4,137 | $4,137 |
| **Total cost of overseeding** | **about $6,000** | **about $7,200** |

The water cost looks small for the gallons because rye water also raises the winter base, and that lowers the price of summer water.

## The winter base trade-off

From the February 2027 bill, each meter's water is priced in three steps (plus drought charge and tax):

* up to the winter average: $6.84 per thousand gallons
* up to 1.5 times the winter average: $10.28
* above that: $10.58

Watering winter only to need leaves the park meters with a winter average of about 3,000 to 4,000 gallons per bill. Last winter it was about 126,000 on meter 1 and 67,000 on meter 2. With an average that low, summer water pays almost all at $10.58.

* In Case A, keeping winter water at last year's level costs about 700,000 more gallons and lowers the 12 bills by about $2,100. In Case B it costs about 680,000 gallons and saves about $2,900.
* Overseeding works the same way, which is why its water cost above is low for the gallons.

Blunt version: **the City's rate design pays the HOA a little to waste water in winter.** The dollars are modest, about $2,000 to $3,000 a year, and the water does nothing for a dormant lawn. If the goal is consumption, water winter to need and accept the higher summer price. That is a board decision, and it should be made on purpose.

## Where the extra water is going

Gap between today's pace and Case A: about 3.5 million gallons over 12 bills.

| Source | Gallons over 12 bills | How sure | Evidence |
|---|---|---|---|
| Cool-season watering (bills ending November to March), mostly rye | about 1.25 million | medium | 1.45 million used today vs 0.20 million needed without overseed |
| Spring and summer schedule (bills ending April to October), mostly the park, including the nightly 10 PM program | about 2.3 million | medium | Park meters use 2.3 million more than need; the 10 PM program runs 7 nights a week and is about a third of park water (2026-10-07 run-time analysis) |
| Watering after rain | about 0.1 to 0.2 million (inside the two rows above) | low | Since July, the park ran full cycles in the 4 days after 4 of 8 storms of 0.20 in or more (07-21, 08-20, 08-31, 09-04), about 21,000 to 33,000 gallons each. It paused after the other 4. Meter 4 watered during the 10-11 rain. |
| Known leaks today | about 0.03 to 0.07 million | medium | Meter 1 trickle, about 100 gallons a day when present; meter 4 valve stuck 3 times (about 39,500 gallons) |
| Meter 4 valve, if it keeps sticking | up to about 0.5 million | low | Same rate as September to October 2026, every month |

Jennifer is right about overwatering and rain. On the numbers we have, **leaks are a small share.** The exception is meter 4's valve: if it keeps sticking at its fall rate, it becomes the costliest problem on that meter, all at the top price. Repair it by mid-November regardless.

## The desert zone that was turned off

The west wash drip (entrance station 5, meter 3) has been off since at least March 29, 2026, and is thriving. That supports Case A's desert factor, or lower: established native desert here lives on rain.

But the standard formulas do **not** show the desert drip as heavily overwatered in total. Meter 4 used 409,000 gallons in the last 12 bills against a lean need of about 356,000. The desert savings are in the timing: no drip in December to February (meter 4 used about 30,000 gallons a month last winter), and in summer only deep, infrequent tree watering. If more desert zones behave like the west wash, real need is below Case A.

The cheapest test: **turn off one more desert zone with no trees on meter 4 from mid-November through March**, when ETo is lowest and the risk is smallest. Photograph it monthly. Keep tree zones on a deep, infrequent schedule.

## About the $30,000 goal

The HOA does not control the price, so a dollar target is the wrong measure. With 2027 rates as proposed, even the lean case costs about $34,000 in a normal year, about $32,000 if winter water is kept up to protect the base, and about $44,000 in a dry year. Fixed service charges and fees alone are about $2,900 a year.

The target the HOA controls: **about 2.8 to 3.6 million gallons over the 12 bills without overseed** (normal weather), against 6.4 million today. The monthly rows above give a target for each bill.

## Assumptions

| Assumption | Value | Source | Confidence |
|---|---|---|---|
| ETo, monthly | 2.22 to 9.49 in | AZMET Queen Creek, 2021 to 2025 means (data/weather/monthly-normals.md) | medium |
| Rain, monthly | average 2003 to 2025; dry year 2020 | NOAA ACIS East Mesa (same file) | medium |
| Share of rain plants use | 50% | Jennifer's Zone Plan Model, Inputs | low |
| Park turf area | 76,600 (A) or 86,354 (B) sq ft | Jennifer's map; Waterfluence measured turf | medium |
| Turf split | 62% meter 1, 38% meter 2 | Station flows and hourly data | medium |
| Bermuda plant factor | 0.5 (A), 0.6 (B) in the growing season | Workbook healthy minimum; WUCOLS warm-season | low (A), medium (B) |
| Dormant Bermuda | 0.1 December to February, 0.3 November, 0.4 March (A) | Set for this model; no published source in hand | low |
| Rye plant factor | 0.6 (A), 0.8 (B) November to March | Set for this model (A); WUCOLS cool-season (B) | low (A), medium (B) |
| Germination | 3 (A) or 4 (B) weeks at plant factor 1.0, seeded mid-October | Jennifer, 2026-10-18 ("only a few weeks of additional water"); plant factor set for this model | low |
| Turf efficiency | 0.75 (A), 0.70 (B) | Workbook after wet check; Waterfluence IE | low |
| Desert plant factor | 0.10 (A), 0.15 (B), efficiency 0.9 | Workbook plant types (ADWR/AMWUA planning values) | low |
| Desert area | meter 1 and meter 2: 127,652 sq ft each; meter 3: 73,721; meter 4: 162,429 | Gross map areas (data/areas.md): park non-turf plus half of area B, split between the park meters; area C split evenly between meters 3 and 4; area D on meter 4. The halves are guesses. | low |
| Entry turf share of meter 3 | 29% | July 2026 hourly data, entrance turf vs drip nights | low |
| Rates, bills ending December 2026 and January 2027 | data/rates/2026-05-13.md | Derived from bills | medium |
| Rates from the bill ending February 2027 | data/rates/2027-02-01.md, assumed adopted as recommended | City AF&E recommendation | medium |
| Rate change timing | by read period end date | Matches how the 2026 changes were billed | medium |

The bill calculator mirrors `src/engine/billing.ts` and reproduces meter 1's bill of 2026-07-28 ($5,260.02).

## What would firm this up

1. Park controller settings pages 1, 2, and 4 to 9: which program runs at 10 PM, and the run minutes per station.
2. Irrigated (drip) area per meter, or at least which desert zones have trees.
3. The adopted 2027 rate ordinance after December 8, 2026.
4. A catch-can audit on 2 or 3 park turf zones, to replace the 0.70 to 0.75 efficiency guess.
5. The overseed and winter-watering decision, by about November 13, 2026.
