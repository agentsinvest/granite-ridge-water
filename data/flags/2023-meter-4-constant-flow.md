---
id: 2023-meter-4-constant-flow
title: "Meter 4: extra water all year in 2023 and 2024 (stopped late 2024)"
summary: "For almost two years meter 4 used about 20,000 more gallons every month than it does now, summer and winter alike. That stopped around December 2024, soon after the City replaced the meter. It looks fixed, but nobody has confirmed what changed."
meter: meter-4
zones: []
rule: winter_summer_ratio
first_seen: 2023-03-01
status: suggested
fixed_on: null
evidence: "From the first readable bills in 2023 through November 2024, meter-4 used 45,000 to 61,000 gallons every month with almost no seasonal change (for example January 2024 61,000; June 2024 46,000; October 2024 47,000). Desert landscape should use far less in winter. After a 130,000-gallon read period ending December 2024, the winter baseline fell to about 30,000 gallons a month. About 20,000 gallons a month (roughly 240,000 a year) of year-round flow stopped around December 2024, after the meter was replaced in October 2024."
likely_cause: "A continuous leak or a zone left running that was found and fixed around late 2024, or a change in what meter-4 waters. Not confirmed."
excess_water:
  episodes:
    - { from: 2023-09-15, to: 2024-11-12, gallons: 271000 }
  ongoing_gallons_per_year: null
  method: "Each read period from 2023-09-15 to 2024-11-12 (13 periods) minus 30,000 gallons, meter-4's usual monthly use since early 2025. Earlier 2023 months and the 130,000-gallon period ending 2024-12-12 are left out."
  source: "data/billing-periods/meter-4.md"
  confidence: low
related_events: []
source: "data/bills/meter-4/ (City bills read by OCR, 2023 to 2024); data/billing-periods/meter-4.md"
todo: "Ask the landscaper whether a leak was repaired or a zone changed on meter-4 in late 2024. If so, set status to fixed with that date."
---

At 2024 rates (block 1 about $4.31 per thousand gallons, plus taxes) the year-round flow cost roughly $1,100 a year.
