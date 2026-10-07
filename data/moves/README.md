# Moves

Recommended moves that change how the system is run (a controller setting, a sensor, a schedule rule) rather than a priced cut in water. One file per move at `moves/<id>.md`, shown on the Recommended moves screen.

When the site redesign adds `/data/actions/`, these files move there unchanged.

| Field | Notes |
|---|---|
| `id` | Same as file name. |
| `title` | Plain headline. |
| `meter`, `controller` | Plain names of what it touches (for example `park`, `Park`). |
| `category`, `lawn_impact`, `owner` | Short labels. |
| `status` | `not-started`, `in-progress`, `done`, or `dropped`. |
| `start_date` | Date the change was made, or `null`. Checks only count results after it. |
| `cost` | Dollars as text, or `"needs quote"`. |
| `verify_with` | How we will know it worked, in plain words. |
| `verify_min_inches`, `verify_meters` | For the rain check: the smallest rain that counts as a test, and the meters that must all pause. |
| `why` | What we saw that points to this. |
| `steps` | List of `title` and `detail`, in plain words. |
| `source`, `confidence` | Where the reasoning comes from. |

## Example

```markdown
---
id: rain-response
title: "Stop watering right after rain"
meter: park
controller: Park
category: schedule-change
lawn_impact: none
owner: Landscaper
status: not-started
start_date: null
cost: "needs quote"
verify_with: "after the next rain of 0.25 in or more, meters 1 and 2 do not water through the rain"
verify_min_inches: 0.25
verify_meters: ["meter-1", "meter-2"]
why: "The park waters again right after storms."
steps:
  - title: "Move the rain sensor to an open spot"
    detail: "Away from roofs, trees, and spray."
source: "Irrigation assessment"
confidence: medium
---
```
