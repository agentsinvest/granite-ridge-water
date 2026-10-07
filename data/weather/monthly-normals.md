---
eto_source: "University of Arizona AZMET, Queen Creek station (az22), daily Penman-Monteith ETo, 2021 to 2025 monthly means, as compiled in Jennifer's Zone Plan Model, Inputs tab (sources/workbook/zone-plan-model.md)"
eto_confidence: medium
rain_source: "NOAA ACIS, COOP station East Mesa: 2003 to 2025 monthly averages, and the actual months of 2020 (driest year) and 2021 (wettest year), as compiled in the same workbook"
rain_confidence: medium
todo: "Pull these from AZMET and NOAA directly with npm run update-weather once those sites are reachable, and check them against the workbook. Waterfluence uses the Encanto station for its budget (config/site.md); Queen Creek is closer to east Mesa."
---

# Monthly weather normals

Inches per month. ETo is weather demand (reference evapotranspiration). The 2020 and 2021 rain columns let a plan be tested in a dry and a wet year.

| Month | ETo in | Rain avg in | Rain 2020 in | Rain 2021 in |
|---|---|---|---|---|
| Jan | 2.49 | 1.2 | 0.19 | 1.45 |
| Feb | 3.3 | 1.23 | 1.26 | 0 |
| Mar | 4.96 | 0.97 | 2.29 | 0.16 |
| Apr | 7.09 | 0.26 | 0 | 0.02 |
| May | 8.95 | 0.17 | 0.02 | 0 |
| Jun | 9.48 | 0.08 | 0 | 0.06 |
| Jul | 9.49 | 0.98 | 0.12 | 3.96 |
| Aug | 8.43 | 1.55 | 0.24 | 5.89 |
| Sep | 6.97 | 1.2 | 0 | 1.86 |
| Oct | 5.2 | 0.59 | 0 | 0.28 |
| Nov | 3.06 | 0.73 | 0 | 0.05 |
| Dec | 2.22 | 1.23 | 0.45 | 2.7 |
