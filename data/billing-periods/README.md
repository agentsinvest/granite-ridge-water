# Billing periods

Water use per City of Mesa read period, one file per meter at `billing-periods/<meter>.md`. Source is the Waterfluence ENERGY STAR report, which lists usage for each Mesa read period.

This is the volume side of each bill. Dollar amounts come from `bills/` (sample bills) and `financials/` (annual totals). Rates times these volumes give computed bills.

| Field | Required | Notes |
|---|---|---|
| `meter` | yes | `meter-1` to `meter-4`. |
| `meter_number_last4` | yes | Last 4 digits of the meter number. |
| `unit` | yes | Unit of the `Usage` column. |
| `unit_source` / `unit_confidence` | yes | How the unit was established. |
| `source` | yes | Export file and date. |

## Example (format only, not real data)

```markdown
---
meter: meter-1
meter_number_last4: "0000"
unit: thousand_gallons
unit_source: "Printed on Mesa bill for the same period"
unit_confidence: high
source: "Waterfluence ENERGY STAR report, exported 2026-09-30"
---

| Period start | Period end | Usage |
|---|---|---|
| 2026-07-16 | 2026-08-12 | 0 |
```
