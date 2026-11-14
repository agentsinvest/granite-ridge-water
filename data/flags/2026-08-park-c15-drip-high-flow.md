---
id: 2026-08-park-c15-drip-high-flow
title: "Meter 1 (park north drip, station C15): running at about double its normal flow since late August"
summary: "The park controller's flow sensor shows the drip on the north side of the park running at 21 to 22 gallons a minute on every watering night from August 28 to September 29, against an alarm limit of 15 and a measured normal of 11. Drip that suddenly uses twice the water usually means a broken drip line or emitters blown off, so water is running onto the ground instead of to the plants. It was still happening on the last night in the report."
meter: meter-1
zones: [C15]
rule: manual
first_seen: 2026-08-25
status: suggested
fixed_on: null
evidence: "The WeatherTRAK Park controller raised a Station High Flow alert on station 15 on 13 nights: 2026-08-25 (16 GPM), then 21 to 22 GPM on 08-28, 09-04, 09-08, 09-11, 09-13, 09-15, 09-20, 09-22, 09-25, 09-27, 09-28 (2 PM), and 09-29, each against a limit of 15 GPM. Every alert was cleared by the controller, not by a person. Eco Verde recorded station 15's learned flow as 11 GPM in March 2026. Station 15 had no high-flow alerts in the two years before 2026-08-25. The report ends 2026-09-30. The park Runtime History Report of 2026-11-13 shows what happened next: from 2026-09-04 to 10-06 station 15 was cut to 4 minutes a night (it had run 38 to 58), which kept the loss small. From 2026-10-09 it ran 30 to 49 minutes again, and on the four nights only the drips ran (10-09, 10-16, 10-18, 10-20) the measured water implies 12 to 14 GPM for station 15, close to normal. Its flow test on 2026-11-12 learned 11.4 GPM. So it looks repaired between 10-06 and 10-09."
likely_cause: "A broken or disconnected drip line, or emitters or end caps blown off, on the north side drip. Not confirmed."
excess_water: null
related_events: [2026-08-25]
source: "sources/controllers/weathertrak-usage-park-2025-2026.md (alert list); sources/controllers/weathertrak-runtime-history-park-2026.md and sources/controllers/weathertrak-learn-flow-park-2026-11-13.md; Eco Verde assessment page 5 (sources/controllers/eco-verde-assessment-2026.md)"
todo: "Looks fixed between 2026-10-06 and 10-09 (see evidence). Confirm with the landscaper what was repaired and when, then set status fixed with that date. Earlier note: Ask the landscaper to walk the north side drip (station C15) while it runs and fix any broken line or missing emitters, then check that the controller stops raising high-flow alerts. To put a gallon number on it, we need station 15's run minutes per night from the park controller settings report (about 10 extra gallons a minute for every minute it runs)."
---

Raised by hand from the WeatherTRAK Park controller report for 2025-10-01 to 2026-09-30.
