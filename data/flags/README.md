# Flags

One file per leak or anomaly flag at `flags/<flag-id>.md`. The leak engine (Phase 3) writes new ones with `status: suggested`. People update the status by editing the file.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Same as file name, for example `2024-07-meter-2-over-budget`. |
| `meter` | yes | Meter the flag is on. |
| `zones` | no | Zones involved, if known. |
| `rule` | yes | `over_budget`, `step_change`, `off_schedule`, `never_zero`, `winter_summer_ratio`, or `meter_vs_meter`. Use `manual` for flags a person adds. |
| `first_seen` | yes | First date or period the pattern appears. |
| `status` | yes | `suggested`, `open`, `investigating`, `fixed`, or `false-alarm`. |
| `fixed_on` | if fixed | Date of the repair. The app checks whether usage dropped afterward. |
| `evidence` | yes | Plain-language summary of the numbers that triggered the flag. |
| `related_events` | no | Dates of entries in `events.md`. |

## Example (format only, not real data)

```markdown
---
id: 2024-07-meter-2-over-budget
meter: meter-2
zones: []
rule: over_budget
first_seen: 2024-06-12
status: suggested
fixed_on: null
evidence: "Actual exceeded budget by more than the threshold for 2 consecutive bills."
related_events: []
---

Notes from whoever investigated.
```
