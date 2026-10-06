# Zones

One file per irrigation zone (one controller station / valve). File name is the zone slug, for example `a-01-entry-turf.md`.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Same as the file slug. |
| `name` | yes | Plain-language name. |
| `meter` | yes | `meter-1` to `meter-4`. |
| `area` | yes | An area id from `areas.md`. |
| `landscape_type` | yes | `turf`, `shrubs`, `trees`, `mixed`, `desert`, or as observed. |
| `square_feet` | yes | Irrigated area. Include `source` and `confidence` in `square_feet_source`. |
| `irrigation_type` | yes | `spray`, `rotor`, `drip`, or `bubbler`. |
| `controller` / `station` | yes | Controller name and station number. |
| `schedule` | yes | `days` (list), `run_minutes`, `start_times`, `seasonal_adjust_percent` (by month if known). |
| `plant_factor` | no | Overrides the default in `config/plant-factors.md`. Needs `source` and `confidence`. |
| `efficiency` | no | Overrides the default irrigation efficiency. Needs `source` and `confidence`. |
| `is_turf_greenspace` | yes | `true` excludes the zone from turn-down selectors unless "include greenspace" is on. |
| `has_trees` | yes | `true` triggers the tree risk note and "keep tree watering" toggle. |
| `todo` | no | What is still unknown. |

## Example (format only, not real data)

```markdown
---
id: a-01-entry-turf
name: "Entry turf, west side"
meter: meter-2
area: entry
landscape_type: turf
square_feet: 0
square_feet_source:
  source: "Landscaper zone map, 2025"
  confidence: medium
irrigation_type: spray
controller: "Controller A"
station: 1
schedule:
  days: [mon, wed, fri]
  run_minutes: 0
  start_times: ["04:00"]
  seasonal_adjust_percent: null
plant_factor: null
efficiency: null
is_turf_greenspace: false
has_trees: true
todo: "Measure square footage"
---

Notes about heads, known problems, or recent repairs.
```
