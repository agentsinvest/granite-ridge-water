---
id: 2026-08-meter-1-step-change
title: "Meter 1: late-summer use up 27% on last year"
summary: "Meter 1 used 86,000 more gallons in the bill ending September 14 than in the same bill last year. It may be a schedule change rather than a leak, but nobody has confirmed why."
meter: meter-1
zones: []
rule: step_change
first_seen: 2026-09-14
status: suggested
fixed_on: null
evidence: "Meter-1 used 399,000 gallons in the read period ending 2026-09-14, the highest for that period in three years (313,000 in 2025, 286,000 in 2024): up 27% on last year. The period before (ending 2026-08-12) was 374,000 against 427,000 a year earlier, so this is a late-summer increase, not a steady rise."
likely_cause: "A schedule or seasonal-adjust increase in late August and early September, or early overseed preparation. Not confirmed."
excess_water:
  episodes:
    - { from: 2026-08-13, to: 2026-09-14, gallons: 86000 }
  ongoing_gallons_per_year: null
  method: "Usage in the read period ending 2026-09-14 (399,000 gallons) minus the same period a year earlier (313,000). Not all of this is necessarily waste; it is the increase over last year."
  source: "data/billing-periods/meter-1.md"
  confidence: low
related_events: []
source: "data/billing-periods/meter-1.md"
todo: "Compare meter-1's controller settings for late August 2026 with the same time in 2025."
---
