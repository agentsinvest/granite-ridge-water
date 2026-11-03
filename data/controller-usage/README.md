# Controller usage

Daily gallons measured by each WeatherTRAK controller's flow sensor, at `controller-usage/<controller letter>/<YYYY>-<YYYY>.md`, one file per water year (October 1 to September 30). The letter matches `id` in `controllers/` (A is Entrance, C is Park). Controller B is not a WeatherTRAK and has no flow sensor, so it has no file.

Copy rows exactly from the transcription in `sources/controllers/weathertrak-usage-<controller>-<YYYY>-<YYYY>.md`. One row per day, in order, no gaps. The build checks that `Scheduled + Manual + Other + None (5.x)` equals `Total` on every row.

What the columns mean:

* `ET in`: the controller's reference evapotranspiration for the day, in inches.
* `Major alerts`: number of Major or Critical alerts raised that day. The alerts themselves are listed in the source transcription.
* `Shut-down`, `Ctrlr Off`, `Paused`: `yes` when the report shows a check mark, blank otherwise.
* `Runtime min`: total station minutes that day (two stations running 10 minutes each is 20).
* `Scheduled`, `Manual`, `Other`, `None (5.x)`, `Total`: gallons. `Other` is flow while no station was scheduled or run by hand: a leak, a valve that did not close, or hand watering from a quick coupler.

The Park controller measures meters 1 and 2 together, so compare it with their sum. The controller works in Pacific time; Arizona does not change clocks, so in winter its days start an hour off from the meters.

## Example (format only, not real data)

```markdown
---
controller: A
water_year: "2025-2026"
source: "HydroPoint WeatherTRAK Measured Usage History Report, Entrance controller, 2025-10-01 to 2026-09-30 (sources/controllers/weathertrak-usage-entrance-2025-2026.md)"
covers: "2025-10-01 to 2026-09-30"
confidence: high
---

| Date | ET in | Major alerts | Shut-down | Ctrlr Off | Paused | Runtime min | Scheduled | Manual | Other | None (5.x) | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2025-10-01 | 0.23 | 0 | | | | 14 | 214.8 | 0 | 1.3 | 0 | 216.1 |
```
