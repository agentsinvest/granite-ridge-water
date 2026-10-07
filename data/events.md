---
todo: "Need event history: leak repairs (including whether the 2026 Eco Verde repairs were made, and when), controller changes, landscape changes (exact day the entry artificial turf was installed), meter changes, overseeding (see INVENTORY.md)"
---

# Events

Dated log of anything that changes water use. The leak engine uses this to explain step changes, and the How we got here chart annotates the timeline with it.

Types: `leak`, `repair`, `controller`, `schedule`, `landscape`, `meter`, `overseed`, `rebate`, `other`. `Precision` is `day`, `month`, or `year` so approximate dates are never shown as exact.

| Date | Precision | Meter | Zones | Type | What happened | Source |
|---|---|---|---|---|---|---|
| 2022-01-01 | year | | | rebate | HOA booked $1,138.60 of "Landscape Irrigation Equipment Incentives" income. Equipment and install date unknown. | 2022_PL.pdf, page 2, account 46002 |
| 2023-12-01 | month | meter-2 | | meter | City replaced meter-2's meter (old meter ending 1425, new meter ending 4031). First bill showing the new meter is dated 2023-12-29. | City of Mesa bills, data/bills/meter-2/ (meter number on each bill) |
| 2024-04-01 | month | meter-1 | | meter | City replaced meter-1's meter (old meter ending 1424, new meter ending 8300). First bill showing the new meter is dated 2024-04-29. | City of Mesa bills, data/bills/meter-1/ (meter number on each bill) |
| 2024-10-01 | month | meter-4 | | meter | City replaced meter-4's meter (old meter ending 3676, new meter ending 5793). First bill showing the new meter is dated 2024-10-25. | City of Mesa bills, data/bills/meter-4/ (meter number on each bill) |
| 2024-12-31 | day | | | other | Waterfluence monitoring program start date for the site (Waterfluence Agency panel). | Waterfluence Agency panel, sources/waterfluence/water-budget-and-site-settings.md |
| 2025-03-11 | day | | park stations 13, 14 | controller | Park controller raised Major "Station Low Flow" alerts on drip stations 13 and 14 on six nights from 2025-03-11 to 04-01 (station 13 at 15 to 17 GPM against a limit of 31; station 14 at 26 to 27 against 29). Low flow means those drip zones got less water than learned, not a leak. Whether it was fixed is unknown. | HydroPoint Multi-Controller Alert Report, 2025-03-06 to 04-04 (sources/controllers/hydropoint-reports-2025-04-04.md) |
| 2025-03-24 | day | | park stations 1 to 12 | schedule | Manual watering of all 12 park turf stations overnight, 10:13 PM to 4:14 AM (6 hours). The park controller measured 21,981 manual gallons from 2025-03-06 to 04-04. | HydroPoint Alert and Measured Usage Reports (sources/controllers/hydropoint-reports-2025-04-04.md) |
| 2025-04-30 | day | meter-3 | | meter | City replaced the meter on account ...8681: old meter ...3703 final read 6,124 on 2025-04-30; new meter ...4706 installed reading 0 the same day. The 2025-05-27 bill billed both meters for the split period. | City of Mesa bill dated 05/27/25 (Drive file Invoices (1)_opt (1).pdf) |
| 2025-07-25 | day | | park stations 4, 14 | controller | Park controller relearned the flow of station 4 (turf, now 71 GPM) and station 14 (drip, now 28 GPM). The other park stations were last learned in August or October 2024. | Eco Verde assessment, page 5 (sources/controllers/eco-verde-assessment-2026.md) |
| 2025-09-17 | day | meter-1 | | other | Late fee of $111.27 plus $9.24 tax on account ...8651 after the 2025-08-26 bills (all four meters) were not paid by the due date; a $3.00 delinquent letter charge plus $0.25 tax followed on 2025-09-30. Paid 2025-10-06. | City of Mesa bills dated 09/26/25 and 10/24/25 |
| 2026-02-16 | day | | | other | Eco Verde Irrigation full irrigation assessment meeting. Found a master valve leak at the east park master valve (meter-1), bad rotor wiper seals in the park, a broken lateral line in interior strip zone 3 and a valve not opening at B4 (meter-4), misaligned park rotor nozzles, and drip emitters at the base of mature trees. All controller stations were in User ET mode. Whether any repair was made is unknown. | Eco Verde Granite Ridge Final Report (sources/controllers/eco-verde-assessment-2026.md) |
| 2026-03-29 | day | | | controller | Controller settings printed for the assessment. Entrance: turf spray stations 1 to 3 on Sun, Tue, Thu, Fri; drip stations 4 and 6 on Sun and Thu for 50 minutes; west wash drip station 5 Off. | Eco Verde assessment, page 4 (sources/controllers/eco-verde-assessment-2026.md) |
| 2026-09-01 | month | meter-3 | entrance stations 1 to 3 | landscape | Entry turf replaced with artificial turf. The last watering on meter-3 in the hourly data is 2026-09-14; one daytime hour on 2026-09-21 used 1,249 gallons, probably installation work. | Jennifer, 2026-10-07; data/hourly/meter-3/2026.md |
| 2026-09-15 | day | meter-3 | entrance stations 1 to 6 | schedule | Meter-3 reads zero in every reported hour from 2026-09-15 to 10-01, including the drip nights, so the entrance drip (trees and shrubs) stopped along with the turf. Not confirmed whether the Entrance controller was switched off. | data/hourly/meter-3/2026.md; docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md |
