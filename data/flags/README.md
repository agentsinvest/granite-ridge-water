# Flags

One file per leak or anomaly flag at `flags/<flag-id>.md`. The leak engine (Phase 3) writes new ones with `status: suggested`. People update the status by editing the file.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Same as file name, for example `2024-07-meter-2-over-budget`. |
| `title` | yes | Short plain-language headline shown on the site, starting with the meter, for example "Meter 2: over budget two bills in a row". |
| `summary` | yes | Two or three plain sentences a neighbor can follow: what we saw and why it matters. The full numbers go in `evidence`. |
| `meter` | yes | Meter the flag is on. |
| `zones` | no | Zones involved, if known. |
| `rule` | yes | `over_budget`, `step_change`, `off_schedule`, `never_zero`, `winter_summer_ratio`, or `meter_vs_meter`. Use `manual` for flags a person adds. |
| `first_seen` | yes | First date or period the pattern appears. |
| `status` | yes | `suggested`, `open`, `investigating`, `fixed`, or `false-alarm`. |
| `fixed_on` | if fixed | Date of the repair. The app checks whether usage dropped afterward. |
| `evidence` | yes | Plain-language summary of the numbers that triggered the flag. |
| `excess_water` | yes | Extra gallons the site prices, or `null` when they cannot be counted yet (the card then says "Cost not estimated yet"). See below. |
| `related_events` | no | Dates of entries in `events.md`. |

## Excess water and cost

`excess_water` holds `episodes` (each `{ from, to, gallons }`, dates inclusive), `ongoing_gallons_per_year` (a yearly figure for a flow that could keep going, or `null`), `method` (how the gallons were counted, in plain words), `source`, and `confidence`.

The site prices each episode with `src/engine/leakCost.ts` using the rate files. Extra water is the last water through the meter, so an episode inside a read period that is in `billing-periods/` costs that period's bill minus the same bill without the extra gallons. An episode whose bill has not arrived, or that spans several read periods, is shown as a range: all at the block 1 price to all at the block 2 price, plus per-gallon fees and tax. An episode with no rate on file is shown as not priced. Dollars are never written in this file.

## Example (format only, not real data)

```markdown
---
id: 2024-07-meter-2-over-budget
title: "Meter 2: over budget two bills in a row"
summary: "Meter 2 used more than the landscape needs on two bills in a row."
meter: meter-2
zones: []
rule: over_budget
first_seen: 2024-06-12
status: suggested
fixed_on: null
evidence: "Actual exceeded budget by more than the threshold for 2 consecutive bills."
excess_water:
  episodes:
    - { from: 2024-05-14, to: 2024-07-15, gallons: 40000 }
  ongoing_gallons_per_year: null
  method: "Actual minus budget for the two read periods."
  source: "data/billing-periods/meter-2.md"
  confidence: medium
related_events: []
---

Notes from whoever investigated.
```
