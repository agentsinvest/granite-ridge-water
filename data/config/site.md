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
post_2027_rate_assumption:
  method: hold_2027_flat
  label: "Years after 2027 assume 2027 City of Mesa rates stay the same. This is an assumption, not a published rate."
  source: "Build spec default, Phase 5"
  confidence: low
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
