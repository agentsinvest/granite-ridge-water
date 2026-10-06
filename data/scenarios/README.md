# Scenarios

Saved scenarios the HOA wants to keep. Any scenario can also be shared as a URL from the What if screen; save it here only when it should be permanent.

A scenario is a baseline plus an ordered list of changes. Changes apply in order, so savings compound (two 20% reductions on one zone give 36%, not 40%).

## Example (format only, not real data)

```markdown
---
id: example-turn-down-parkways
name: "Turn parkways down 20% in winter"
baseline:
  year: normal-weather
  rates: 2026
changes:
  - kind: turn_down
    target: { area: parkways }
    percent: 20
    months: [12, 1, 2]
  - kind: investment
    investment: smart-et-controller
    target: { zones: [a-01-entry-turf] }
created_on: 2026-10-06
notes: ""
---
```
