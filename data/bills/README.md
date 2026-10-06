# Bills

One file per bill at `bills/<meter>/<YYYY-MM>.md`, where `YYYY-MM` is the month the billing period ends.

Copy every line item exactly as printed, in the order printed, including credits as negative amounts. Do not combine or rename lines. If any value cannot be read with confidence, set `needs_review: true` and explain in Notes instead of guessing.

| Field | Required | Notes |
|---|---|---|
| `meter` | yes | `meter-1` to `meter-4`. |
| `period_start` / `period_end` | yes | Service period as printed. |
| `read_start` / `read_end` | yes | Meter reads as printed. |
| `gallons` | yes | Billed consumption in gallons (convert from the printed unit and say so in Notes if the bill uses another unit). |
| `printed_total` | yes | Current charges total as printed (not including past-due balances). |
| `reconciled` | yes | `pending`, `pass`, or `fail`. Set by the Phase 1 reconciliation run. |
| `needs_review` | no | `true` when extraction was unreliable. |
| `source` | yes | Original file name in `/raw/` and page. |

## Example (format only, not real data)

```markdown
---
meter: meter-2
period_start: 2024-06-12
period_end: 2024-07-11
read_start: 1234500
read_end: 1301200
gallons: 66700
printed_total: 0.00
reconciled: pending
source: "bills-2024.pdf, page 7"
---

| Line item | Amount |
|---|---|
| (copy every line exactly as printed) | 0.00 |

Notes: anything unusual on the bill.
```
