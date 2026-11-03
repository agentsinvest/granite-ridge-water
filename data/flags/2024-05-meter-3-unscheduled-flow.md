---
id: 2024-05-meter-3-unscheduled-flow
title: "Meter 3 (entrance): water ran with no valve open on 7 days"
summary: "The entrance controller's flow sensor caught water flowing while no station was on, on 7 days since 2023. The biggest was May 9, 2024, about 7,500 gallons starting before 6 AM. Some of the others were in the daytime and may have been the crew working on the system, including during the artificial turf work in September 2026. Together it is about 13,400 gallons over three years, so this is small, but it shows the controller can see this kind of problem."
meter: meter-3
zones: []
rule: manual
first_seen: 2024-05-09
status: suggested
fixed_on: null
evidence: "WeatherTRAK Entrance controller, Other gallons (flow with no station scheduled or run by hand) and Leak or Extended Leak alerts on mainline 1 (flow over the 15 GPM limit with only the master valve open). 2024-05-09: 7,520 gallons; alerts from 5:41 AM at 29 to 33 GPM, an Extended Leak alert lasting 17 hours. From 2024-05-09 to 05-21 the controller also flagged high flow on station 5, the west wash drip (22 to 24 GPM). 2025-01-13 to 01-15: 1,801 gallons (802, 270, 729), in short daytime bursts between 7 AM and 3:30 PM at 17 to 24 GPM. 2025-11-03: 1,378 gallons; alerts from 6:09 AM at 22 GPM. 2026-09-12: 2,356 gallons from 10:38 AM at 22 GPM, and 2026-09-14: 312 gallons at 3:50 PM, during the artificial turf work. On ordinary days Other is 0 to 7 gallons (median 1.8). Short leak alerts (1 to 8 minutes) on 9 more days used 16 to 190 gallons each (2023-10-07, 10-09, 2024-02-06, 04-05, 04-10, 04-19, 2025-10-15, 10-20, and 2026-01-22)."
likely_cause: "Not known. Daytime bursts are often the crew using a quick coupler or flushing lines after a repair. The early-morning events on 2024-05-09 and 2025-11-03 look more like a break or a valve that stuck open; the 2024 one came with high flow on the west wash drip (station 5), which is now turned off, and Eco Verde noted an unrepaired problem in that area (repair 7)."
excess_water:
  episodes:
    - { from: 2024-05-09, to: 2024-05-09, gallons: 7520 }
    - { from: 2025-01-13, to: 2025-01-15, gallons: 1801 }
    - { from: 2025-11-03, to: 2025-11-03, gallons: 1378 }
    - { from: 2026-09-12, to: 2026-09-12, gallons: 2356 }
    - { from: 2026-09-14, to: 2026-09-14, gallons: 312 }
  ongoing_gallons_per_year: null
  method: "The controller's Other gallons on each day, as measured by its flow sensor. The few gallons of Other on ordinary days are not subtracted. Some of this may have been the crew working, not waste."
  source: "data/controller-usage/A/2023-2024.md, data/controller-usage/A/2024-2025.md, and data/controller-usage/A/2025-2026.md; alerts in sources/controllers/weathertrak-usage-entrance-2023-2024.md, sources/controllers/weathertrak-usage-entrance-2024-2025.md, and sources/controllers/weathertrak-usage-entrance-2025-2026.md"
  confidence: low
related_events: [2024-05-09, 2025-11-03, 2026-09-01]
source: "sources/controllers/weathertrak-usage-entrance-2023-2024.md, sources/controllers/weathertrak-usage-entrance-2024-2025.md, and sources/controllers/weathertrak-usage-entrance-2025-2026.md"
todo: "Ask the landscaper what happened on the mornings of 2024-05-09 and 2025-11-03, and whether the January 2025 and September 2026 flows were crew work. Ask them to keep the controller's leak alerts on, and to tell the board when an Extended Leak alert is not their own work."
---

Raised by hand from the WeatherTRAK Entrance controller reports, 2023-10-01 to 2026-09-30. The controller works in Pacific time.
