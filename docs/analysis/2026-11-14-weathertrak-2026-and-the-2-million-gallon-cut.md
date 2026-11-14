# WeatherTRAK reports of 2026-11-13, and where a 2 million gallon cut in 2027 can come from (2026-11-14)

Question from Jennifer: review the five WeatherTRAK reports she pulled on 2026-11-13, flag anything to look into, and model a 2 million gallon reduction for 2027.

This is a planning estimate, not shown on the public site. No number here is reconciled against bills.

## What the five reports are

| Report | Controller | Covers | Transcription |
|---|---|---|---|
| Controller Inventory | both | settings as of 2026-11-13 | `sources/controllers/weathertrak-inventory-2026-11-13.md` |
| Estimated Usage | Park | 2026-01-01 to 2026-11-13 (prints "to 12/31/2026") | `sources/controllers/weathertrak-estimated-usage-park-2026.md` |
| Runtime History | Park | daily, 2026-01-01 to 2026-11-13, minutes per station | `sources/controllers/weathertrak-runtime-history-park-2026.md` |
| Learn Flow | Park | flow tests 2024-08 to 2026-11-12 | `sources/controllers/weathertrak-learn-flow-park-2026-11-13.md` |
| Learn Flow | Entrance | flow tests 2025-11 to 2026-11-12 | `sources/controllers/weathertrak-learn-flow-entrance-2026-11-13.md` |

Checks: the Runtime History's daily gallons for January to September 2026 match the Measured Usage History already in `data/controller-usage/C/2025-2026.md` to the gallon every month. The 15 station estimates add to the printed 4,924,310. October 1 to November 13, 2026 is new data; it is in the source transcription only, because this report does not split gallons into scheduled, manual and other the way `controller-usage/` requires.

## Short answer on 2 million gallons

**It is achievable, and almost all of it has to come from summer watering of the park lawn.** It does not need new equipment. It does need the landscaper to cut park lawn watering in May to August by roughly 40 to 45 percent from 2026, and to keep it there.

| Piece (2027 against the last 12 read periods, 6.47 million gallons) | Gallons saved | Confidence |
|---|---|---|
| Park lawn, April to August, cut to the need model's Case B (cautious) | 1.41 million | medium |
| Park lawn, April to August, cut to Case A (lean) instead | 2.06 million | medium |
| Entry lawn now artificial turf (meter 3: 392,000 last 12 periods, need model 160,000 to 213,000) | 180,000 to 230,000 | high (already done) |
| Meter 4 desert strip at the need model's level (409,000 to 293,000 to 356,000) | 50,000 to 115,000 | low |
| Meter 1 drip fixed (open flag) | about 59,000 | medium |
| **Total with the park at Case B** | **about 1.7 to 1.8 million** | |
| **Total with the park at Case A** | **about 2.35 to 2.45 million** | |

So 2 million lands between the two cases: the park lawn has to come in a bit leaner than Case B in summer, about 1.6 to 1.7 million gallons below 2026 for April to August.

**It does not reach the $30,000 goal.** The need model prices Case A (3.24 million gallons for the 12 bills from December 2026) at $36,100 and Case B (4.37 million) at $46,100 under the 2027 rates. A 2 million cut from 6.47 million leaves about 4.5 million gallons, which is Case B territory, roughly $45,000 to $47,000. Reaching $30,000 needs roughly 2.6 million gallons a year or less (a rough extension of the need model, not priced bill by bill), which means less lawn, less winter rye, or both. The last 12 periods priced at 2027 rates are about $63,500, so a 2 million cut is worth roughly $17,000 a year.

## Why the park lawn is where the water is

The flow sensor and the meters agree (1.04 ratio, see `data/controllers/park.md`), and measured water matched run time times station flow within 2 to 7 percent every month of 2026. Days with no station running read 0 to 2 gallons. **This is not a leak after the sensor. It is the schedule.**

Park lawn stations C1 to C12, 2026 (run time times the 2026-11-12 learned flow, times 1.05 to match the sensor). Need is the lawn formula from `docs/analysis/2026-10-18-need-based-model-dec-2026-to-nov-2027.md` with the controller's own ET, no rain credit:

| Month | Controller ET (in) | Lawn gallons | Inches applied (86,354 sq ft) | Need, Case B | Need, Case A |
|---|---|---|---|---|---|
| Jan | 3.38 | 190,000 | 3.5 | 208,000 | 129,000 |
| Feb | 4.22 | 224,000 | 4.2 | 259,000 | 161,000 |
| Mar | 6.91 | 348,000 | 6.5 | 425,000 | 264,000 |
| Apr | 7.32 | 443,000 | 8.2 | 338,000 | 233,000 |
| May | 9.31 | 745,000 | 13.9 | 429,000 | 296,000 |
| Jun | 10.69 | 891,000 | 16.6 | 493,000 | 340,000 |
| Jul | 9.23 | 689,000 | 12.8 | 426,000 | 294,000 |
| Aug | 9.02 | 743,000 | 13.8 | 416,000 | 287,000 |
| Sep | 6.21 | 198,000 | 3.7 | dry-down for overseed | |
| Oct | 5.81 | 237,000 | 4.4 | dry-down, then seeding | |
| Nov 1 to 13 | 1.76 | 177,000 | 3.3 | seeding | |

