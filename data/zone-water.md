---
title: "Water used by each watering zone"
source: "Park: WeatherTRAK Runtime History Report, Park controller, 2026-01-01 to 2026-11-13 (sources/controllers/weathertrak-runtime-history-park-2026.md), with station flows from the Learn Flow Report (sources/controllers/weathertrak-learn-flow-park-2026-11-13.md). Entrance: WeatherTRAK Multi-Controller Runtime Report, 2023-11-01 to 2026-10-31 (sources/controllers/weathertrak-multi-controller-runtime-2023-11-to-2026-10.md), data/controller-usage/A, and the Entrance learn-flow tests (sources/controllers/weathertrak-learn-flow-entrance-2026-11-13.md)."
method: "Park: for every day, each station's run minutes times the flow it had then (each flow test applies from its date), scaled so that day's stations add up exactly to what the park flow sensor measured. 1,659 gallons of the 5,130,181 measured fell on days with no station running and are not given to any station. Check: on the 57 days from July 17 to November 4 with complete hourly reads on both City meters, these stations put 70.4% of the water on meter 1 and the meters recorded 70.5%, and the two meters together were within 1.3% of the sensor. Entrance: the controller does not report run time per station, so A4 and A6 are split evenly by hours (same program and run times in March and November 2026) and multiplied by their tested flows."
confidence: medium
todo: "Get the Entrance controller's Single Controller Runtime History report (by station, by day) to replace the even split of A4 and A6. Controller B needs a flow sensor, or its run times and the flow of each valve, before its zones can be measured."
---

Gallons each zone used. `Gallons` is the best figure; `Low` and `High` are a range when the figure is an estimate. Park rows are measured by the park flow sensor; entrance rows are estimates per average year; controller B is not measured. Do not add rows with different periods together.

| Stations | Meter | Period | Gallons | Low | High | Basis | Confidence | Note |
|---|---|---|---|---|---|---|---|---|
| C1 | meter-1 | Jan 1 to Nov 13, 2026 | 411245 | | | measured | high |  |
| C2 | meter-1 | Jan 1 to Nov 13, 2026 | 312488 | | | measured | high |  |
| C3 | meter-1 | Jan 1 to Nov 13, 2026 | 297059 | | | measured | high | Its tested flow fell from 41 to 35 GPM on Nov 12; the older flow is used before that. |
| C4 | meter-1 | Jan 1 to Nov 13, 2026 | 530140 | | | measured | high |  |
| C5 | meter-1 | Jan 1 to Nov 13, 2026 | 543145 | | | measured | high |  |
| C6 | meter-1 | Jan 1 to Nov 13, 2026 | 525666 | | | measured | high |  |
| C7 | meter-1 | Jan 1 to Nov 13, 2026 | 456557 | | | measured | high |  |
| C8 | meter-2 | Jan 1 to Nov 13, 2026 | 284752 | | | measured | high |  |
| C9 | meter-2 | Jan 1 to Nov 13, 2026 | 379321 | | | measured | high |  |
| C10 | meter-2 | Jan 1 to Nov 13, 2026 | 406074 | | | measured | high |  |
| C11 | meter-2 | Jan 1 to Nov 13, 2026 | 416965 | | | measured | high |  |
| C12 | meter-2 | Jan 1 to Nov 13, 2026 | 273163 | | | measured | high |  |
| C13 | meter-2 | Jan 1 to Nov 13, 2026 | 97210 | | | measured | medium | Counted at 20.5 GPM all year: it ran at about half its 2024 tested flow until it was retested in May. |
| C14 | meter-1 | Jan 1 to Nov 13, 2026 | 139736 | | | measured | high |  |
| C15 | meter-1 | Jan 1 to Nov 13, 2026 | 54999 | | | measured | medium | Counted at 21.5 GPM from Aug 25 to Oct 6, when it ran at about double its normal flow. |
| A4 | meter-3 | average year, Nov 2023 to Oct 2026 | 205000 | 193000 | 219000 | estimated | low | Half of the 685 hours A4 and A6 ran together in three years, at A4's tested 28 to 32 GPM, divided by three. If the landscaper's owner is right, this one station waters all the landscape outside the gates. |
| A6 | meter-3 | average year, Nov 2023 to Oct 2026 | 112000 | 103000 | 121000 | estimated | low | Same hours as A4 at its earlier tested 15 to 18 GPM. It has had no water since September 2026. |
| A1, A2, A3, A5 | meter-3 | average year, Nov 2023 to Oct 2026 | 100000 | 79000 | 125000 | estimated | low | What is left of the controller's measured 1.26 million gallons in three years after A4 and A6, divided by three. Almost all of it was the entry lawn, now artificial turf; the west wash (A5) has been off since at least March 2026. |
| B1, B2, B3, B4 | meter-4 | | | | | not measured | low | Controller B has no flow sensor and no run-time reports, so only meter 4's total is known (409,000 gallons in the 12 read periods to September 2026, including a valve that would not shut off). |
