---
id: 2026-07-meter-1-trickle
title: "Meter 1: a small drip between watering cycles"
summary: "Between watering cycles meter 1 should read zero, but on 19 days it showed a steady 3 to 5 gallons an hour. It comes and goes. Small on its own, but it adds up if it is left running."
meter: meter-1
zones: []
rule: never_zero
first_seen: 2026-07-03
status: suggested
fixed_on: null
evidence: "Hourly AMI shows a steady flow of about 3 to 5 gallons an hour outside watering cycles on meter-1: every day from 2026-07-03 to 07-14 and again from 09-29 to at least 10-05 never reached zero (19 days). The trickle stopped in between (none in August). About 100 gallons a day while present."
likely_cause: "A valve or fitting on meter-1 that weeps when closed. Small in volume, but it comes and goes, which fits a valve that sometimes does not seat. Not confirmed."
excess_water:
  episodes:
    - { from: 2026-07-03, to: 2026-07-14, gallons: 1200 }
    - { from: 2026-09-29, to: 2026-10-05, gallons: 700 }
  ongoing_gallons_per_year: 36500
  method: "About 100 gallons a day (the off-cycle hourly reads on the drip days average 4.3 gallons an hour and have a median of 4) times the days it was seen: 12 days in July and 7 days from 2026-09-29 to 10-05. The yearly figure is 100 gallons a day for 365 days, if the drip ran all year."
  source: "sources/waterfluence/ami-hourly-meter-1-2026.md; data/usage/meter-1/2026.md"
  confidence: medium
related_events: []
source: "sources/waterfluence/ami-hourly-meter-1-2026.md (exports of 2026-09-30 and 2026-10-06)"
todo: "Ask the landscaper to check meter-1 valves for weeping, especially any repaired or adjusted around mid-July and late September 2026."
---

Raised by hand from the hourly AMI data, ahead of the Phase 3 leak engine. Only hours Waterfluence reported can be checked; see the note in `data/usage/README.md` about missing hours.
