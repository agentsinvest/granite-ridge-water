# Experiments

One file per change the HOA tries on purpose, at `experiments/<id>.md`, so the site can say whether it worked. The Experiments screen compares average daily water use (Waterfluence AMI, complete days only) for `baseline_days` before `start` with use from `start` to `end` (or the latest day on file).

Thresholds (how many days, what counts as "as expected") are in `config/site.md` under `experiment_check`. Weather is not adjusted for yet, so keep experiments short and compare similar weeks.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Same as file name. |
| `title` | yes | Plain headline. |
| `meter` | yes | Meter whose water use shows the result. |
| `what_changes` | yes | Exactly what is changed, by whom, in plain words. |
| `status` | yes | `planned`, `running`, `done`, or `stopped`. Anything but `planned` needs a `start`. |
| `start` | yes | First day of the change (YYYY-MM-DD), or `null` while planned. |
| `end` | yes | Last day of the trial, or `null` if it is still going or permanent. |
| `baseline_days` | yes | How many days before `start` to compare against. |
| `expected.type` | yes | `percent_reduction` (average daily use drops by `value` percent) or `max_daily_gallons` (no day after the start goes above `value` gallons). |
| `expected.value` | yes | The number, with `source` and `confidence`. Never a guess: use a quote, a vendor sheet, or our own data. |
| `linked_flags` | no | Flag ids this experiment tests. |
| `outcome_note` | no | What people saw on site, once done. |

## Example (format only, not real data)

```markdown
---
id: meter-2-summer-cut-10
title: "Meter 2: cut summer run times 10% for four weeks"
meter: meter-2
what_changes: "Landscaper lowers the seasonal adjust on the meter 2 controller from 100% to 90%."
status: running
start: 2027-06-01
end: 2027-06-28
baseline_days: 28
expected:
  type: percent_reduction
  value: 10
  source: "Seasonal adjust change of 10 points"
  confidence: medium
linked_flags: []
---
```
