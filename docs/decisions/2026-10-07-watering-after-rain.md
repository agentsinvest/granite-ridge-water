# 2026-10-07: "Watering after rain" check

## Decision

* Added a check of every rain event since July 1, 2026 on all four meters: did the meter water through the rain, start again before the rain was used up, or pause? It sits on the Meters and leaks screen, with a one-line summary on Overview, a card on Recommended moves, and a CSV at `/data/watering-after-rain.csv` built from the same numbers.
* Weather is stored as markdown like every other data file: `weather/daily-rain/<YYYY>.md` (NOAA ACIS, COOP East Mesa) and `weather/daily-eto/<YYYY>.md` (AZMET Queen Creek, `eto_pen_mon_in`), written by `scripts/fetch-weather.mjs`. A trace counts as 0. A missing day stays blank and is never read as dry; it also ends an event. The rain file stores the 6-digit COOP number (022782) instead of the ACIS id, because the public-site check allows no digit run over 6 in `/data`.
* All settings are in `config/site.md` under `rain_check`, with Jennifer's defaults: event 0.20 in, 75% usable, capped at 1.5 in, plant factors 0.6 / 0.8 (park, summer / winter) and 0.3 (drip), window cap 7 days summer and 14 winter, already off after 7 dry days.
* Days covered counts whole days only. A night's watering serves the next day, so the nights that count are the night of the rain up to the night before the last covered day. With that rule, days early is always 1 or more for a "started again too soon" result.
* Watering uses the schedule screen's run rule (`findRuns`, 50 gallons an hour, gaps up to 3 hours). Added one filter for this check only: a run must start between 6 PM and 8 AM. Without it, a single 171-gallon hour at 1 PM on Aug 31 on meter 1 would have turned the Aug 31 storm into "watered through the rain". Every controller program in the hourly data starts between 8 PM and 5 AM.
* A skip window ends the day before the next rain event starts, so no night is counted twice.
* Cost reuses the leak-cost method (`episodeCost`): the bill with the water minus the bill without it, or a block 1 to block 2 range while the bill is not in. No new pricing code.
* Until daily ETo is fetched, the check uses the Queen Creek monthly normals already on file (`weather/monthly-normals.md`), spread evenly over the month, and the page says so.
* The action "Stop watering right after rain" is `moves/rain-response.md`, because `/data/actions/` does not exist yet. When the redesign adds it, the file moves there unchanged. Once `start_date` is set, a later rain of 0.25 in or more where meters 1 and 2 both pause is shown as the fix working.
* No bill, rate, leak, or budget calculation changed.

## Verified

Against the real hourly data, using the rain amounts given for the test cases and the monthly-normal ETo (tests/rainResponse.test.ts):

* Aug 31, 0.83 in: both park meters started again too soon on Sep 2, 2 days early (rain covered 4 days).
* Jul 21, 0.68 in: meter 1 watered the night of the rain and meter 2 the next night: watered through the rain.
* Jul 17, 0.44 in: both park meters paused.

## Open

* The daily rain and ETo files are empty: this session's network blocked data.rcc-acis.org and api.azmet.arizona.edu. Run `node scripts/fetch-weather.mjs` and commit.
* Sep 15 to 16 storm: the expected "already off" does not follow from the hourly data with a 7-day look-back. Both park meters watered full turf nights on Sep 9 and 10. Meter 1 also ran its short 10 PM program on Sep 11 and 13 and on the night of Sep 15; meter 2 ran short programs on Sep 11 and 13. Decide whether "already off" should ignore the short 10 PM program, or use a shorter look-back.
