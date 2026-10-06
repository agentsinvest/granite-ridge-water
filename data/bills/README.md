# Bills

One file per bill at `bills/<meter>/<YYYY-MM>.md`, where `YYYY-MM` is the month the billing period ends.

Copy every line item exactly as printed, in the order printed, including credits as negative amounts. Do not combine or rename lines. If any value cannot be read with confidence, set `needs_review: true` and explain in Notes instead of guessing.

| Field | Required | Notes |
|---|---|---|
| `meter` | yes | `meter-1` to `meter-4`. |
| `bill_date` | yes | Date on the bill. |
| `period_start` / `period_end` | yes | Service period as printed, or the matched Waterfluence read period (say so in `period_source`). |
| `period_source` | no | How the period was established when it is not printed. |
| `read_start` / `read_end` | yes | Meter reads as printed; `null` with a `todo` when not available. |
| `gallons` | yes | Billed consumption in gallons (convert from the printed unit and say so in Notes if the bill uses another unit). |
| `amount_due` | yes | Total due as printed, including any carried balance; `null` if unknown. |
| `printed_total` | yes | Current charges total as printed (not including past-due balances). |
| `reconciled` | yes | `pending`, `pass`, or `fail`. Set by the Phase 1 reconciliation run. |
| `needs_review` | yes | `true` when extraction was unreliable or the source does not add up. Explain in Notes. |
| `source` | yes | Original file name in `/raw/` and page. |

## Example (format only, not real data)

```markdown
---
meter: meter-2
bill_date: 2024-07-20
period_start: 2024-06-12
period_end: 2024-07-11
read_start: 1234500
read_end: 1301200
gallons: 66700
amount_due: 0.00
printed_total: 0.00
reconciled: pending
needs_review: false
source: "bills-2024.pdf, page 7"
---

| Line item | Amount |
|---|---|
| (copy every line exactly as printed) | 0.00 |

Notes: anything unusual on the bill.
```

`reconciled` is set by `npm run reconcile`, which also writes `data/RECONCILIATION.md`. Do not set it by hand.
