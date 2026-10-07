# Weather

AZMET daily reference evapotranspiration (ETo) and rainfall at `weather/<YYYY>.md`, one table per year. Written by `npm run update-weather` (Phase 2). The station is set in `config/site.md`.

Use the AZMET original (Penman-Monteith) ETo column named in `eto_method`. Blank cells mean the station reported no value.

## Example (format only, not real data)

```markdown
---
year: 2024
station: null
eto_method: null
source: "AZMET daily data download"
retrieved_on: 2025-01-15
---

| Date | ETo in | Rain in |
|---|---|---|
| 2024-01-01 | 0.00 | 0.00 |
```

## Annual rainfall

`annual-rainfall.md` holds yearly rainfall totals provided by the HOA (table `Year | Rain in | Complete`), separate from the AZMET daily files.

## Other weather files

* `annual-rainfall.md`: yearly rainfall totals. Table columns `Year`, `Rain in`, `Complete` (`yes`, or `no` for a partial year).
* `monthly-normals.md`: average weather by calendar month, for planning when daily weather is not on file. Frontmatter `eto_source`, `eto_confidence`, `rain_source`, `rain_confidence`, optional `todo`. Table columns `Month` (`Jan` to `Dec`), `ETo in`, `Rain avg in`, `Rain 2020 in`, `Rain 2021 in`.
