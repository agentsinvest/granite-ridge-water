---
annual_target_usd:
  value: 30000
  source: "HOA goal stated in build spec (CLAUDE.md)"
  confidence: high
reconciliation:
  tolerance_usd_per_bill:
    value: 1.00
    source: "Build spec, Phase 1"
  required_pass_rate_percent:
    value: 95
    source: "Build spec, Phase 1"
  line_item_tolerance_usd:
    value: 0.25
    source: "Set 2026-10-06 so line items count as matched when they agree within 25 cents. Every line except taxes matches to the cent; the tax formula is within $0.18 on every bill until a full City bill shows how taxes are split."
    confidence: medium
leak_rules:
  over_budget_threshold_percent:
    value: 25
    source: "Build spec default, Phase 3"
    confidence: medium
  over_budget_consecutive_periods:
    value: 2
    source: "Build spec, Phase 3"
    confidence: medium
waterfluence_budget_disagreement_percent:
  value: 15
  source: "Build spec, Phase 2"
weather:
  azmet_station: "Encanto"
  source: "Waterfluence Agency panel, site MESA-437 (sources/waterfluence/water-budget-and-site-settings.md)"
  confidence: medium
  todo: "Encanto is the station Waterfluence uses, so our budget matches theirs. It is in central Phoenix, far from east Mesa; check whether a closer AZMET station has 5 years of ETo once azmet.arizona.edu is reachable."
waterfluence_unit_cost:
  value: 8.35
  unit: "dollars per thousand gallons"
  source: "Waterfluence Agency panel, site MESA-437"
  confidence: low
  note: "Waterfluence's flat cost assumption for its $ Cost charts. Not a City of Mesa rate; never used to price bills."
watering_schedule:
  watering_hour_min_gallons:
    value: 50
    source: "Set 2026-10-07 from the hourly AMI data: hours outside watering read 0 to 5 gallons (the meter-1 trickle is 3 to 5), and the smallest scheduled hours read about 100 gallons (meter-3) and about 370 (meter-4). 50 sits well between the two."
    confidence: medium
  max_gap_hours:
    value: 3
    source: "Set 2026-10-07: up to 3 missing hourly reads between two watering hours are treated as one watering night with a gap, because Waterfluence drops 1 to 2 late-night reads on many nights on meters 1, 3, and 4."
    confidence: medium
  measured_min_complete_share:
    value: 0.8
    source: "Set 2026-10-07: the 'end earlier' estimate measures gallons directly only when at least 80% of watering nights have every hour read. Below that, the nights with every hour read are mostly the short ones (meters 1, 3, and 4 lose late-night reads), so the estimate uses the share of watering hours removed instead."
    confidence: medium
homes:
  value: 56
  source: "Maricopa County Assessor: 56 residential lots in the Granite Ridge subdivision, per Jennifer's Zone Plan Model, Inputs (sources/workbook/zone-plan-model.md)"
  confidence: high
small_wins_budget_usd:
  value: 20000
  source: "Jennifer, 2026-10-07: the community cannot afford a large investment, but small wins under $20,000 will help if the math works"
  confidence: high
post_2027_rate_assumption:
  method: hold_2027_flat
  label: "Years after 2027 assume 2027 City of Mesa rates stay the same. This is an assumption, not a published rate."
  source: "Build spec default, Phase 5"
  confidence: low
rain_check:
  since:
    value: "2026-07-01"
    source: "Jennifer, 2026-10-07: check every rain event from July 1, 2026. Hourly meter data starts July 3, 2026, so events earlier than a week after that show as not checked."
    confidence: high
  min_event_inches:
    value: 0.20
    source: "Jennifer, 2026-10-07: a rain event is a day with 0.20 in or more at the gauge; back-to-back days merge"
    confidence: medium
  usable_share:
    value: 0.75
    source: "Jennifer, 2026-10-07: 75% of an event's rain is usable by plants"
    confidence: low
  usable_cap_inches:
    value: 1.5
    source: "Jennifer, 2026-10-07: usable rain is capped at 1.5 in per event because heavier rain runs off"
    confidence: low
  plant_factors:
    value:
      - meters: ["meter-1", "meter-2"]
        months: [4, 5, 6, 7, 8, 9, 10]
        factor: 0.6
      - meters: ["meter-1", "meter-2"]
        months: [11, 12, 1, 2, 3]
        factor: 0.8
      - meters: ["meter-3", "meter-4"]
        months: []
        factor: 0.3
    source: "Jennifer, 2026-10-07: park turf meters 0.6 April to October and 0.8 November to March when overseeded; drip meters 0.3 all year. Estimates for this check only; months [] means all year."
    confidence: low
  summer_months:
    value: [4, 5, 6, 7, 8, 9, 10]
    source: "Jennifer, 2026-10-07: same season split as the park plant factors"
    confidence: medium
  max_days_summer:
    value: 7
    source: "Jennifer, 2026-10-07: a skip window is never longer than 7 days in summer"
    confidence: medium
  max_days_winter:
    value: 14
    source: "Jennifer, 2026-10-07: a skip window is never longer than 14 days in winter"
    confidence: medium
  already_off_days:
    value: 7
    source: "Jennifer, 2026-10-07: a meter that did not water in the 7 days before the rain was already off, and is left out of the counts"
    confidence: medium
  night_start_hour:
    value: 18
    source: "Set 2026-10-07: only watering that starts between 6 PM and 8 AM counts for the rain check. Every controller program in the hourly data starts between 8 PM and 5 AM. Single daytime hours above the watering threshold on the park meters (171 gallons at 1 PM on Aug 31, 549 at noon on Sep 2, 562 at 9 AM on Jul 15) look like tests or hand watering, not the controller skipping or not skipping rain."
    confidence: medium
  night_end_hour:
    value: 8
    source: "Set 2026-10-07, see night_start_hour"
    confidence: medium
  action_id:
    value: "rain-response"
    source: "The action in data/actions/ that this check verifies"
    confidence: high
  action_verify_min_inches:
    value: 0.25
    source: "Jennifer, 2026-10-07: after the rain fix is done, a rain of 0.25 in or more where both park meters pause counts as the fix working"
    confidence: medium
experiment_check:
  min_days_each_side:
    value: 7
    source: "Site setting chosen 2026-10-06: at least one full week of complete days before and after a change, so a single watering cycle cannot decide the result"
    confidence: medium
  min_hours_per_day:
    value: 20
    source: "Site setting chosen 2026-10-06: a day counts only when Waterfluence reported at least 20 of 24 hours (see data/usage/README.md on missing hours)"
    confidence: medium
  share_of_target_for_success:
    value: 0.75
    source: "Site setting chosen 2026-10-06: a change counts as working as expected when it delivers at least three-quarters of the expected cut, because weather is not yet adjusted for"
    confidence: low
  noise_percent:
    value: 5
    source: "Site setting chosen 2026-10-06: changes in average daily use smaller than 5% are treated as no clear change"
    confidence: low
---

# Site settings

Thresholds and targets the engine reads. Change a value here, not in code.
