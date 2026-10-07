# /data

Every number the app shows comes from a file in this folder. Git history is the audit trail.

## Rules

* Never invent a value. Unknown values are `null` with a `todo:` note. The app shows them as missing.
* Every assumption (plant factor, savings percent, cost) carries a `source` and a `confidence` (`high`, `medium`, or `low`).
* Every fact copied from a document carries a `source` naming the document and page.
* Public-safe only: Mesa account numbers as last 4 digits, no homeowner names or addresses, no contact details, no PDFs. Originals go in `/raw/` (git-ignored).
* No em dashes.
* Dates are `YYYY-MM-DD`. Money is US dollars with two decimals. Volumes are gallons.

## Layout

| Path | What it holds | Format doc |
|---|---|---|
| `meters/meter-N.md` | One file per City of Mesa meter | `meters/README.md` |
| `zones/<zone-slug>.md` | One file per irrigation zone (valve/station) | `zones/README.md` |
| `areas.md` | Named parts of the neighborhood and which zones are in each | in the file |
| `bills/<meter>/<YYYY-MM>.md` | One file per bill, line items copied exactly | `bills/README.md` |
| `rates/<effective-start>.md` | One file per City of Mesa rate period | `rates/README.md` |
| `billing-periods/<meter>.md` | Usage per Mesa read period from Waterfluence | `billing-periods/README.md` |
| `usage/<meter>/<YYYY>.md` | Waterfluence daily totals, one table per year | `usage/README.md` |
| `hourly/<meter>/<YYYY>.md` | Waterfluence hourly gallons, used for the watering schedule view | `hourly/README.md` |
| `weather/<YYYY>.md` | AZMET daily ETo and rain | `weather/README.md` |
| `financials/<YYYY>.md` | HOA year-end P&L water and landscape lines, a cross-check against bills | `financials/README.md` |
| `events.md` | Dated log of repairs, leaks, controller and landscape changes | in the file |
| `flags/<flag-id>.md` | Leak and anomaly flags with status | `flags/README.md` |
| `investments/<slug>.md` | Catalog of changes and investments that can be modeled | `investments/README.md` |
| `scenarios/<slug>.md` | Saved scenarios | `scenarios/README.md` |
| `config/site.md` | Target, thresholds, weather station, post-2027 rate assumption | in the file |
| `config/plant-factors.md` | Plant factors and irrigation efficiencies with sources | in the file |
| `INVENTORY.md` | Source files in hand and open questions | |
| `RECONCILIATION.md` | Computed vs printed bill totals (Phase 1) | |

`README.md`, `INVENTORY.md`, and `RECONCILIATION.md` files are documentation. The build parser skips them, so the example values in each README never reach the app.
