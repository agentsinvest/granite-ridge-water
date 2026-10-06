# 2026-10-06: Full transcriptions in /sources/

## Decision

Jennifer asked for all shared data to be in GitHub as markdown. Added `/sources/` with complete transcriptions of every document: all 6 P&Ls (every page and line), both Waterfluence exports (every row; hourly AMI split by meter), the area map and its legend, and a description of the Waterfluence monthly chart.

## Rules

* `/sources/` is committed but never parsed into the app or deployed. `/data/` remains the only input to the app, so the public-site rules still hold.
* Owner names and a personal ID number on construction deposits are redacted. Meter numbers are shortened to the last 4 digits. Bank accounts appear only as the last 4 digits printed on the reports.

## Verification

* 2020, 2021, 2023, 2024, 2025 P&Ls: converted by script; the sequence of every dollar amount matches the PDF text exactly (322, 303, 308, 362, 382 amounts).
* 2022 P&L (scan): typed by hand; every row's variance equals actual minus budget, and every section total, total expense, net total, and liabilities plus equity tie. `data/financials/2022.md` is no longer marked `needs_review`.
* Waterfluence: all 7,141 hourly rows and 140 read-period rows carried over.

## Also

The Waterfluence chart ("Monthly 1000 Gallons") confirms the read-period unit is thousand gallons; `billing-periods` unit confidence raised to high.
