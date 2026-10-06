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
---

# Site settings

Thresholds and targets the engine reads. Change a value here, not in code.
