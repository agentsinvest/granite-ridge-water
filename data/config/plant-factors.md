---
conversion_factor_gallons_per_inch_sq_ft:
  value: 0.623
  source: "1 inch of water over 1 square foot = 0.623 gallons (standard unit conversion)"
  confidence: high
todo: "Fill plant factors and efficiencies from a cited source (for example WUCOLS, ADWR, or AMWUA landscape guidance) and pick one effective rainfall method. Confirm with Jennifer or the landscaper."
---

# Plant factors and irrigation efficiencies

Defaults the water budget uses. A zone file can override either value with its own `source` and `confidence`.

## Plant factors

`Minimum` is the lowest factor that keeps the plants healthy. Turn-down changes that go below it are flagged "below estimated plant need." `Tree allowance` is the factor used for the "keep tree watering" toggle.

| Landscape type | Season | Plant factor | Minimum | Source | Confidence |
|---|---|---|---|---|---|
| turf (warm season) | summer | null | null | | |
| turf (overseeded winter rye) | winter | null | null | | |
| shrubs | all | null | null | | |
| trees | all | null | null | | |
| tree allowance | all | null | | | |
| desert / low water | all | null | null | | |

## Irrigation efficiency

| Irrigation type | Efficiency | Source | Confidence |
|---|---|---|---|
| spray | null | | |
| rotor | null | | |
| drip | null | | |
| bubbler | null | | |

## Effective rainfall

| Method | Value | Source | Confidence |
|---|---|---|---|
| null | null | | |
