# Are we overwatering? (first check, 2026-10-06)

Question from Jennifer: is Granite Ridge overwatering its common areas?

Short answer: **not across the whole site, but in specific places and seasons, yes.** Over the last 12 City bills the site used about 26% to 31% more water than the plants themselves need. That is roughly what an ordinary, not specially tuned sprinkler system loses to uneven coverage. Within that total, three things look like real overwatering: the winter overseed season, the meter-4 leaks, and the two park meters, which use more than the park alone should need.

This is an estimate, not a reconciled number. It uses the derived inputs listed below and is not shown on the public site.

## What was compared

**Actual use**: the last 12 City bills for each meter (bills dated 2025-08-26 to 2026-07-28): 6,496,000 gallons.

| Meter | Gallons |
|---|---|
| Meter 1 (park, northeast corner) | 3,578,000 |
| Meter 2 (park, northwest corner) | 2,069,000 |
| Meter 3 (entry gate) | 401,000 |
| Meter 4 (east side, interior strip) | 448,000 |

**Weather**: 68.0 inches a year of reference evapotranspiration minus effective rain. Derived from Waterfluence's own annual budget (3.0 feet over its density-adjusted area, using its factors and the AZMET Encanto station). This matches the roughly 70 inches a year usually cited for Phoenix. Monthly weather is not in the repo yet (AZMET is blocked from this environment), so this check is annual only.

**Landscape**: Waterfluence's measured areas: 86,354 sq ft of overseeded turf and 728,295 sq ft of shrub and desert landscape.

**Plant need** (SLIDE method, ANSI/ASABE S623; the "Plant Water Requirement" in the QWEL audit form): weather x plant factor x area x 0.623.

| Landscape | Plant factor | Source | Gallons a year |
|---|---|---|---|
| Turf, Bermuda overseeded with rye | 0.60 to 0.65 (warm-season 0.6; cool-season 0.8 in the winter months) | WUCOLS turfgrass factors | 2.19 to 2.38 million |
| Desert-adapted shrubs and trees | 0.3 on canopy area; canopy taken as 30% of the shrub area (Waterfluence's density factor) | SLIDE; Waterfluence Kd 0.30 | 2.78 million |
| **Total plant need** | | | **4.97 to 5.15 million** |

The desert landscape is the biggest uncertainty. At 20% canopy cover the need is 1.85 million; at 40% it is 3.70 million.

**Irrigation requirement**: plant need times the QWEL run-time multiplier, 1 / (0.4 + 0.6 x DU), which covers uneven sprinkler coverage. A typical spray system (DU 0.55) needs 1.37 times plant need: **6.8 to 7.1 million gallons**. A well-tuned system (DU 0.70) needs 1.22 times: **6.1 to 6.3 million gallons**. Waterfluence's own budget is 6.84 million.

## Findings

1. **Site total is in line with a typical system.** 6.50 million gallons is about 95% of Waterfluence's budget and between the well-tuned and typical-system requirements. It is 26% to 31% above plant need. A system tuned to DU 0.70 would need about 0.2 to 0.4 million gallons less; that is the efficiency opportunity (catch-can audit, nozzles, pressure, smart controllers), worth roughly $1,800 to $3,600 a year at about $8.94 per thousand gallons in the upper block. To be confirmed with an audit.
2. **The park meters (1 and 2) look high.** Together they used 5.65 million gallons. The whole park (area E, 149,862 sq ft) with its turf and shrubs should need about 2.2 to 3.2 million gallons of plant water, or 3.0 to 4.4 million with typical sprinkler losses. Either these two meters water much more than the park and its immediate surroundings, or the park area is overwatered by roughly 1.3 to 2.6 million gallons a year. A controller map or zone list settles which.
3. **Winter overseed months run above budget every year.** Waterfluence's monthly chart shows use above its budget band every fall and winter, the largest in November 2024 (1,249 thousand gallons against a budget of about 400 to 500). Overseeded rye needs germination watering in October, then every 3 to 7 days once established (AMWUA). Winter is also when the City sets each meter's cheaper-block allowance, so winter water affects next year's rates.
4. **Leaks are real overwatering.** Meter 4 used 46,000 to 61,000 gallons every month, summer and winter, through 2023 and 2024 until its meter was replaced, and in September and October 2026 its 2 AM valve stuck open three times (about 39,500 gallons).
5. **The site has used much less before.** Summers 2021 to 2023 ran well below Waterfluence's budget (peak months about 630 to 900 thousand gallons vs 1,000 to 1,200 since 2024). Whether the landscape held up in those years is worth asking the landscaper.

## What would make this a firm answer

* Which meter and zones water each area (controller map or zone list).
* A catch-can audit on a few turf and shrub zones (the QWEL form), giving real DU and precipitation rates.
* Monthly AZMET weather, to compare month by month instead of annually.
* The current controller schedules, to compare with the AMWUA "Landscape Watering by the Numbers" intervals (for example, Bermuda every 4 to 5 days, desert-adapted shrubs every 16 days, desert-adapted trees every 21 days, established rye every 3 to 7 days).

## Sources

* WUCOLS turfgrass plant factors (UC Davis): cool-season 0.80, warm-season 0.60. https://wucols.ucdavis.edu/plant-factors-turfgrasses
* SLIDE / ANSI/ASABE S623 (UC ANR Center for Landscape and Urban Horticulture): desert-adapted plants 0.3; trees, shrubs, vines, groundcovers 0.5; water need = ETo x PF x area. https://ucanr.edu/site/center-landscape-urban-horticulture/using-ansi-asabe-s623-slide-estimate-landscape-water
* AMWUA "Landscape Watering by the Numbers" and Water Use It Wisely: watering intervals by plant type and season. https://wateruseitwisely.com/?r3d=landscape-watering-by-the-numbers-2026#p=1
* QWEL Irrigation Audit Exercise form (Waterfluence resources): DU, net precipitation rate, run-time multiplier. `sources/references/qwel-irrigation-audit.md`
* Waterfluence site settings and annual performance: `sources/waterfluence/water-budget-and-site-settings.md`, `summary-landscape-and-annual-performance.md`, `monthly-chart-2021-2026.md`.

The reference websites could not be opened directly from this environment (network policy); the factor values above were taken from search results quoting those pages and should be spot-checked on the pages themselves.
