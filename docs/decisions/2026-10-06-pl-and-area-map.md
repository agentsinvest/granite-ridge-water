# 2026-10-06: HOA P&Ls and area map added

## Decision

* Added a `financials/<YYYY>.md` data type for HOA year-end P&L lines. It was not in the original spec. It is a cross-check only: City of Mesa bills stay the official record, and the Phase 4 waterfall is still built from bills.
* Copied only water and landscape lines. Balance sheets, bank account digits, and lot owner names in the P&Ls stay in `/raw/`.
* Filled `areas.md` with the 5 areas from Jennifer's annotated aerial map, using the map's square footages as gross areas (not irrigated areas).
* Marked `financials/2022.md` `needs_review` because that PDF is a scan with no text layer. The 2020, 2021, and 2023 values were checked by script against the PDF text.
* Logged the 2022 irrigation equipment incentive as a year-precision event. Added a `Precision` column to `events.md` so approximate dates are never shown as exact.

## Why it matters

Water spend fell from $36,340.05 (2020) to $26,016.31 (2023). The cost increase the project is meant to explain must be in 2024 to 2026, so those bills and P&Ls are now the top data request.

## Update: 2024 and 2025 P&Ls

* Added `financials/2024.md` and `2025.md`. Both were checked by script against the PDF text, line by line. No 2026 P&L exists yet.
* Water spend went from $26,016.31 (2023) to $44,708.39 (2024) and $45,239.28 (2025). The "how we got here" story is that step, not a steady 5-year climb. Bills from 2023 onward are now the top data request.
* Jennifer confirmed the map areas contain no homeowner lot area. Recorded in `areas.md` as `lot_area_included: false`.
* Owner names and bank account digits in the 2024 deposit summary and balance sheets were not copied.
