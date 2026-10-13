---
id: 2026-09-meter-4-step-change
title: "Meter 4: a valve stayed open three times since mid-September, then a heavy night in the rain"
summary: "Meter 4 usually uses a few hundred gallons a night. Three times since September 18 the water did not shut off after the 2 AM cycle, once for about 62 hours straight. That is about 38,000 extra gallons, more than a normal month on this meter. On October 11, during a rain, it used about 2,750 gallons in four early-morning hours, several times a normal night."
meter: meter-4
zones: []
rule: manual
first_seen: 2026-09-18
status: suggested
fixed_on: null
evidence: "Meter-4 normally runs one cycle of about 250 to 385 gallons around 1 to 2 AM (median daily use 75 gallons, 2026-07-03 to 09-07). Three times since then the 2 AM cycle did not shut off: 2026-09-18 (flow until about 7 PM, 12,626 gallons that day), 2026-09-22 (flow until about 10 AM, 8,759 gallons), and 2026-10-02 2 AM to 10-04 about 4 PM (about 62 hours at a steady 300 to 311 gallons an hour, 18,164 gallons). Together about 39,500 gallons. Flow stopped abruptly each time and was zero all day on 2026-10-05. Then 2026-10-11 2 AM to 5 AM: 2,749 gallons (391.8, 783.5, 1,175.3, 398) against a usual 250 to 300 for a night in early October, on a day with 0.39 in of rain; Jennifer saw it watering during the rain. The 10 PM to midnight reads before it are missing and the first three hours rise in equal steps, so Waterfluence filled them in; the 4-hour total is exact, the hour-by-hour split is not."
likely_cause: "A valve on meter-4 that does not fully close after the 2 AM cycle (stuck or failing valve or solenoid), shut off by hand or by the controller later. Not confirmed."
excess_water:
  episodes:
    - { from: 2026-09-18, to: 2026-09-18, gallons: 12253 }
    - { from: 2026-09-22, to: 2026-09-22, gallons: 8387 }
    - { from: 2026-10-02, to: 2026-10-04, gallons: 17792 }
    - { from: 2026-10-11, to: 2026-10-11, gallons: 2377 }
  ongoing_gallons_per_year: null
  method: "Each episode's daily totals minus one normal 2 AM cycle (372 gallons, the median watering day from 2026-07-03 to 09-07). 2026-09-18: 12,626 - 372. 2026-09-22: 8,759 - 372. 2026-10-02 to 10-04: 18,164 - 372. 2026-10-11: 2,749 - 372. Together about 40,800 gallons. No yearly figure: it is not a steady flow."
  source: "data/usage/meter-4/2026.md"
  confidence: medium
related_events: [2026-02-16]
source: "data/usage/meter-4/2026.md; sources/waterfluence/ami-hourly-meter-4-2026.md (exports of 2026-09-30, 2026-10-06, and 2026-10-12); sources/waterfluence/daily-chart-2026-10-06.md"
todo: "Ask the landscaper whether they shut water off on meter-4 on 2026-09-18, 09-22, and 10-04 (about 4 PM), what ran on meter-4 from 2 to 5 AM on 2026-10-11 (controller B is not a smart controller, confirmed by Jennifer 2026-10-13, so it does not skip for rain unless someone turns it off), why that night used several times the usual gallons, and which valve runs at 2 AM. Have that valve inspected. Meter-4 is controller B (interior strip, Crismon frontage, northeast corner); in February 2026 Eco Verde found a broken lateral line in zone 3 and a valve at B4 that the controller did not open (repairs 5 and 6). Ask whether those were repaired and whether the 2 AM valve is one of them."
---

Raised by hand from the September and October 2026 AMI data, ahead of the Phase 3 leak engine.

The 2026-10-02 to 10-04 event is hourly reads that vary slightly hour to hour (300 to 311 gallons), so it is real flow, not filled-in hours. On 2026-09-18 and 09-22 several hours repeat one identical value, which means Waterfluence filled in missed reads; daily totals are still exact.

Fall 2024 had a similar jump on this meter (130 thousand gallons for the 2024-11-13 to 2024-12-12 read period against a usual 30 to 50). That may be the same problem or overseed watering.
