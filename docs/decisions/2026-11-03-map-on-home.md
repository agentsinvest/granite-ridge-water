# Map moves to Home, with problem markers and install dates

Date: 2026-11-03. Asked for by Jennifer.

* The site map moved from Where the water goes, Meters, to the Home page, right after Fix now. The Meters tab keeps a link to it. Its tab is now called Meters.
* Every current problem is a red ! marker on the map: each active leak flag (circle) and each watering check with `kind: action` (diamond). Open questions are not markers. Hover, focus, or tap shows the status, title, and the first one or two sentences; selecting it opens that problem on the Problems screen (`#problems/<flag-id>` or `#problems/check-<id>`). Markers sit next to the zone of the first station the problem names (`zones` on flags, `stations` on checks), otherwise next to the meter pin, side by side when several share a spot. The old ! badge on meter pins is dropped when markers are shown.
* Install dates: meters carry `installed` as a window of possible days, from the bill where the meter number changed. Only meter 3 has an exact day (2025-04-30). No document gives a controller install date, so controllers show "not on file" and, where a WeatherTRAK report proves it, the earliest day it was working.
* Placement and wording live in `src/lib/mapAlerts.ts` (pure, tested in `tests/mapAlerts.test.ts`).
