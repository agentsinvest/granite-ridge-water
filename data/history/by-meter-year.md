---
source: "Jennifer's water model workbook, Bill history by meter sheet, rebuilt from 324 City of Mesa bills in Granite_Ridge_Water_Bills_by_Meter.xlsx (sources/workbook/water-model-2026-10-07.md)"
confidence: medium
covers: "Bills dated December 2019 to August 2026. 2026 is January to August."
note: "2023 is low because the old park meters stopped registering before the City replaced them (see What happened when, below)."
checks: "2026 gallons equal the 2026 bills in data/bills/ for every meter, and 2026 peak surcharge equals the billing engine's split of those bills to the dollar (tests/history.test.ts)."
todo: "Put the bill-by-bill workbook in /raw/ and add the bills it has that data/bills/ is missing, so 2020 to 2025 can be checked bill by bill. City prices before August 2025 are not in data/rates/, so 2020 to 2025 peak surcharge cannot be recomputed yet."
---

# Water use and peak surcharge by meter and year

One row per meter per calendar year. `Gallons kgal` is thousand gallons billed. `Peak surcharge` is the dollars paid because water was above the meter's winter allowance: gallons above the allowance times the difference between the higher and lower price. `Complete` is `no` for a partial year.

| Year | Meter | Gallons kgal | Peak surcharge | Complete |
|---|---|---|---|---|
| 2020 | meter-1 | 3690 | 3519 | yes |
| 2020 | meter-2 | 2205 | 2334 | yes |
| 2020 | meter-3 | 921 | 1214 | yes |
| 2020 | meter-4 | 615 | 440 | yes |
| 2021 | meter-1 | 3140 | 1640 | yes |
| 2021 | meter-2 | 1784 | 970 | yes |
| 2021 | meter-3 | 691 | 326 | yes |
| 2021 | meter-4 | 773 | 324 | yes |
| 2022 | meter-1 | 3212 | 2871 | yes |
| 2022 | meter-2 | 1501 | 1056 | yes |
| 2022 | meter-3 | 591 | 310 | yes |
| 2022 | meter-4 | 802 | 665 | yes |
| 2023 | meter-1 | 2530 | 3167 | yes |
| 2023 | meter-2 | 609 | 384 | yes |
| 2023 | meter-3 | 512 | 661 | yes |
| 2023 | meter-4 | 596 | 101 | yes |
| 2024 | meter-1 | 3716 | 6695 | yes |
| 2024 | meter-2 | 2142 | 3456 | yes |
| 2024 | meter-3 | 513 | 664 | yes |
| 2024 | meter-4 | 682 | 196 | yes |
| 2025 | meter-1 | 3393 | 4149 | yes |
| 2025 | meter-2 | 2036 | 2470 | yes |
| 2025 | meter-3 | 443 | 440 | yes |
| 2025 | meter-4 | 484 | 19 | yes |
| 2026 | meter-1 | 2534 | 4458 | no |
| 2026 | meter-2 | 1448 | 2676 | no |
| 2026 | meter-3 | 268 | 302 | no |
| 2026 | meter-4 | 263 | 70 | no |
