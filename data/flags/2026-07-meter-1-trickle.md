---
id: 2026-07-meter-1-trickle
title: "Meter 1: a small drip between watering cycles"
summary: "Between watering cycles meter 1 should read zero, but on 19 days it showed a steady 3 to 5 gallons an hour. It comes and goes. From October 10 to 14 it grew steadily to about 38 gallons an hour, then stopped completely for about a day and a half (possibly water shut off for a repair). When the water came back on October 16 the original drip of about 5 gallons an hour came back with it. From October 31 to November 4, with no watering at all on meter 1, the drip ran every hour at 6 to 8 gallons an hour, about 160 gallons a day, a bit more than before."
meter: meter-1
zones: []
rule: never_zero
first_seen: 2026-07-03
status: suggested
fixed_on: null
evidence: "Hourly AMI shows a steady flow of about 3 to 5 gallons an hour outside watering cycles on meter-1: every day from 2026-07-03 to 07-14 and again from 09-29 to at least 10-05 never reached zero (19 days). The trickle stopped in between (none in August). About 100 gallons a day while present. From 2026-10-10 1 AM to 10-12 midnight (47 hours, no watering) the hourly reads climbed steadily from 1 to 2 gallons to 17 at 11 PM on 10-11 and 19 at midnight: 307 gallons in all, with 10-11 never reaching zero (smallest hour 5). The climb went on: 23 to 25 an hour on 10-12, 31 to 36 on 10-13, and 37 to 38 on the morning of 10-14 (2,013 gallons from 10-12 1 AM to 10-14 4 PM, 2,339 since 10-10). After 87 gallons at 5 PM on 10-14 every read was zero from 7 PM on 10-14 to 6 AM on 10-16, 36 hours. From 10 AM on 10-16 the off-cycle flow was back at 4 to 6 gallons an hour (average 5.0 over 123 off-cycle hours) and every day from 10-17 to 10-29 never reached zero (10-22 to 10-29: 586 gallons in 106 off-cycle hours under 20 gallons, about 5.5 an hour). From 2026-10-31 1 AM to 11-05 midnight meter-1 ran no watering cycle (rain from 10-30 to 11-01, then no watering through 11-04) and every one of the 120 hourly reads was 5 to 8 gallons (79 reads at 7, 34 at 6): 810 gallons, 6.75 an hour, about 162 a day. This is the cleanest measurement so far because no watering is mixed in."
likely_cause: "Most likely the master valve leak Eco Verde found at the east park master valve (MV2, repair 1) in February 2026. The master valve is always under pressure, so a leak there flows through the meter even when no zone is watering. That the east park connection is meter-1 is inferred from the maps, not confirmed, and the park controller report suggests MV2 may be on meter-2 instead (see What to check next). Nobody has said whether the leak was repaired."
excess_water:
  episodes:
    - { from: 2026-07-03, to: 2026-07-14, gallons: 1200 }
    - { from: 2026-09-29, to: 2026-10-05, gallons: 700 }
    - { from: 2026-10-10, to: 2026-10-14, gallons: 2339 }
    - { from: 2026-10-16, to: 2026-10-21, gallons: 610 }
    - { from: 2026-10-22, to: 2026-10-29, gallons: 586 }
    - { from: 2026-10-31, to: 2026-11-04, gallons: 810 }
  ongoing_gallons_per_year: 59130
  method: "About 100 gallons a day (the off-cycle hourly reads on the drip days average 4.3 gallons an hour and have a median of 4) times the days it was seen: 12 days in July and 7 days from 2026-09-29 to 10-05. 2026-10-10 to 10-14 is the measured off-cycle total from the hourly reads up to 4 PM on 10-14 (2,339 gallons). 2026-10-16 to 10-21 is the off-cycle hourly reads under 20 gallons, summed (610 gallons over 123 hours), and 2026-10-22 to 10-29 the same way (586 gallons over 106 hours). 2026-10-31 to 11-04 is every hourly read summed (810 gallons over 120 hours, no watering on those days). The yearly figure uses the most recent and cleanest measurement, 2026-10-31 to 11-04 with no watering mixed in: 6.75 gallons an hour times 24 is 162 gallons a day, times 365 days is 59,130 gallons, if the drip ran all year at that rate. It was lower earlier (about 100 a day in July, 36,500 a year), so this may overstate a full year if the drip comes and goes as it did in August."
  source: "sources/waterfluence/ami-hourly-meter-1-2026.md; data/usage/meter-1/2026.md"
  confidence: medium
related_events: [2026-02-16]
source: "sources/waterfluence/ami-hourly-meter-1-2026.md (exports of 2026-09-30, 2026-10-06, 2026-10-12, 2026-10-22, 2026-11-02, and 2026-11-05)"
todo: "Ask the landscaper whether the east park master valve leak (Eco Verde repair 1) was repaired, and when. If not, repair it, then check the hourly data for a week of zero overnight reads. Also ask about any valve work around mid-July and late September 2026. Ask whether anyone shut off or repaired anything on meter-1 around 5 PM on 2026-10-14: the rising flow (up to 38 gallons an hour) stopped then and the reads were zero until 2026-10-16. If that was a repair, it fixed the larger leak but not the small drip, which came back at about 5 gallons an hour. Before blaming MV2, confirm which meter feeds it: the WeatherTRAK park controller puts stations 8 and 9 on mainline 2 (MV2) and stations 1, 2, 4, and 14 on mainline 1, and stations 8 and 9 are thought to be on meter-2. If MV2 is on meter-2, this drip on meter-1 needs another explanation (for example the mainline 1 master valve or a fitting before it). The controller's flow sensor cannot see a drip this small (its Other reading for the whole park is about 20 to 110 gallons a day, depending on the month), so it does not help locate it."
---

Raised by hand from the hourly AMI data, ahead of the Phase 3 leak engine. Only hours Waterfluence reported can be checked; see the note in `data/usage/README.md` about missing hours.
