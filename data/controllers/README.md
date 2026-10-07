# Controllers

One file per irrigation controller, with one table row per station. The site shows these on Where the water goes, Controllers and zones, and builds the landscaper checklist from them.

Values are transcribed from the documents in `/sources/controllers/` (the Eco Verde assessment and the HydroPoint reports), which are never deployed. Every row carries its source. A blank cell means unknown: the site shows it as "unknown" and adds it to "What we still need from the landscaper". Never fill a cell with a guess.

Front matter: `id` (the letter on the Eco Verde map, matching `data/map.md`), `name` (`Park`, `Entrance`, or `B`, as used in `data/actions/`), `full_name`, `model`, `serial_last4` (last 4 only), `meters`, `has_flow_sensor` (`true`, `false`, or `null`), `source`, `confidence`, `findings` (whole-controller findings, each with `text` and `source`), and an optional `todo`.

Table columns: `Station` (letter and number, like `C7`), `Meter`, `Waters` (plain name), `Type` (`spray`, `rotor`, `drip`, `bubbler`), `GPM` (learned flow), `Program`, `Run min`, `Cycles`, `Days`, `Findings`, `Source`. Write `Off` in `Program` for a station turned off at the controller.

## Example

```markdown
---
id: A
name: Entrance
full_name: "Entrance controller"
model: "WeatherTRAK LC+ smart controller"
serial_last4: "6094"
meters: [meter-3]
has_flow_sensor: true
source: "Eco Verde irrigation assessment, 2026, page 4"
confidence: high
findings: []
---

| Station | Meter | Waters | Type | GPM | Program | Run min | Cycles | Days | Findings | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| A4 | meter-3 | Drip along McKellips | drip | | B (drip) | 50 | 1 | Sun, Thu | | Eco Verde p. 4 |
```
