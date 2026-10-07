# 2026-10-07: Yearly bill history by meter and monthly use tables from Jennifer's workbook

## Decision

Jennifer shared two sheets from her water model workbook and asked for the same views in the app. Added:

* "Bill history by meter" on How we got here: gallons and peak surcharge by meter and year (2020 to 2026 so far), the total HOA water bill, and all-in cost per 1,000 gallons.
* "Water use by meter and month" on How much should we use: a meter table (location, size, service charge, turf share) and monthly use by meter for the latest 12 read months and the 2024 and 2025 average, next to the turf need at a healthy minimum.

## Where the numbers come from

* `data/bills/` does not have every bill yet (most 2020 to 2022 gallons are missing), so yearly gallons and peak surcharge for 2020 to 2025 are copied from the workbook into `data/history/by-meter-year.md`, which was rebuilt from 324 City bills. Medium confidence. The transcription is in `sources/workbook/water-model-2026-10-07.md`.
* 2026 is checked, not trusted: tests confirm 2026 gallons equal the 2026 bills on file and 2026 peak surcharge equals the billing engine's split of those bills, within $1 per meter. They match to the dollar, which also confirms "peak surcharge" is the same measure as the higher-price extra on the monthly surcharge chart.
* Total bill is the P&L water line for 2020 to 2025 and the 2026 City bills so far, the same figures as the yearly spend chart. Cost per 1,000 gallons is computed.
* Monthly use is computed from `data/billing-periods/`, not copied. "Last 12 months" is the latest 12 read months on file (now Oct 2025 to Sep 2026, one month newer than the workbook's Sep 2025 to Aug 2026). The 2024 and 2025 average matches the workbook.
* Turf need at a healthy minimum is copied from the workbook into `data/budget/turf-minimum.md` with its assumptions (plant factor 0.50, efficiency 75%, both low confidence), because the monthly weather demand behind it is not in the repo.
* Meter sizes (1 1/2" for meters 1 and 2, 1" for 3 and 4) and turf share (88%, 90%, 0%, 0%) are now in the meter files, sourced to the workbook.

## Not copied

* Account numbers (the workbook's six-digit accounts) and full old meter numbers. Only last 4 digits are kept, per the public site rules.
* Homes (56). Not used by any screen yet.

## Open questions

* Put Granite_Ridge_Water_Bills_by_Meter.xlsx in `/raw/` and add the bills it has that `data/bills/` lacks, so 2020 to 2025 can be checked bill by bill.
* City prices before August 2025, so earlier peak surcharge can be recomputed.
* The weather data (station and years) behind the turf need row, and a cited source for the 0.50 plant factor.
