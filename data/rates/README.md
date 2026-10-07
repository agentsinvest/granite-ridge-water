# Rates

One file per City of Mesa rate period at `rates/<applies_from_period_end>.md`. The billing engine picks the rate whose `applies_from_period_end` to `applies_to_period_end` range covers a bill's read period end.

Model only the structure Mesa's documents (or bills) show. Every value carries a `source`. Values worked out from bills rather than read from a published schedule have `derived: true`, and the file has a `todo` to confirm them.

The current files are derived from bills: a service charge per meter group, the first 3,000 gallons included, two usage blocks split at a per-meter winter allowance, a water drought fee and a Superfund charge per thousand gallons, a flat per-bill fee, and taxes. See `2026-05-13.md` for a complete example of the format.

| Field | Notes |
|---|---|
| `effective_start` / `effective_end` | The City's effective dates, `null` until confirmed from a published schedule. |
| `applies_from_period_end` / `applies_to_period_end` | Read period end dates this rate was observed to apply to. Matches the file name. |
| `fixed_charges` | Service charge per bill for a list of meters (sizes `null` until known). |
| `included_kgal_per_bill` | Thousand gallons covered by the service charge. |
| `volumetric.blocks` | Block 1 up to the winter allowance, block 2 above it. Prices per thousand gallons. |
| `winter_allowance` | How the block 1 limit is set for each meter. |
| `fees` | Each fee with its basis: `per_1000_gallons_above_included`, `per_1000_gallons`, or `per_bill`. |
| `taxes` | Rate and which charges it applies to. |
| `straddle_rule` | How a period crossing a rate change is billed: `prorate`, `rate_at_period_end`, or `null` until known. |


## Recommended rates

A rate the City has recommended but not yet adopted has `status: recommended` (for example `2027-02-01.md`). It prices future scenarios only and is never treated as today's rate. Its blocks may include a second surcharge tier whose `limit` is `winter_average_multiple: 1.5`. When the City adopts it, set `status: adopted` and replace any value the ordinance changes.
