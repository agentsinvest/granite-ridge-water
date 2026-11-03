---
id: 2026-08-meter-1-step-change
title: "Meter 1: late-summer use up 16% a day on last year, from more scheduled watering"
summary: "Meter 1 used more water a day in the bill ending September 14 than in the same bill last year: about 12,100 gallons a day against 10,400. The park controller's own flow sensor shows why: it ran its stations about 9% more minutes a day than a year earlier, even though the weather called for slightly less water. Water flowing with no station on did not change, so this is extra scheduled watering, not a leak."
meter: meter-1
zones: []
rule: step_change
first_seen: 2026-09-14
status: suggested
fixed_on: null
evidence: "Meter-1 used 399,000 gallons in the read period 2026-08-13 to 09-14 (33 days, about 12,091 a day) against 313,000 in 2025-08-14 to 09-12 (30 days, about 10,433 a day): up 16% a day. The earlier 27% figure compared periods of different lengths. The period before (ending 2026-08-12) was 374,000 against 427,000 a year earlier, so this is a late-summer increase, not a steady rise. The WeatherTRAK Park controller, which measures meters 1 and 2 together, agrees: 641,289 gallons over the 2026 period against 502,542 over the 2025 period (19,433 against 16,751 a day, up 16%); 10,998 station minutes against 9,161 (333 against 305 a day, up 9%); reference ET 8.6 against 8.1 inches (0.26 against 0.27 a day, slightly lower); flow with no station on (Other) 818 against 663 gallons, about 25 and 22 a day, unchanged. Average flow while watering rose from 54.7 to 58.2 gallons a minute; part of that is drip station C15 running at about double its normal flow from 2026-08-25 (see that flag)."
likely_cause: "More scheduled watering: longer run times or more days on the park controller in late August and early September 2026 than a year earlier, possibly early overseed preparation. The controller runs on run times the landscaper sets, scaled for weather (User ET mode), so a person's setting most likely changed. Not a leak: water flowing with no station on did not change."
excess_water:
  episodes:
    - { from: 2026-08-13, to: 2026-09-14, gallons: 54700 }
  ongoing_gallons_per_year: null
  method: "Gallons a day in the read period ending 2026-09-14 (399,000 over 33 days) minus gallons a day in the same period a year earlier (313,000 over 30 days), times 33 days. This is extra scheduled watering over last year, not necessarily waste: whether the lawn needed it is a question for the water budget."
  source: "data/billing-periods/meter-1.md; data/controller-usage/C/2024-2025.md and data/controller-usage/C/2025-2026.md"
  confidence: medium
related_events: []
source: "data/billing-periods/meter-1.md; data/controller-usage/C/2024-2025.md and data/controller-usage/C/2025-2026.md"
todo: "Ask the landscaper what changed on the park controller in late August 2026 (run times, water days, seasonal adjust, or an early overseed program). Compare against the park controller settings report once we have it."
---
