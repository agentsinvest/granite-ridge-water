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
