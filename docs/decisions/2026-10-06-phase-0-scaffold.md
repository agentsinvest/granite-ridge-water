# 2026-10-06: Phase 0 scaffold

## Decision

Start with the data layout and inventory, not app code. Committed:

* `CLAUDE.md` with the build spec so every session follows the same rules.
* `/data/` folder structure with a format README and one example per folder.
* Seed files with every unknown value set to `null` and a `todo`: 4 meters, areas, events, site config, plant factors, and the 7 investment catalog entries.
* `/data/INVENTORY.md` with the data request and open questions.
* `.gitignore` excluding `/raw/` and all PDFs; `public/robots.txt` disallowing all crawlers.

## Why

The spec makes accuracy the top priority and gates all projections on 95% bill reconciliation. No bills or rate schedules are in the repo yet, so writing engine code now would mean coding against guessed rate structures.

## Details

* README example values are placeholders (0.00 or null), not real Mesa prices. The build parser skips README, INVENTORY, and RECONCILIATION files so examples never reach the app.
* Known settings come straight from the spec, with the spec cited as the source: $30,000 target, $1.00 reconciliation tolerance, 95% pass rate, 25% over-budget threshold for 2 periods, 15% Waterfluence disagreement, hold 2027 rates flat after 2027.
* No plant factors, efficiencies, AZMET station, or investment values were filled in, because none had a cited source yet.
