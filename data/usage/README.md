# Usage

Waterfluence daily totals at `usage/<meter>/<YYYY>.md`, one table per year.

Copy or sum values from the export. Leave a cell blank if the export has no reading for that day (blank means missing, not zero). If Waterfluence provides its own daily budget, include it in the `Waterfluence budget gal` column; otherwise leave that column blank.

When the source is hourly AMI data, `Gallons` is the sum of the hourly reads, `Hours reported` is how many hourly reads that day had (below 24 means a partial total), and `Min hour gal` is the smallest hourly read (used by the never-zero baseline check). The hourly reads themselves are in `hourly/<meter>/<YYYY>.md`.

## Example (format only, not real data)

```markdown
---
meter: meter-2
year: 2024
source: "waterfluence-meter-2-2024.csv"
exported_on: 2025-01-15
---

| Date | Gallons | Hours reported | Min hour gal | Waterfluence budget gal |
|---|---|---|---|---|
| 2024-01-01 | 0 | 24 | 0 | |
| 2024-01-02 | | 0 | | |
```

## Missing hours are not random

Checked 2026-10-06 against the City bills for the read period 2026-07-16 to 08-12: the hourly AMI sums to 63% of billed gallons on meter-1, 96% on meter-2, 55% on meter-3, and 22% on meter-4. The missing hours on meters 1 and 4 are the late-night hours (10 PM to midnight) on about half the nights, which are watering hours. So daily totals here undercount, and the City bills and `billing-periods/` are the reliable volumes. Hourly data is still useful for patterns in the hours it does report (trickles, valves left running), and repeated identical values across hours are filled-in reads.
