# Financials

HOA year-end Statements of Revenues and Expenses, one file per calendar year at `financials/<YYYY>.md`. Only water and landscape lines are copied. Balance sheets, bank details, and lot owner names stay in `/raw/`.

These are a cross-check, not the source of truth for water cost. City of Mesa bills are the official record. P&L amounts may follow payment dates rather than service periods (see `basis`), so a year's P&L water total can differ from the sum of that year's bills.

| Field | Required | Notes |
|---|---|---|
| `year` | yes | Calendar year. |
| `basis` | yes | `cash`, `accrual`, or `null` until confirmed. |
| `report_generated` | yes | Date printed on the report. |
| `source` | yes | File in `/raw/pl/` and page. |
| `water_irrigation_december` | no | Current-period (December) actual for account 50110, to spot timing spikes. |

Table columns: `Account`, `Line` (exactly as printed), `Actual` (year to date), `Budget` (annual), `Page`. Use blank for a dash on the report.

## Example (format only, not real data)

```markdown
---
year: 2020
basis: null
report_generated: 2021-01-15
source: "2020_PL.pdf"
water_irrigation_december: 0.00
---

| Account | Line | Actual | Budget | Page |
|---|---|---|---|---|
| 50110 | Water - Irrigation | 0.00 | 0.00 | 2 |
```
