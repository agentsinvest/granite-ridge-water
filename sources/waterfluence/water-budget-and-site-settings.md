---
document: "Waterfluence site dashboard: Water Budget, Waterfluence Default Budget Factors, Agency, and Water Meters panels (4 screenshots), site MESA-437"
provided_by: "Jennifer, 2026-10-06, pasted into chat; image files were not saved"
transcription: "Typed from the screenshots. Account numbers shortened to the last 4 digits."
---

# Waterfluence water budget and site settings

## Water Budget

"We use the Landscape Coefficient Method described below to calculate an approximate water budget for each site. Budget components include measurements of:"

| Component | Definition (as shown) |
|---|---|
| Shrub | Inclusive of all groundcovers, shrubs and trees. Captures the irrigated planting beds with in-ground irrigation systems. Includes decorative grasses that are not mowed. |
| Turf | Mowed grasses. Includes turf overseeded in the winter in Arizona. |
| Potential Nonfunctional Turf | Mowed grasses irrigated with potable water that do not serve a recreational purpose or whose irrigation is unnecessary to ensure the health of trees or other perennial nonturf plantings as defined by California AB 1572. |
| Turf No Overseed | Mowed warm-season grasses that are not overseeded with cool-season grasses in the winter. Arizona Only. |
| Pools | Water features such as pools, ponds, fountains. |

Formula as shown: **BUDGET = Percent * (ETo - ERain) * Area * C**, where Percent = (Ks * Kd * Kr) / IE.

| Type | Percent | Ks | Kd | Kr | IE | Area ft2 |
|---|---|---|---|---|---|---|
| Shrub | 12% | 0.30 | 0.30 | 1.00 | 0.75 | 728,295 |
| Turf Overseed | 86% | 0.60 | 1.00 | 1.00 | 0.70 | 86,354 |
| Turf No Overseed | 67% | 0.47 * | 1.00 | 1.00 | 0.70 | 0 |
| Pool | 120% | 1.20 | 1.00 | 1.00 | 1.00 | 0 |
| Total | 20% | - | - | - | - | 814,649 |

The asterisk on 0.47 is shown without an explanation in the screenshot.

"Weather (ETo - ER) from AZMET Encanto"

| Term | Definition (as shown) |
|---|---|
| Budget | Volume of water budgeted for billing period. |
| Percent | Budget as percent of ETO-ERain defined as (Ks * Kd * Kr) / IE. Total percent is based on weighted average of areas. |
| Ks | Species or plant factor expressing plant water needs as fraction of ETo. |
| Kd | Density factor accounting for collective leaf area within landscape plantings. |
| Kr | Leaching factor increasing the budget for sites irrigated with recycled water in order to maintain acceptable salinity levels in the root zone. |
| IE | Irrigation efficiency is the percentage of water beneficially used by plants considering management practices and inherent imperfections in irrigation systems. |
| ETo | Reference evapotranspiration (inches) equals the depth of water evaporated and transpired from a reference crop (4 to 7 inch tall fescue grass) with an abundant water supply. |
| ERain | Effective rainfall (inches) equals the depth of rain effective in offsetting ETo. Effective rainfall varies widely with rainfall frequency, magnitude, time of year, and root zone depth. We use a daily soil moisture balance equation to determine how much rain is effective (usually between 10 to 50 percent of total rainfall). |
| Area | Landscape area irrigated in square feet. |
| C | Conversion factor putting the water budget in desired volumetric terms. The factor equals 0.0008333 for hundred cubic feet (CCF) and 0.0006233 for thousand gallons (TG). |

Arithmetic check: 0.30 x 0.30 x 1.00 / 0.75 = 0.12; 0.60 / 0.70 = 0.857; 0.47 / 0.70 = 0.671; area-weighted total (0.12 x 728,295 + 0.857 x 86,354) / 814,649 = 0.198. All match the percents shown.

## Waterfluence Default Budget Factors

| Factor | Plant or system | Value |
|---|---|---|
| Ks | Turf Cool Season | 0.80 |
| Ks | Turf Warm Season | 0.60 |
| Ks | Shrubs, Trees, Groundcovers | 0.40 to 0.50 |
| Ks | Desert Adapted Plants | 0.30 |
| Ks | Pools, Fountains | 1.20 |
| Kr | Recycled Water Leaching | 1.15 |
| IE | Turf, Cool and Warm | 0.60 to 0.70 |
| IE | Shrubs, Trees, Groundcovers, Desert Adapted Plants | 0.75 |

References listed on the page: Using ANSI/ASABE S623 & SLIDE to Estimate Landscape Water Requirements; Water Use Classification of Landscape Species (WUCOLS); Qualified Water Efficient Landscaper (QWEL); EPA WaterSense Water Budget Tool; Landscape Watering by the Numbers, a Guide for the Arizona Desert.

## Agency

| Field | Value |
|---|---|
| Supplier | Mesa |
| Community | Mesa |
| Sponsor | AZ at Large |
| Weather Station | AZMET Encanto |
| Water Source | Potable |
| Irrigation Code | DIM |
| Water Unit | Thousand Gallons (TG) |
| Water Unit Cost | $8.35 |
| Program Start | 12/31/2024 |
| Type | HOA |
| Map Source | Waterfluence |

## Water Meters

| Meter (last 4) | Service address (as listed) | Account (last 4) | Meter label |
|---|---|---|---|
| 8300 | 1842 N 99TH WAY LSCP LD1 | 8651 | meter-1 |
| 5793 | 1922 N 99TH WAY LSCP LD1 | 8661 | meter-4 |
| 4031 | 1837 N 98TH PL LSCP LD1 | 8671 | meter-2 |
| 4706 | 1944 N 98TH PL LSCP LD1 | 8681 | meter-3 |

Notes column is empty for all four. "LSCP" reads as landscape service. Service addresses stay in this private folder and are not copied into `/data/`, because they may match homeowner street addresses.