* Winter (January to March) is already at or below Case B. There is little to cut there without dropping the rye.
* April to August used 3.51 million gallons against a Case B need of 2.10 million and a Case A need of 1.45 million.
* In June the lawn got 16.6 inches of water on 10.7 inches of weather demand: 1.55 times reference ET. Bermuda needs about 0.5 to 0.6 times reference ET plus sprinkler losses. Cutting 45 percent still leaves about 0.85 times ET applied, which is Case B's level.

Case B uses 86,354 sq ft of turf (Waterfluence) and 70 percent efficiency; Case A uses 76,600 sq ft and 75 percent. With the smaller area the over-application is larger.

## Flags from these reports

### Look into first

1. **Six of the twelve park lawn stations do not adjust for weather.** C3 to C6 and C10, C11 (the full-circle rotors in the middle of the lawn) are in "User no ET" mode: fixed run times. In March 2026 Eco Verde found every station in User ET mode, so this changed between March and November. These six used 2.57 million of the controller's 4.92 million estimated gallons this year. Ask the landscaper who changed it and why, and put them back on weather adjustment. The other six lawn stations are in Auto mode and also over-applied in summer, so mode alone is not the whole fix: the run times or Auto settings are too generous on all twelve.
2. **The drip plant types are wrong.** C13 to C15 water desert plants and trees but are set as warm-season turf in Auto mode, so the controller calculates turf water for them. They used 274,000 gallons this year. Set them to the right plant type, keeping enough for the trees.
3. **The Estimated Usage report is not a full year.** It says 01/01/2026 to 12/31/2026 and 4,924,310 gallons, but it was run on November 13 and only covers to that day. Do not quote 4.9 million as the 2026 total. The sensor measured 5.13 million to November 13; the full year will likely be about 5.4 million (November 14 to December 31 was 265,000 last year).
4. **Entry drip station A6 still gets no water.** Its flow test on 2026-11-12 learned 0.1 GPM (15.1 in March 2026, 17.7 in November 2025). That is the same failure the No Flow alarms showed on September 19, 20 and 22. Nothing on file shows it has watered since.
5. **Something on park mainline 2 was shut during two flow tests.** C8, C9 and C12 tested at 0.1 GPM on October 26 and the morning of November 12, then normal at 1 PM on November 12. Mainline 2 has master valve MV2, the one Eco Verde found leaking. Ask whether MV2 was being repaired. Separately, these reports put C1 to C7, C14 and C15 on mainline 1 and C8 to C13 on mainline 2, which matches the meter-1 and meter-2 split already in the model. If MV2 is on meter 2, the meter-1 drip flag is not MV2.

### Worth knowing

6. **C15 high flow looks repaired.** It was cut to 4 minutes a night from September 4, ran normally again from October 9 (12 to 14 GPM implied), and tested at 11.4 GPM on November 12. Flag updated; confirm with the landscaper and mark it fixed.
7. **C13's low-flow alarm was cleared by relearning, not by a repair on record.** Its learned flow went from 42 GPM (2024) to 20 on 2026-05-20. If 42 was right, C13 is still running at half flow, and the relearn just stopped the alarms. If 42 was a leak, the relearn was right. Ask which.
8. **Station flow changes on 2026-11-12.** C3 dropped from 41 to 35 GPM (clogged nozzle or partly closed valve?). C1 rose from 61 (2024) to 68. Small, but a rising flow on a rotor station can be a broken seal, which Eco Verde found in the park lawn.
9. **This fall's overseed used much less water than last year.** Lawn watering stopped September 12 to October 21. Germination watering from October 22 to November 12 was about 425,000 gallons; October 2025 alone was 781,000. Keep this schedule for fall 2027.
10. **The Park controller has two activation dates** (2023-06-28 on the usage report, 2024-02-27 on the inventory). The Entrance controller's is 2023-09-23. Neither tells us when the HOA bought them.

## What to ask the landscaper for

* The Park "Controller Settings Detail Report" (all pages): start times, run times, days, and the Auto settings (precipitation rate, root depth, efficiency, allowed depletion) for programs A to F.
* A written summer 2027 schedule for the park lawn that targets about 9 inches in June and 8 in July and August (Case B), not the 13 to 17 of 2026, with all twelve lawn stations on weather adjustment.
* Repair of entry drip A6, and what was done on mainline 2 and C15.
* A WeatherTRAK water budget for the site. The Budgets and Usage screen (2026-11-13) says "No budgets are active for this site." Its measured usage, 7,259 CCF (about 5.43 million gallons) from January 1 to about November 13, 2026, is the Park and Entrance flow sensors added together; every month matches `controller-usage` and the Runtime History within CCF rounding. Setting a monthly budget at the 2027 target lets the system flag a month that runs over while it can still be fixed. Its "aligned with billing period" rows equal the calendar rows, so no City bills have been entered there.

## How to model it in the app

The Savings calculator already has the levers: "Turn down" by percent and by season on the park lawn zones. A 45 percent summer turn-down on C1 to C12 is the closest match. The engine applies cuts in sequence, so do not stack this with a smart-controller saving on the same stations: the park already has smart controllers, and the problem is how they are set.
