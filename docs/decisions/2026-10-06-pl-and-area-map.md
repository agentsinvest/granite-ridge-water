# 2026-10-06: HOA P&Ls and area map added

## Decision

* Added a `financials/<YYYY>.md` data type for HOA year-end P&L lines. It was not in the original spec. It is a cross-check only: City of Mesa bills stay the official record, and the Phase 4 waterfall is still built from bills.
* Copied only water and landscape lines. Balance sheets, bank account digits, and lot owner names in the P&Ls stay in `/raw/`.
* Filled `areas.md` with the 5 areas from Jennifer's annotated aerial map, using the map's square footages as gross areas (not irrigated areas).
* Marked `financials/2022.md` `needs_review` because that PDF is a scan with no text layer. The 2020, 2021, and 2023 values were checked by script against the PDF text.
* Logged the 2022 irrigation equipment incentive as a year-precision event. Added a `Precision` column to `events.md` so approximate dates are never shown as exact.

## Why it matters

Water spend fell from $36,340.05 (2020) to $26,016.31 (2023). The cost increase the project is meant to explain must be in 2024 to 2026, so those bills and P&Ls are now the top data request.
