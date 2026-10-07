# Controller run times vs Waterfluence (2026-10-07)

Question from Jennifer: do the run times in the controller reports match what Waterfluence recorded? She also confirmed the entry became artificial turf in September 2026.

Short answer: **the controller reports and the meters agree where they can be compared.** The park controller's flow sensor and meters 1 and 2 add up to about the same water, the park's turf watering appears on both meters at the same times, and the entrance schedule shows in meter 3's hourly data. The comparison also turned up three things:

1. **The park waters every night at about 10 PM** on top of its early-morning turf program, 7 nights a week. That evening watering is about a third of the park's water. The settings printout does not show what it is.
2. **The entrance has had no water since 2026-09-14**, including the drip stations that water the entrance trees and shrubs, not just the turf that was removed.
3. **The park stations probably split by side:** stations 1 to 7 (east) on meter 1 and 8 to 12 (west) on meter 2.

This is analysis, not data shown on the site. Only Waterfluence hours that were actually reported are used; missing hours are never treated as zero. It is not yet known whether Waterfluence's read time marks the start or the end of the hour, so every time below could be off by one hour.

## What can and cannot be matched

| Controller | Run times in the reports? | Waterfluence data | What could be checked |
|---|---|---|---|
| Entrance, meter 3 | Yes: programs, days, minutes, cycles, soak (settings of 2026-03-29) | Hourly, 2026-07-03 to 10-01, with many gaps and filled-in hours | Watering days and timing |
| Park, meters 1 and 2 | No. Only the station flow rates page (page 3 of 9) is in the PDF | Hourly, 2026-07-03 to 10-06 | Total water, flow per station, which stations are on which meter, watering pattern |
| Controller B, meter 4 | No report at all | Hourly | Nothing to match |

Run minutes in User ET mode change every day with the weather, so a printout from March cannot be compared with July minutes directly. The checks below compare days, start times, and gallons.

## 1. Park controller totals vs meters 1 and 2

| Period | Park controller (flow sensor) | Meters 1 and 2 (City read periods, prorated by day) | Difference |
|---|---|---|---|
| 2026-02-28 to 03-29 | about 323,000 gallons (sum of the daily bars, read by eye from the chart on page 6) | about 311,000 | controller about 4% higher |
| 2025-03-06 to 04-04 | 284,815 gallons (HydroPoint Measured Usage report) | about 333,000 | controller about 14% lower |

Proration assumes even use across a read period. The controllers were in rain pause on several days from 2025-03-06 to 03-16, so that estimate is rougher. Within that uncertainty, all of meters 1 and 2's water goes through the park controller, as the Eco Verde map shows.

Both park meters also stop on exactly the same 8 turf mornings (2026-07-17, 07-19 to 07-21, 08-21, 09-01, 09-13, 09-14). They pause together because one controller and one rain sensor run both.

For the entrance in 2025, the controller measured 18,831 gallons against about 27,900 on meter 3 (prorated). That is about a third less. This is too rough to call a leak, but it is worth checking once a full read period of controller data is available.

## 2. Park watering pattern, July to mid-September 2026

**Early-morning turf program.** It runs Sunday, Monday, Tuesday, Thursday, and Friday, starting about midnight, and never on Wednesday or Saturday.

| | Meter 1 (east) | Meter 2 (west) |
|---|---|---|
| Typical watering morning (median of 45) | 9,932 gallons (range 4,550 to 19,237) | 6,099 gallons (range 2,932 to 11,701) |
| Hours with water | about 1 to 4 AM | about midnight to 2 AM |
| Steady flow mid-run | about 61 GPM | about 49 GPM |

Meter 1 drops one late-night hourly read on almost every watering night, so its mornings are slightly undercounted.

**Every-night evening program.** It was not in the March printout and runs 7 nights a week:

| | Meter 1 | Meter 2 |
|---|---|---|
| Sun, Mon, Wed, Thu, Sat | about 2,400 gallons at about 10 PM | about 5,500 gallons, 10 PM to midnight |
| Tue, Fri | about 1,590 gallons, about 10 to 11 PM | about 970 gallons, about 8 to 10 PM |

Taken together, a typical week is:

