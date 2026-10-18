---
title: "Next 12 bills: water the landscape needs and what it will cost"
first_bill_month: "2026-12"
bills: 12
bill_end_day:
  value: 13
  source: "City read dates in data/billing-periods/ fall on the 12th to the 16th; the 13th is typical. Used only to label bills and pick the rate in effect."
  confidence: medium
rain_share:
  value: 0.5
  source: "Jennifer's Zone Plan Model, Inputs: share of direct rain plants can use without a basin (sources/workbook/zone-plan-model.md)"
  confidence: low
rye_months: [11, 12, 1, 2, 3]
rye_months_source: "Jennifer, 2026-10-18: the park is overseeded with winter rye this fall and next fall; rye is watered from seeding until the spring transition"
seeding_month: 10
seeding_note: "Seeding late October to early November (Jennifer, 2026-10-18). The extra seeding water lands on the bill that ends in mid-November."
rates_note: "Bills ending before February 2027 use today's rates. From the bill ending February 2027 the City's recommended 2027 rates are assumed adopted as proposed (Jennifer, 2026-10-18). Council votes December 8, 2026."
cases:
  lean:
    label: "Lean"
    description: "Leaks fixed and sprinklers tuned; lawn kept at a healthy minimum."
    turf_area_sq_ft:
      value: 76600
      source: "Park turf on the HOA's annotated area map (data/areas.md), marked approximate; excludes the entry turf, which is now artificial"
      confidence: medium
    bermuda_plant_factor:
      value: 0.5
      source: "Jennifer's water model workbook: Bermuda stays green at roughly 0.5 to 0.6 (sources/workbook/water-model-2026-10-07.md)"
      confidence: low
    rye_plant_factor:
      value: 0.6
      source: "Set for this model as a lean setting below the WUCOLS cool-season value of 0.8"
      confidence: low
    seeding_weeks:
      value: 3
      source: "Jennifer, 2026-10-18: seeding needs only a few weeks of extra water, late October to early November"
      confidence: low
    seeding_plant_factor:
      value: 1.0
      source: "Set for this model: seedbed kept moist at full reference demand"
      confidence: low
    turf_efficiency:
      value: 0.75
      source: "Jennifer's water model workbook: turf sprinkler efficiency after the wet check"
      confidence: low
    desert_plant_factor:
      value: 0.10
      source: "Jennifer's Zone Plan Model, plant types: natural desert, established Sonoran desert (ADWR and AMWUA planning values). The west wash zone, off since at least March 2026 and thriving, supports a factor this low."
      confidence: low
    drip_efficiency:
      value: 0.9
      source: "Jennifer's Zone Plan Model, plant types: drip efficiency for desert plants"
      confidence: low
    cap_drip_at_current_use: false
  cautious:
    label: "Cautious"
    description: "Sprinklers as they are set today; standard plant factors."
    turf_area_sq_ft:
      value: 86354
      source: "Waterfluence measured turf (data/config/plant-factors.md); may still include the old entry turf"
      confidence: medium
    bermuda_plant_factor:
      value: 0.6
      source: "WUCOLS warm-season turfgrass plant factor (data/config/plant-factors.md)"
      confidence: medium
    rye_plant_factor:
      value: 0.8
      source: "WUCOLS cool-season turfgrass plant factor (data/config/plant-factors.md)"
      confidence: medium
    seeding_weeks:
      value: 4
      source: "Jennifer, 2026-10-18: a few weeks of extra water, late October to early November"
      confidence: low
    seeding_plant_factor:
      value: 1.0
      source: "Set for this model: seedbed kept moist at full reference demand"
      confidence: low
    turf_efficiency:
      value: 0.70
      source: "Waterfluence turf irrigation efficiency (data/config/plant-factors.md)"
      confidence: medium
    desert_plant_factor:
      value: 0.15
      source: "Jennifer's Zone Plan Model, plant types: very low water native desert on light drip (ADWR and AMWUA planning values)"
      confidence: low
    drip_efficiency:
      value: 0.9
      source: "Jennifer's Zone Plan Model, plant types: drip efficiency for desert plants"
      confidence: low
    cap_drip_at_current_use: true
source: "Method from docs/analysis/2026-10-18-need-based-model-dec-2026-to-nov-2027.md; weather from data/weather/monthly-normals.md; prices from data/rates/"
confidence: low
todo: "Replace the desert areas with irrigated drip area per meter once the zone list is in. Replace the lawn efficiency with a catch-can audit. Replace the 2027 rates with the adopted ordinance after December 8, 2026."
---

# Next 12 bills: water need and cost

Inputs for the Next year tab. The app computes need for each City bill from monthly weather, these plant factors, and the areas below, then prices each bill with the City rates in `data/rates/`.

Per meter:

* `Turf share`: the meter's share of the park lawn.
* `Desert sq ft`: gross map area watered by drip.
* `Drip share of today's use`: the part of the meter's current water that is drip. The cautious case never lets drip go above this.
* `Today's use kept`: the part of the meter's last 12 bills that would still be used today. Meter 3 drops the entry turf.

| Meter | Turf share | Desert sq ft | Drip share of today's use | Today's use kept | Source | Confidence |
|---|---|---|---|---|---|---|
| meter-1 | 0.62 | 127652 | 0.12 | 1 | Turf share from park station flows and hourly data (docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md). Desert: park non-turf plus half of the west and south desert, split evenly with meter-2 (data/areas.md). Drip share: hourly data, about 88% of this meter's water flows at sprinkler rates (Zone Plan Model, Quick Wins). | low |
| meter-2 | 0.38 | 127652 | 0.10 | 1 | Same as meter-1; about 90% of this meter's water flows at sprinkler rates | low |
| meter-3 | 0 | 73721 | 0.71 | 0.71 | Desert: half of the McKellips and Crismon perimeter (data/areas.md). Entry turf was 29% of this meter's water in July 2026 hourly data and is now artificial turf (Jennifer, 2026-10-07). | low |
| meter-4 | 0 | 162429 | 1 | 1 | Desert: the interior strip (confirmed by Jennifer, 2026-10-13) plus half of the McKellips and Crismon perimeter (data/areas.md) | low |
