# 2026-10-07: Watering schedule view from hourly reads

## Decision

Added a "Watering schedule" screen showing when each meter waters, for how long, and how many gallons, from the Waterfluence hourly AMI reads (2026-07-03 to 2026-10-06). It also models ending each night's watering 1, 2, or 3 hours earlier. Jennifer asked for this to understand the current schedule and what cutting an hour or two would do.

## What was built

* `data/hourly/<meter>/2026.md`: the hourly reads, copied row for row from `sources/waterfluence/ami-hourly-meter-N-2026.md` (sources are never parsed, so the app needs its own copy in `/data/`). Validated by Zod: read times must be in order with no repeats, and missing hours are left out, not written as zero.
* `src/engine/schedule.ts` (pure, tested in `tests/schedule.test.ts`): finds watering runs, the hour-of-day profile, the watering windows seen, the "end earlier" estimate, and re-prices real City bills with `calculateBill`.
* Three thresholds in `data/config/site.md` under `watering_schedule`, each with a source: 50 gallons marks a watering hour, up to 3 missing reads stay inside one run, and 80% of runs must be fully read before gallons are measured directly.

## How "end earlier" is estimated

* Meter 2 has every hour read on 64 of 66 runs, so its estimate is measured: gallons in the last hours of each run over all run gallons. Ending 1 hour earlier saves about 16%, about $366 on the Jul 16 to Aug 12 bill.
* Meter 1 is missing the 11 PM and midnight reads on about half the nights, and the nights with every hour read are mostly the short ones. Measuring gallons from them would be biased (it gave 42% for 1 hour), so meter 1 uses the share of watering hours removed instead, assuming the same flow every hour (about 25% for 1 hour). This is labeled rough and low confidence. Checked on meter 2: the hours shortcut gives 25% where the measured answer is 16%, so it tends to run high.
* Meters 3 and 4 usually show watering in a single hourly read, which can be a run of a few minutes. Hourly data cannot show what ending an hour earlier would do there, so no number is shown. Their hourly reads also add up to only 55% and 22% of billed gallons.
* Dollars are shown only for reconciled City bills whose read period falls inside the hourly data (today only Jul 16 to Aug 12), re-priced with the same calculator the reconciliation uses. No annual figure is shown, because one summer bill says little about winter.

## Open questions

* Whether a read time marks the start or end of its hour (times may be an hour early). Ask Waterfluence.
* Why late-night reads drop out on meters 1, 3, and 4, and whether the read after a gap includes the missing hours.
* Which zones water last on each meter (needed to say which plants an earlier end would affect). Needs the controller program and zone list.
* A full year of hourly reads would let the estimate cover winter.
