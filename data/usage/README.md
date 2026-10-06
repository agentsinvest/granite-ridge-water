# Usage

Waterfluence daily totals at `usage/<meter>/<YYYY>.md`, one table per year.

Copy values from the export. Leave a cell blank if the export has no reading for that day (blank means missing, not zero). If Waterfluence provides its own daily budget, include it in the `Waterfluence budget gal` column; otherwise leave that column blank.

## Example (format only, not real data)

```markdown
---
meter: meter-2
year: 2024
source: "waterfluence-meter-2-2024.csv"
exported_on: 2025-01-15
---

| Date | Gallons | Waterfluence budget gal |
|---|---|---|
| 2024-01-01 | 0 | |
| 2024-01-02 | | |
```
