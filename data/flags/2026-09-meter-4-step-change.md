---
id: 2026-09-meter-4-step-change
meter: meter-4
zones: []
rule: manual
first_seen: 2026-09-18
status: suggested
fixed_on: null
evidence: "Meter-4 normally runs one cycle of about 250 to 385 gallons around 1 to 2 AM (median daily use 75 gallons, 2026-07-03 to 09-07). Three times since then the 2 AM cycle did not shut off: 2026-09-18 (flow until about 7 PM, 12,626 gallons that day), 2026-09-22 (flow until about 10 AM, 8,759 gallons), and 2026-10-02 2 AM to 10-04 about 4 PM (about 62 hours at a steady 300 to 311 gallons an hour, 18,164 gallons). Together about 39,500 gallons. Flow stopped abruptly each time and was zero all day on 2026-10-05."
likely_cause: "A valve on meter-4 that does not fully close after the 2 AM cycle (stuck or failing valve or solenoid), shut off by hand or by the controller later. Not confirmed."
related_events: []
source: "data/usage/meter-4/2026.md; sources/waterfluence/ami-hourly-meter-4-2026.md (exports of 2026-09-30 and 2026-10-06); sources/waterfluence/daily-chart-2026-10-06.md"
todo: "Ask the landscaper whether they shut water off on meter-4 on 2026-09-18, 09-22, and 10-04 (about 4 PM), and which valve runs at 2 AM. Have that valve inspected. Confirm which area meter-4 serves."
---

Raised by hand from the September and October 2026 AMI data, ahead of the Phase 3 leak engine.

The 2026-10-02 to 10-04 event is hourly reads that vary slightly hour to hour (300 to 311 gallons), so it is real flow, not filled-in hours. On 2026-09-18 and 09-22 several hours repeat one identical value, which means Waterfluence filled in missed reads; daily totals are still exact.

Fall 2024 had a similar jump on this meter (130 thousand gallons for the 2024-11-13 to 2024-12-12 read period against a usual 30 to 50). That may be the same problem or overseed watering.
