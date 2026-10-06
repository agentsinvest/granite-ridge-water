# Rates

One file per City of Mesa rate period, named by effective start date: `rates/2025-07-01.md`.

Model only the structure Mesa's documents show. Do not add tiers, seasons, or fees that the documents do not list. Every value has its own `source` (document and page). If a rate was worked out from bills rather than read from a published schedule, set `derived: true` on that value and name the bills in `source`.

| Field | Required | Notes |
|---|---|---|
| `effective_start` / `effective_end` | yes | `effective_end` is `null` for the current period. |
| `service_type` | yes | Must match `service_type` on the meters it prices. |
| `fixed_charges` | yes | One entry per meter size. |
| `volumetric` | yes | Price per 1,000 gallons. One `blocks` entry per tier and season, only if Mesa uses them. |
| `fees` | yes | Other per-bill or per-volume charges. Empty list if none. |
| `taxes` | yes | Each tax with its rate and which lines it applies to. |
| `straddle_rule` | yes | How Mesa bills periods that cross a rate change: `prorate`, `rate_at_period_end`, or `null` until known. |
| `todo` | no | What is still unknown. |

## Example (format only, not real data)

```markdown
---
effective_start: 2025-07-01
effective_end: null
service_type: "landscape irrigation"
fixed_charges:
  - meter_size_inches: 1.5
    amount: 0.00
    derived: false
    source: "Mesa utility rate schedule FY2026, page 3"
volumetric:
  unit: per_1000_gallons
  blocks:
    - season: null
      from_gallons: 0
      to_gallons: null
      price: 0.00
      derived: false
      source: "Mesa utility rate schedule FY2026, page 3"
fees: []
taxes:
  - name: "Transaction privilege tax"
    rate_percent: 0.00
    applies_to: [fixed_charges, volumetric, fees]
    derived: false
    source: "Mesa bill, page 1"
straddle_rule: null
todo: "Confirm whether Mesa prorates periods that cross July 1"
---
```
