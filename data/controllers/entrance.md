---
id: A
name: Entrance
full_name: "Entrance controller"
model: "WeatherTRAK LC+ smart controller"
serial_last4: "6094"
meters: [meter-3]
has_flow_sensor: true
installed:
  from: null
  to: null
  in_use_by: 2023-10-01
  note: "WeatherTRAK lists its activation date as 2023-09-23. The earliest WeatherTRAK report on file starts October 1, 2023."
  source: "WeatherTRAK Controller Inventory Report of 2026-11-13 (sources/controllers/weathertrak-inventory-2026-11-13.md); WeatherTRAK Entrance report starting 2023-10-01 (sources/controllers/weathertrak-usage-entrance-2023-2024.md)"
  confidence: low
  todo: "Ask the landscaper or the board when this controller was installed."
source: "Eco Verde irrigation assessment, 2026, page 4 (controller settings of 2026-03-29) and section 3a (sources/controllers/eco-verde-assessment-2026.md); HydroPoint reports of 2025-04-04 (sources/controllers/hydropoint-reports-2025-04-04.md); zone names from data/map.md"
confidence: high
findings:
  - text: "The landscaper's owner says this controller waters all the landscape outside the community gates (Jennifer, 2026-11-14). It has only six stations: three former lawn spray stations (now off), the west wash drip (off), and two drip stations (A4 and A6). So outside the gates it can water only what A4, A5 and A6 reach. The Eco Verde map labels both the McKellips strip west of the homes and the northeast corner at Crismon as Zone 4, which fits A4 covering the whole McKellips frontage. The Crismon frontage (Zone 1 & 2) and the southeast corner (Zone 14) cannot be A1 or A2 (lawn spray) or a station A does not have, so the map still puts them on controller B and the Park controller. Not confirmed."
    source: "Jennifer, 2026-11-14; WeatherTRAK Manage Stations screen, 2026-11-13; Eco Verde assessment page 3 map (sources/controllers/eco-verde-assessment-2026.md)"
  - text: "Every station runs on run times the landscaper sets, scaled for weather (User ET mode), not on automatic weather mode."
    source: "Eco Verde assessment, section 3a"
  - text: "The entry lawn was replaced with artificial turf in September 2026. Meter 3 read zero in its reported hours from September 15 to October 1. The controller itself ran water on September 19, 20, and 22, but entry drip station 6 got no water when turned on (No Flow alarms), and it watered nothing from September 23 to 30."
    source: "Jennifer, 2026-10-07; docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md; WeatherTRAK Entrance reports, 2023-10 to 2026-09 (sources/controllers/weathertrak-usage-entrance-2023-2024.md, sources/controllers/weathertrak-usage-entrance-2024-2025.md, and sources/controllers/weathertrak-usage-entrance-2025-2026.md)"
  - text: "The flow sensor reads a little below the City meter: over 35 billing periods from October 2023 to September 2026 it measured 0.82 to 1.17 times what meter 3 recorded, about 0.95 on average. That gap (about 2,000 gallons a month on average) could be sensor calibration or water lost before the sensor; it is too small and too uneven to call a leak."
    source: "data/controller-usage/A/2023-2024.md, data/controller-usage/A/2024-2025.md, and data/controller-usage/A/2025-2026.md; data/billing-periods/meter-3.md"
  - text: "The lawn spray stations ran at high flow on many nights in October to December 2025 and May 2026 (broken or missing sprayheads, likely). The lawn is now artificial turf."
    source: "WeatherTRAK Entrance reports, 2023-10 to 2026-09 (sources/controllers/weathertrak-usage-entrance-2023-2024.md, sources/controllers/weathertrak-usage-entrance-2024-2025.md, and sources/controllers/weathertrak-usage-entrance-2025-2026.md)"
  - text: "Water flowed with no station on during 7 days from 2024 to 2026, the largest 7,520 gallons on May 9, 2024."
    source: "WeatherTRAK Entrance reports, 2023-10 to 2026-09 (sources/controllers/weathertrak-usage-entrance-2023-2024.md, sources/controllers/weathertrak-usage-entrance-2024-2025.md, and sources/controllers/weathertrak-usage-entrance-2025-2026.md)"
todo: "Settle which zones A4 waters with a walk test: run A4 by hand from WeatherTRAK and walk McKellips from the entry to Crismon and down Crismon; then do the same for park C14 (southeast corner) and C13 (south desert). Meter 4 has been shut off since 2026-10-23, so anything wet during these tests is not controller B. Confirm whether the whole controller or only stations 1 to 3 were turned off in September 2026, and the artificial turf install date. Station flow rates are from the WeatherTRAK learn-flow tests (sources/controllers/weathertrak-learn-flow-entrance-2026-11-13.md). Ask the landscaper to repair entry drip station 6, which got no water in the November 12, 2026 flow test."
---

| Station | Meter | Waters | Type | GPM | Program | Run min | Cycles | Days | Findings | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| A1 | meter-3 | Entry lawn, east side (now artificial turf) | spray | 10.2 | Off |  |  |  | Off since the artificial turf (named "OFF- coverted" and counted Off on the 2026-11-13 inventory). Flow last tested 2026-03-22. Sprayheads put water down faster than the soil takes it, and run at 45 psi on nozzles made for 30 psi, so they mist. | Eco Verde p. 4 and 3d; WeatherTRAK learn flow 2025-11 to 2026-11 |
| A2 | meter-3 | Entry lawn, west side (now artificial turf) | spray | 22.1 | Off |  |  |  | Off since the artificial turf (named "OFF- coverted" and counted Off on the 2026-11-13 inventory). Flow last tested 2026-03-22. Same sprayhead issues as A1. | Eco Verde p. 4 and 3d; WeatherTRAK learn flow 2025-11 to 2026-11 |
| A3 | meter-3 | Entry lawn, west side (now artificial turf) | spray | 16.5 | Off |  |  |  | Off since the artificial turf (named "OFF- coverted" and counted Off on the 2026-11-13 inventory). Flow last tested 2026-03-22. Same sprayhead issues as A1. | Eco Verde p. 4 and 3d; WeatherTRAK learn flow 2025-11 to 2026-11 |
| A4 | meter-3 | Drip along McKellips, west of the northwest homes | drip | 27.9 | B (Auto) | 30.8 | 1 | Auto mode: Sun and Tue the week of Nov 8; Wed the next week | Drip emitters sit at the base of mature trees instead of at the canopy edge. | Eco Verde p. 4 and 3j; WeatherTRAK learn flow 2025-11 to 2026-11; WeatherTRAK Manage Stations screen, 2026-11-13 (screenshot from Jennifer, 2026-11-14) |
| A5 | meter-3 | West wash drip | drip | 26.9 | Off |  |  |  | The valve still works: 26.9 GPM when tested on 2026-11-12. Turned off at the controller. Repair 7 is in this area and was not addressed because it is not being watered. | Eco Verde p. 4 and section 4; WeatherTRAK learn flow 2025-11 to 2026-11 |
| A6 | meter-3 | Entry drip | drip | 0.1 | B (Auto) | 30.8 | 1 | Auto mode: Sun and Tue the week of Nov 8; Wed the next week | Got no water in the flow test of 2026-11-12 (0.1 GPM; 15.1 in March 2026, 17.7 in November 2025). The entry drip is still not being watered. Drip emitters sit at the base of mature trees instead of at the canopy edge. | Eco Verde p. 4 and 3j; WeatherTRAK learn flow 2025-11 to 2026-11; WeatherTRAK Manage Stations screen, 2026-11-13 (screenshot from Jennifer, 2026-11-14) |
