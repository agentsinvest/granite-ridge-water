# History

`by-meter-year.md` holds yearly totals by meter that come from a source with more bills than `data/bills/` has yet. When `data/bills/` covers a year completely, the app can check these totals against it.

Frontmatter: `source`, `confidence`, `covers`, and optional `note`, `checks`, and `todo`.

Table columns: `Year`, `Meter` (`meter-1` to `meter-4`), `Gallons kgal` (thousand gallons), `Peak surcharge` (dollars paid above the winter allowance, beyond the lower price), `Complete` (`yes`, or `no` for a partial year). Blank means not known.

## Example (format only, not real data)

```markdown
---
source: "Workbook name and sheet"
confidence: medium
covers: "Bills dated January to December 2020"
---

| Year | Meter | Gallons kgal | Peak surcharge | Complete |
|---|---|---|---|---|
| 2020 | meter-1 | 0 | 0 | yes |
```
