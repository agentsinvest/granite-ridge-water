---
turf_area_sq_ft:
  value: 86354
  source: "Waterfluence measured turf (data/config/plant-factors.md, turf_overseed area)"
  confidence: medium
plant_factor:
  value: 0.50
  source: "Jennifer's water model workbook, Assumptions: Bermuda stays green at roughly 0.5 to 0.6 (sources/workbook/water-model-2026-10-07.md)"
  confidence: low
efficiency:
  value: 0.75
  source: "Jennifer's water model workbook, Assumptions: turf sprinkler efficiency after the wet check"
  confidence: low
effective_rain_share:
  value: 0.50
  source: "Jennifer's Zone Plan Model, Inputs: share of direct rain plants can use without a basin (sources/workbook/zone-plan-model.md)"
  confidence: low
source: "Formula and assumptions from Jennifer's Zone Plan Model, Quick Wins row Turf need at healthy minimum; monthly weather from data/weather/monthly-normals.md"
confidence: low
todo: "Cite a published source for the 0.50 healthy-minimum plant factor (for example a WUCOLS or University of Arizona turf guide)."
---

# Turf need at a healthy minimum

Computed by the app for each month from `data/weather/monthly-normals.md`:

thousand gallons = max(0, ETo x plant factor - average rain x effective rain share) x 0.623 / efficiency x turf area / 1,000.

The workbook's own values (46, 74, 143, 245, 315, 337, 305, 247, 207, 165, 84, 36; 2,204 a year) are kept in the tests as a check.
