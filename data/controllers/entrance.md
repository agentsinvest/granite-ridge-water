---
id: A
name: Entrance
full_name: "Entrance controller"
model: "WeatherTRAK LC+ smart controller"
serial_last4: "6094"
meters: [meter-3]
has_flow_sensor: true
source: "Eco Verde irrigation assessment, 2026, page 4 (controller settings of 2026-03-29) and section 3a (sources/controllers/eco-verde-assessment-2026.md); HydroPoint reports of 2025-04-04 (sources/controllers/hydropoint-reports-2025-04-04.md); zone names from data/map.md"
confidence: high
findings:
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
todo: "Confirm whether the whole controller or only stations 1 to 3 were turned off in September 2026, and the artificial turf install date. Station flow rates (GPM) are not in the report: the Eco Verde PDF has only page 4 of the 7-page entrance settings report. Ask Eco Verde or the landscaper for pages 1 to 3 and 5 to 7."
---

| Station | Meter | Waters | Type | GPM | Program | Run min | Cycles | Days | Findings | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| A1 | meter-3 | Entry lawn, east side (now artificial turf) | spray | | A (lawn) | 4 | 2 | Sun, Tue, Thu, Fri | Sprayheads put water down faster than the soil takes it, and run at 45 psi on nozzles made for 30 psi, so they mist. | Eco Verde p. 4 and 3d |
| A2 | meter-3 | Entry lawn, west side (now artificial turf) | spray | | A (lawn) | 5 | 2 | Sun, Tue, Thu, Fri | Same sprayhead issues as A1. | Eco Verde p. 4 and 3d |
| A3 | meter-3 | Entry lawn, west side (now artificial turf) | spray | | A (lawn) | 5 | 2 | Sun, Tue, Thu, Fri | Same sprayhead issues as A1. | Eco Verde p. 4 and 3d |
| A4 | meter-3 | Drip along McKellips, west of the northwest homes | drip | | B (drip) | 50 | 1 | Sun, Thu | Drip emitters sit at the base of mature trees instead of at the canopy edge. | Eco Verde p. 4 and 3j |
| A5 | meter-3 | West wash drip | drip | | Off | | | | Turned off at the controller. Repair 7 is in this area and was not addressed because it is not being watered. | Eco Verde p. 4 and section 4 |
| A6 | meter-3 | Entry drip | drip | | B (drip) | 50 | 1 | Sun, Thu | Drip emitters sit at the base of mature trees instead of at the canopy edge. | Eco Verde p. 4 and 3j |
