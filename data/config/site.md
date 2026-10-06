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
  azmet_station: null
  todo: "Pick the nearest AZMET station to Granite Ridge and record its name and ID; confirm it reports ETo for the full 5 years"
post_2027_rate_assumption:
  method: hold_2027_flat
  label: "Years after 2027 assume 2027 City of Mesa rates stay the same. This is an assumption, not a published rate."
  source: "Build spec default, Phase 5"
  confidence: low
---

# Site settings

Thresholds and targets the engine reads. Change a value here, not in code.
