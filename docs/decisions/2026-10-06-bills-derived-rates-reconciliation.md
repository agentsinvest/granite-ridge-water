# 2026-10-06: Bills from the HOA summary, derived rates, and reconciliation

## Decisions

* Entered 48 bills (4 meters, bills dated 2025-08-26 to 2026-07-28) from the HOA's City of Mesa water usage summary, not from City bill PDFs, because the PDFs cannot be uploaded. Each bill's read period is the Waterfluence period ending before the bill date; gallons agree on all 48. Meter reads are `null`.
* `printed_total` is the summary's Grand Total (current charges). `amount_due` is its Total Due, which includes a carried balance on the September 2025 bills.
* Derived the rate structure from the bills, as the spec allows when no schedule is available, and marked every value `derived: true` with a `todo` to confirm against the published schedule. The model reproduces every service, usage, drought, Superfund, and other-fee line to the cent; taxes are within $0.18 using 8.29% of service, usage, drought, and Superfund.
* Rate periods are keyed by read period end date (`applies_from_period_end`), because the City's effective dates are unknown. Read periods before 2025-08-13 have no rate and are not priced.
* Added `reconciliation.line_item_tolerance_usd` ($0.25) to `config/site.md` so taxes count as matched while their exact split is unknown.
* Reconciliation result: 46 of 48 bills pass (95.8%), meeting the 95% gate. The two failures (meter-1, 2025-09 and 2025-10) are rows where the summary's grand total is $120.51 and $3.25 above its own listed charges; both are `needs_review` with notes.
* Because the rates were derived from the same bills, passing proves internal consistency, not agreement with a published schedule. RECONCILIATION.md says so. Projections and savings stay off the site until the rates are confirmed or the HOA accepts the derived rates.

## Implementation

* `src/engine/billing.ts`: `calculateBill(meter, periodStart, periodEnd, gallons, rates, readPeriods)`, pure TypeScript, whole-cent arithmetic.
* `scripts/reconcile.ts` (`npm run reconcile`): writes `data/RECONCILIATION.md` and sets each bill's `reconciled` field. The Vitest suite fails if the pass rate drops below the gate, a failure has no explanation, or the report is stale.

## Update: City bill text from the 5-year PDF

* The 18.6 MB PDF in Drive could not be downloaded (connector limit 10 MB; direct download blocked by network policy). Drive's text extraction returned bills dated 2024-12-27 to 2026-08-26 only.
* Parsed meter blocks are accepted only when reads subtract to the billed gallons, the read days match the dates, five charges sum to the printed total, and the drought and Superfund rules hold. 25 of the summary bills matched line by line; their reads were added. No accepted block conflicted with the summary except meter-3 2025-09, where the City bill shows drought $2.56 and total $248.52; the summary's $2.66 and $248.62 were typos and the bill file is corrected.
* The two failing bills were late-payment charges (late fee $111.27 + $9.24 tax; delinquent letter $3.00 + $0.25 tax). They are now line items, and reconciliation passes late-payment lines through to the computed total instead of predicting them. Result: 52 of 52 bills pass.
* Added the four 2026-08 bills from the City text. They were not used to derive the rates, so their passing is an independent check of the rate model.
* Bills dated December 2024 to July 2025 that parsed cleanly are kept in `sources/` but not added to `data/bills/` yet, because that range is incomplete in the extraction and needs rates before August 2025. They will be added together with the rest of the PDF.
* Recorded Jennifer's note that the two greenspace meters (1 and 2) also water the surrounding shrubs and trees.

## Update: full 5-year PDF by OCR

* Downloaded the full PDF after Jennifer allowed `drive.usercontent.google.com`. It is 334 scanned pages (no text), so Tesseract was installed and every page OCR'd. Scripts are in `scripts/ocr/`.
* A meter block is accepted only when its charge lines add exactly to the printed total. 253 meter-bills passed; 35 overlapped existing bills and all 35 matched to the cent. 214 new bills (2019-12 to 2025-07) were added. A second OCR pass at 400 dpi produced no additional valid blocks.
* Reconciliation now separates priced bills (covered by a derived rate) from unpriced ones, so older bills do not fail the gate before their rates are derived. The report lists both.
* The March 2026 bills are dated 2026-03-31 on the City bills; the HOA summary's 3/21/2026 was a typo.