| | Morning turf | Evening program | Evening share |
|---|---|---|---|
| Meter 1 | about 49,700 gallons | about 15,200 | 23% |
| Meter 2 | about 30,500 gallons | about 29,500 | 49% |
| Park | about 80,200 gallons | about 44,700 | 36% |

The weekly total (about 125,000 gallons) matches the City read period 2026-08-13 to 09-14 (620,000 gallons over 33 days, about 132,000 a week).

**What the evening program might be.** The three park drip stations (13, 14, and 15) are the only park stations not accounted for by the morning turf pattern. Meter 1's evening flow (about 40 GPM) fits drip stations 14 and 15 (28 and 11 GPM). Meter 2's evening is more water than drip station 13 (41 GPM) alone: the 11 PM hour runs at about 55 GPM. So it may include a turf station too. If the evening program is drip, it runs 7 nights a week for one to two hours. That is a lot of water for desert trees and shrubs, and Eco Verde found the emitters badly placed at the base of mature trees. The park settings pages would answer this.

## 3. Which park stations are on which meter

Three things point the same way:

* **Valve locations** (Eco Verde map): valves C1 to C7, C14, and C15 are by the east master valve, and C8 to C13 are by the west master valve.
* **Station names**: 1 to 7 are NE, SE, and N stations; 8 to 12 are W, NW, SW, and Ramada stations.
* **Flow**: stations 1 to 7 have learned flows that average 62 GPM, close to meter 1's mid-run 61 GPM. Their total (435 GPM) against stations 8 to 12 (281 GPM) is a 61% to 39% split, and the morning turf water splits 62% to 38% (9,932 vs 6,099 gallons). That fits if every turf station runs about the same minutes. Meter 2's mid-run flow (49 GPM) is a little below the west stations' learned average (56 GPM).

So the likely split is stations 1 to 7, 14, and 15 on meter 1, and 8 to 12 and 13 on meter 2. Confidence is medium until the landscaper confirms.

If so, each turf station runs about 22 to 23 minutes per watering morning (9,932 / 435 GPM and 6,099 / 281 GPM) in July to September.

## 4. Entrance (meter 3) vs its printed program

Printed on 2026-03-29:

* Turf (program A): Sunday, Tuesday, Thursday, Friday, midnight to 7 AM, 2 cycles with 120-minute soaks.
* Drip (program B): Sunday and Thursday from 10 PM, 50 minutes on stations 4 and 6.

Seen in July, on the few days with all 24 hours reported:

* **Turf:** water comes in short bursts of about 230 to 290 gallons every two hours, about 1, 3, and 5 AM (sometimes 7 AM). That two-hour spacing is the printed cycle and soak. It was seen on Friday, Sunday, Monday, and Tuesday. Thursday nights are missing from the data, and Monday is not on the March printout, so the summer days may differ from March.
* **Drip:** about 1,900 to 3,100 gallons from about 11 PM to 1 AM on Sunday, Tuesday, and Thursday nights. Tuesday is not on the March printout either.

From late July to mid-September most meter 3 days are filled in by Waterfluence (the same value repeated for 10 to 13 hours), so the timing on those days cannot be read.

**After the artificial turf (September 2026):**

* The last watering seen on meter 3 is 2026-09-14.
* From 09-15 to 10-01, every reported hour is zero. That includes the drip nights: Thursday 09-24, 10 PM to Friday 4 AM, and Sunday 09-27 from 10 PM were both reported and zero. So the drip stations also stopped, not just the turf stations.
* The only water was 1,249 gallons in one daytime hour, 2026-09-21 at about 10 AM. That is probably installation work.
* Waterfluence has no meter 3 reads after 10-01.

If the Entrance controller was switched off for the install, the entrance trees and the McKellips drip have had no water for at least two and a half weeks in late-summer heat. The landscaper should turn the drip stations (4 and 6) back on and turn off only turf stations 1 to 3.

## Still needed

* Pages 1, 2, and 4 to 9 of the park Controller Settings Detail Report (programs, water days, start times, run minutes), to name the 10 PM program.
* Whether the Entrance controller or only its turf stations were turned off in September, and the install date.
* Whether Waterfluence read times mark the start or the end of the hour.
