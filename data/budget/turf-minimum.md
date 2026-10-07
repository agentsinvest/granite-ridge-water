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
source: "Jennifer's water model workbook, Meters and baseline, row Turf need at healthy minimum (sources/workbook/water-model-2026-10-07.md)"
confidence: low
todo: "The workbook does not say which monthly weather demand (ETo) it used. Confirm the station and years, then compute this from data/weather/ instead of copying it. Cite a source for the 0.50 plant factor."
---

# Turf need at a healthy minimum

Thousand gallons a month the park turf needs to stay green at the plant factor and sprinkler efficiency above: weather demand x plant factor x turf area x 0.623 / efficiency.

| Month | Need kgal |
|---|---|
| Jan | 46 |
| Feb | 74 |
| Mar | 143 |
| Apr | 245 |
| May | 315 |
| Jun | 337 |
| Jul | 305 |
| Aug | 247 |
| Sep | 207 |
| Oct | 165 |
| Nov | 84 |
| Dec | 36 |
