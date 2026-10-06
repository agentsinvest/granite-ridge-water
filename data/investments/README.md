# Investments

One file per change or investment that can be modeled. New ones are added as files; no code change is needed.

Values stay `null` until filled from a quote or a cited source. Items with `null` savings or cost show as "needs a quote" in the app instead of being ranked on guesses.

| Field | Notes |
|---|---|
| `name` | Plain-language name. |
| `applies_to` | `zones`, `meters`, or `areas`: what the user selects when applying it. |
| `effect.type` | `percent_reduction`, `gallons_per_month`, `efficiency_change`, `leak_elimination`, or `fixed_charge_change`. |
| `effect.value` | Expected value. |
| `effect.range` | `[low, high]` for worst case and best case. |
| `upfront_cost_per_unit` | Dollars per `unit`. |
| `unit` | `controller`, `zone`, `meter`, `sq_ft`, or `one_time`. |
| `annual_cost` | Subscriptions, maintenance. |
| `lifespan_years` | Expected life. |
| `source` | Quote or publication, with date. |
| `confidence` | `low`, `medium`, or `high`. |
| `requires_confirmation` | Optional. Text shown before any savings, for example "Needs plumber and City confirmation". |
| `notes` | Anything else. |

## Example (format only, not real data)

```markdown
---
name: Smart weather-based controller
applies_to: zones
effect:
  type: percent_reduction
  value: null
  range: [null, null]
upfront_cost_per_unit: null
unit: controller
annual_cost: null
lifespan_years: null
source: ""
confidence: low
notes: ""
todo: "Get quote"
---
```
