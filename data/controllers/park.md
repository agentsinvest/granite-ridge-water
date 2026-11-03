---
id: C
name: Park
full_name: "Park controller"
model: "WeatherTRAK ETPRO3 smart controller"
serial_last4: "6637"
meters: [meter-1, meter-2]
has_flow_sensor: true
source: "Eco Verde irrigation assessment, 2026, page 5 (station flow rates, settings of 2026-03-29) and sections 3a, 3g, 3j, and 4 (sources/controllers/eco-verde-assessment-2026.md); station-to-meter split from docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md (medium confidence); zone names from data/map.md"
confidence: medium
findings:
  - text: "Leaking master valve at the east side of the park (MV2, repair 1)."
    source: "Eco Verde assessment, section 4"
  - text: "Worn rotor seals spraying water at the base in the park lawn (repairs 2, 3, and 4). Which stations is not printed."
    source: "Eco Verde assessment, section 4"
  - text: "Some rotors are not nozzled to put down water at the same rate, some retainer screws are turned in too far, and some rotors spray onto pavement."
    source: "Eco Verde assessment, section 3g"
  - text: "Every station runs on run times the landscaper sets, scaled for weather (User ET mode). The controller lists every station as a spray head, though the lawn uses rotors and 13 to 15 are drip; that matters only in automatic mode."
    source: "Eco Verde assessment, sections 3a and page 5"
  - text: "The wireless rain sensor should be moved to catch more rain."
    source: "Eco Verde assessment, section 4"
  - text: "The flow sensor agrees with the City meters: over 23 billing periods from October 2024 to September 2026 it measured 0.95 to 1.13 times what meters 1 and 2 recorded together (about 1.04 on average; the two meters are read within 3 days of each other), so nearly all water through those two meters passes the sensor."
    source: "data/controller-usage/C/2024-2025.md and data/controller-usage/C/2025-2026.md; data/billing-periods/meter-1.md and data/billing-periods/meter-2.md"
  - text: "Drip station C13 (south and southwest desert drip) ran low flow on 200 nights from October 2024 to May 2026, about half its expected flow. Drip station C15 (north side) ran at about double its normal flow from late August 2026."
    source: "WeatherTRAK Park reports, 2024-10 to 2026-09 (sources/controllers/weathertrak-usage-park-2024-2025.md and sources/controllers/weathertrak-usage-park-2025-2026.md)"
  - text: "The Mainline Break alarm went off 19 times in summer 2025 and 2026, mostly Sunday nights, when drip station C14 runs together with a lawn station. It looks like overlapping stations, not a broken pipe."
    source: "WeatherTRAK Park reports, 2024-10 to 2026-09 (sources/controllers/weathertrak-usage-park-2024-2025.md and sources/controllers/weathertrak-usage-park-2025-2026.md)"
  - text: "Valve shorts kept single lawn stations from watering for days at a time: C12 for 14 days in May 2025, C9 in October 2025, C7 for 12 days in April and May 2026. Each was cleared by landscaper staff."
    source: "WeatherTRAK Park reports, 2024-10 to 2026-09 (sources/controllers/weathertrak-usage-park-2024-2025.md and sources/controllers/weathertrak-usage-park-2025-2026.md)"
  - text: "Mainline 1 carries stations 1, 2, 4, and 14; mainline 2 (master valve MV2) carries stations 8 and 9."
    source: "WeatherTRAK Park reports, 2024-10 to 2026-09 (sources/controllers/weathertrak-usage-park-2024-2025.md and sources/controllers/weathertrak-usage-park-2025-2026.md) (alert descriptions)"
todo: "Need the other 8 pages of the park settings report: programs, days, start times, run times, weather adjustment by month, overseed program, and the program that runs every night at about 10 PM. Confirm which stations are on meter 1 and which on meter 2."
---

| Station | Meter | Waters | Type | GPM | Program | Run min | Cycles | Days | Findings | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| C1 | meter-1 | Park lawn, northeast along the sidewalk | rotor | 61 | | | | | | Eco Verde p. 5 |
| C2 | meter-1 | Park lawn, southeast along the curb | rotor | 58 | | | | | | Eco Verde p. 5 |
| C3 | meter-1 | Park lawn, southeast middle (south) | rotor | 41 | | | | | | Eco Verde p. 5 |
| C4 | meter-1 | Park lawn, southeast middle (center) | rotor | 71 | | | | | | Eco Verde p. 5 |
| C5 | meter-1 | Park lawn, northeast middle (center) | rotor | 74 | | | | | | Eco Verde p. 5 |
| C6 | meter-1 | Park lawn, northeast middle (north) | rotor | 67 | | | | | | Eco Verde p. 5 |
| C7 | meter-1 | Park lawn, north sidewalk (center) | rotor | 63 | | | | | Rotor nozzles do not match: all half circles, but sizes 8, 15, 8, 6, 10, 10, and 10, so some spots get much more water than others. | Eco Verde p. 5 and 3g |
| C8 | meter-2 | Park lawn, west of the playground | rotor | 61 | | | | | | Eco Verde p. 5 |
| C9 | meter-2 | Park lawn, along the curb by the ramada | rotor | 57 | | | | | | Eco Verde p. 5 |
| C10 | meter-2 | Park lawn, northwest center | rotor | 54 | | | | | | Eco Verde p. 5 |
| C11 | meter-2 | Park lawn, southwest center | rotor | 59 | | | | | | Eco Verde p. 5 |
| C12 | meter-2 | Park lawn, southwest along the curb | rotor | 50 | | | | | | Eco Verde p. 5 |
| C13 | meter-2 | South and southwest desert drip | drip | 41 | | | | | Drip emitters sit at the base of mature trees instead of at the canopy edge. | Eco Verde p. 5 and 3j |
| C14 | meter-1 | Park east and south edges, and the southeast corner drip | drip | 28 | | | | | Drip emitters sit at the base of mature trees. Repair 8 is in this zone and was not addressed because it is in a protected area. | Eco Verde p. 5, 3j, and section 4 |
| C15 | meter-1 | Drip on the north side of the park | drip | 11 | | | | | Drip emitters sit at the base of mature trees. | Eco Verde p. 5 and 3j |
