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
  - text: "The entry lawn was replaced with artificial turf in September 2026. Meter 3 read zero from September 15 to October 1, including the drip nights."
    source: "Jennifer, 2026-10-07; docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md"
todo: "Confirm whether the whole controller or only stations 1 to 3 were turned off in September 2026, and the artificial turf install date. Station flow rates (GPM) are not in the report."
---

| Station | Meter | Waters | Type | GPM | Program | Run min | Cycles | Days | Findings | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| A1 | meter-3 | Entry lawn, east side (now artificial turf) | spray | | A (lawn) | 4 | 2 | Sun, Tue, Thu, Fri | Sprayheads put water down faster than the soil takes it, and run at 45 psi on nozzles made for 30 psi, so they mist. | Eco Verde p. 4 and 3d |
| A2 | meter-3 | Entry lawn, west side (now artificial turf) | spray | | A (lawn) | 5 | 2 | Sun, Tue, Thu, Fri | Same sprayhead issues as A1. | Eco Verde p. 4 and 3d |
| A3 | meter-3 | Entry lawn, west side (now artificial turf) | spray | | A (lawn) | 5 | 2 | Sun, Tue, Thu, Fri | Same sprayhead issues as A1. | Eco Verde p. 4 and 3d |
| A4 | meter-3 | Drip along McKellips, west of the northwest homes | drip | | B (drip) | 50 | 1 | Sun, Thu | Drip emitters sit at the base of mature trees instead of at the canopy edge. | Eco Verde p. 4 and 3j |
| A5 | meter-3 | West wash drip | drip | | Off | | | | Turned off at the controller. Repair 7 is in this area and was not addressed because it is not being watered. | Eco Verde p. 4 and section 4 |
| A6 | meter-3 | Entry drip | drip | | B (drip) | 50 | 1 | Sun, Thu | Drip emitters sit at the base of mature trees instead of at the canopy edge. | Eco Verde p. 4 and 3j |
