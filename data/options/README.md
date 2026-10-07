# Options

Watering changes the Recommended moves screen can rank, at `options/<id>.md`. Each one is priced by the scenario engine against the latest 12 read periods at the latest City rate, so the savings are calculated, not typed in.

The percent is the size of the change being proposed, not a promised result. Options that touch the turf greenspace are hidden unless the "include greenspace" toggle is on.

| Field | Notes |
|---|---|
| `id` | Same as file name. |
| `title` | Plain headline. |
| `why` | Why this is worth trying, with the numbers that point to it. |
| `meters` | Meters the change applies to. |
| `change` | `kind` (`turn_down` or `shutoff`), `percent` (for `turn_down`), and `months` (1 to 12; empty means all year). |
| `touches_greenspace` | `true` if it changes water to the park turf. |
| `has_trees` | `true` if trees are watered by these meters, `null` if unknown. Drives the tree risk note. |
| `upfront_cost` | Dollars, or `null` for "needs a quote". `upfront_cost_source` says where it came from. |
| `effort` | `low`, `medium`, or `high`. |
| `source`, `confidence` | Where the reasoning comes from. |
| `how_to_test` | Optional. How to run it as an experiment first. |
