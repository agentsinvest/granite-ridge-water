---
id: 2026-09-meter-4-step-change
title: "Meter 4 (controller B, desert interior strip): water keeps running for hours after the night cycle"
summary: "Meter 4 normally waters about 370 gallons in a short cycle around 1 to 2 AM on Sunday, Tuesday, Thursday, and Friday. On 11 days from September 18 to October 23 the water kept running for hours after that cycle, from 2,700 to 12,600 gallons in a day, about 70,000 extra gallons in all. It happened both before and after the valve solenoids were replaced on September 25, so that repair did not fix it. Meter 4 has used no water at all since about 2 PM on October 23, including its normal watering days, so it looks like it has been shut off."
meter: meter-4
zones: []
rule: manual
first_seen: 2026-09-18
status: open
fixed_on: null
evidence: "Meter-4 normally runs one cycle of about 250 to 385 gallons around 1 to 2 AM on Sunday, Tuesday, Thursday, and Friday (372 gallons is the median watering day, 2026-07-03 to 09-07). Days the cycle kept running: 2026-09-18 (Fri, 2 AM to about 7 PM, 12,626 gallons), 2026-09-22 (Tue, 2 AM to about 10 AM, 8,759 gallons), 2026-10-02 to 10-04 (18,164 gallons: from 2 AM Fri 10-02 to at least 9 PM Sat 10-03 at a steady 300 to 311 gallons an hour, about 44 hours; the 10 PM to midnight reads are missing and 1 AM on 10-04 read zero; then the Sunday 2 AM cycle stuck on again until about 4 PM, about 14 more hours), 2026-10-11 (Sun, 2 AM to 5 AM, 2,749 gallons during 0.39 in of rain, against a usual 250 to 300), 2026-10-15 (Thu, 1 AM to about 1 PM, 8,010 gallons), 2026-10-16 (Fri, two runs 1 to 3 AM and 6 to 8 AM, 1,728 gallons), 2026-10-18 (Sun, 1 AM to about 11 AM, 6,222 gallons), 2026-10-20 (Tue, 1 AM to about 11 AM, 6,805 gallons), and 2026-10-23 (Fri, 1 AM to about 1 PM, 9,044 gallons). 11 days, 74,107 gallons. The average flow during a run went up over time: about 300 gallons an hour on 10-02 to 10-04, about 570 to 620 on 10-15 to 10-20, about 700 on 10-23. The 10-02 to 10-04 reads vary hour to hour, so that is real flow; on the other days several hours repeat one identical value, which means Waterfluence filled in missed reads, so the daily totals are exact but the hourly split and stop times are approximate. The solenoids were replaced on 2026-09-25 (Fri); that day used 545 gallons, a normal 1 AM cycle (386) plus 159 gallons at 11 AM to noon, likely the repair being tested. The next watering days (09-27, 09-29, 10-01) were normal, then it ran on again from 10-02. 2026-09-11 (602 gallons) was a normal 1 AM cycle (385) plus 217 gallons at 2 to 3 PM, a daytime use like the repair test on 09-25, not a run-on. From about 2 PM on 2026-10-23 to the last read (10-30 midnight) every hour read zero, including the watering days 10-25, 10-27, and 10-29. 2026-10-22 has no reads."
likely_cause: "A valve on controller B that does not fully close after the night cycle (a stuck or failing valve, or a controller fault keeping the valve open), shut off later by hand or by the controller. It is not a leak in a pipe: the water goes out through the irrigation as if the zone were still watering. Replacing the solenoids on 2026-09-25 did not stop it, which points to the valve itself (diaphragm, debris, or the flow control), the wiring, or the controller rather than the solenoid. Not confirmed."
excess_water:
  episodes:
    - { from: 2026-09-18, to: 2026-09-18, gallons: 12254 }
    - { from: 2026-09-22, to: 2026-09-22, gallons: 8387 }
    - { from: 2026-10-02, to: 2026-10-04, gallons: 17420 }
    - { from: 2026-10-11, to: 2026-10-11, gallons: 2377 }
    - { from: 2026-10-15, to: 2026-10-15, gallons: 7638 }
    - { from: 2026-10-16, to: 2026-10-16, gallons: 1356 }
    - { from: 2026-10-18, to: 2026-10-18, gallons: 5850 }
    - { from: 2026-10-20, to: 2026-10-20, gallons: 6433 }
    - { from: 2026-10-23, to: 2026-10-23, gallons: 8672 }
  ongoing_gallons_per_year: null
  method: "Each episode's daily totals minus one normal night cycle (372 gallons, the median watering day from 2026-07-03 to 09-07) for each scheduled watering day in it. 2026-09-18: 12,626 - 372. 2026-09-22: 8,759 - 372. 2026-10-02 to 10-04: 18,164 - 744 (two watering days, Friday and Sunday). 2026-10-11: 2,749 - 372. 2026-10-15: 8,010 - 372. 2026-10-16: 1,728 - 372. 2026-10-18: 6,222 - 372. 2026-10-20: 6,805 - 372. 2026-10-23: 9,044 - 372. Together about 70,400 gallons. No yearly figure: it is not a steady flow, and it happens on random watering nights."
  source: "data/usage/meter-4/2026.md"
  confidence: medium
related_events: [2026-02-16, 2026-09-18, 2026-09-22, 2026-09-25, 2026-10-23]
source: "data/usage/meter-4/2026.md; sources/waterfluence/ami-hourly-meter-4-2026.md (exports of 2026-09-30, 2026-10-06, 2026-10-12, 2026-10-22, and 2026-11-02); sources/waterfluence/daily-chart-2026-10-06.md; schedule (Sun, Tue, Thu, Fri, about 372 gallons a run) and the 2026-09-25 solenoid replacement (landscaper's September report) from Jennifer, 2026-11-02"
todo: "Confirm with the landscaper: (1) whether meter-4 or controller B was shut off on 2026-10-23 and is still off, since it has used nothing since about 2 PM that day; if it is off on purpose, say so in events.md and decide how the interior strip gets water until the valve is fixed. (2) Which valve runs at 1 to 2 AM and which valve stays open. (3) The date of the first repair: Jennifer has it as Tuesday 2026-09-22, but the 8,759-gallon run on 09-22 started at 2 AM that morning, and 348 gallons ran at 9 AM on Monday 09-21, which looks like a daytime test; if the repair was on 09-21, the run started the next night. (4) The 2026-09-18 run stopped about 7 PM that day in the hourly data; Jennifer heard it was turned off the next day. (5) Who shut the water off on 10-04 (about 4 PM), 10-15 (about 1 PM), 10-18 and 10-20 (about 11 AM), and 10-23 (about 1 PM), or whether the controller did. (6) Whether the February 2026 Eco Verde findings on controller B (broken lateral line in zone 3, valve at B4 not opening, repairs 5 and 6) were repaired, and whether B4 is the valve that stays open."
---

Raised by hand from the September and October 2026 AMI data, ahead of the Phase 3 leak engine. Confirmed as a real problem by Jennifer on 2026-11-02 (status open).

Earlier versions of this flag said the 2026-10-02 to 10-04 run was about 62 hours straight. The hourly reads show a zero at 1 AM on 10-04, so it was about 44 hours, a stop sometime between 9 PM on 10-03 and 1 AM on 10-04, and then the Sunday 2 AM cycle stuck on for about 14 more hours.

Fall 2024 had a similar jump on this meter (130 thousand gallons for the 2024-11-13 to 2024-12-12 read period against a usual 30 to 50). That may be the same problem or overseed watering.
