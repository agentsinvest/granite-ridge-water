# Hourly usage

Waterfluence hourly gallons at `hourly/<meter>/<YYYY>.md`, one table per year. These feed the watering schedule view: which hours each meter waters, how long, and how many gallons.

Copy rows exactly from the AMI export (the transcription in `sources/waterfluence/ami-hourly-meter-N-YYYY.md`). Leave a missing hour out entirely; a missing hour is not zero.

Known limits (see `usage/README.md`): Waterfluence drops some late-night reads, often inside the watering window on meters 1, 3, and 4. Whether a read time marks the start or end of its hour is not confirmed. The app labels watering nights with gaps as partial and does not use them for estimates.

## Example (format only, not real data)

```markdown
---
meter: meter-2
meter_number_last4: "0000"
year: 2026
source: "Waterfluence AMI outdoor report, exported 2026-10-06"
exported_on: 2026-10-06
covers: "2026-07-03 01:00 to 2026-10-06 00:00"
---

| Read time | Gallons |
|---|---|
| 2026-07-03 22:00 | 2500 |
| 2026-07-03 23:00 | 2480 |
```
