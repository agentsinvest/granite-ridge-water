---
conversion_factor_gallons_per_inch_sq_ft:
  value: 0.623
  source: "1 inch of water over 1 square foot = 0.623 gallons (standard unit conversion); Waterfluence uses 0.6233 thousand gallons per inch per 1,000 ft2"
  confidence: high
method:
  formula: "budget gallons = (ETo - effective rain) x (Ks x Kd x Kr / IE) x area x 0.623"
  source: "Waterfluence Water Budget panel, site MESA-437 (sources/waterfluence/water-budget-and-site-settings.md)"
  confidence: high
  note: "Waterfluence subtracts effective rain from ETo before applying the plant factor, and calculates effective rain with a daily soil moisture balance. The spec's formula subtracts rain after. This file follows Waterfluence so the two budgets can be compared."
todo: "Effective rain method: Waterfluence's soil moisture balance is not published. Pick a documented method before computing our own budget. Minimum plant factors and the tree allowance still need a cited source."
---

# Plant factors and irrigation efficiencies

Defaults the water budget uses. A zone file can override any value with its own `source` and `confidence`.

## Site factors in use by Waterfluence (site MESA-437)

Percent = Ks x Kd x Kr / IE.

| Landscape type | Ks | Kd | Kr | IE | Percent | Area ft2 | Source | Confidence |
|---|---|---|---|---|---|---|---|---|
| shrub | 0.30 | 0.30 | 1.00 | 0.75 | 0.12 | 728295 | Waterfluence Water Budget panel | medium |
| turf_overseed | 0.60 | 1.00 | 1.00 | 0.70 | 0.857 | 86354 | Waterfluence Water Budget panel | medium |
| turf_no_overseed | 0.47 | 1.00 | 1.00 | 0.70 | 0.671 | 0 | Waterfluence Water Budget panel | medium |
| pool | 1.20 | 1.00 | 1.00 | 1.00 | 1.20 | 0 | Waterfluence Water Budget panel | medium |

Confidence is medium because the areas and the shrub density factor (0.30) are Waterfluence's settings from a map last updated about late 2024, not checked on the ground.

## Waterfluence default factors (reference ranges)

| Factor | Plant or system | Low | High | Source |
|---|---|---|---|---|
| Ks | turf cool season | 0.80 | 0.80 | Waterfluence Default Budget Factors |
| Ks | turf warm season | 0.60 | 0.60 | Waterfluence Default Budget Factors |
| Ks | shrubs, trees, groundcovers | 0.40 | 0.50 | Waterfluence Default Budget Factors |
| Ks | desert adapted plants | 0.30 | 0.30 | Waterfluence Default Budget Factors |
| Ks | pools, fountains | 1.20 | 1.20 | Waterfluence Default Budget Factors |
| Kr | recycled water leaching | 1.15 | 1.15 | Waterfluence Default Budget Factors |
| IE | turf, cool and warm | 0.60 | 0.70 | Waterfluence Default Budget Factors |
| IE | shrubs, trees, groundcovers, desert adapted plants | 0.75 | 0.75 | Waterfluence Default Budget Factors |

## Minimums and tree allowance (for turn-down risk notes)

| Item | Value | Source | Confidence |
|---|---|---|---|
| minimum plant factor, turf | null | | |
| minimum plant factor, shrub | null | | |
| tree allowance | null | | |
