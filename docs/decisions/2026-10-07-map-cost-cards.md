# 2026-10-07: Cost cards on the map for meters and zones

## Decision

Jennifer asked to hover over the controller map and see what each zone and each meter cost, year to date and in 2025. The map now shows a cost card when you hover over, tap, or tab to a meter pin or a watering zone.

* **Meters: exact.** The card adds up the printed totals of the City bills on file for that meter, by bill date: the latest bill year so far (today 2026, bills through August) and the full year before it (2025). Months with no bill on file are named, and bills not yet checked against City prices are counted, so a partial total is never shown as complete. Every meter is missing one or two 2025 bills today.
* **Zones: the meter's cost, labeled as such.** Zones are not metered. No zone today has both station run times and flow rates on file (the park has flows but no run times, the entrance has run times but no flows, controller B has neither), so any split of a bill by zone would be a guess. The zone card names the meters its water goes through, lists the other stations that share them, and shows those meters' cost as "the whole meter, not this zone alone." Only a zone that is the only thing running on its meters would get the meter's cost as its own; none does today.
* **Park station split is flagged as likely.** Which park stations are on meter 1 vs meter 2 comes from the run-time analysis (medium confidence), so park zone cards say it is not yet confirmed.

## What was built

* `src/engine/mapCost.ts` (pure, tested in `tests/mapCost.test.ts`): bill totals by meter and year with missing months, which meters a zone is on and what shares them, and station range text.
* `data/map.md`: each zone now lists its `stations`. The build fails if a station is not in `data/controllers/`.
* `src/components/MapCostCard.tsx` and `SiteMap.tsx`: the card. It stays open while the pointer moves onto it and closes with Escape. Zones are keyboard focusable. On screens narrower than 560px the card sits under the map instead of covering it.
* Meters and map screen: a "What each meter cost, as a table" disclosure with the same numbers, for anyone who cannot use the hover card.

## What would let zones get their own cost

The park controller settings pages (run minutes per station), station flow rates for the entrance, and a settings printout and flows for controller B. With run minutes, days, and flow per station, a meter's gallons can be split by station and priced. The fixed service charge would still belong to the meter, not a zone.
