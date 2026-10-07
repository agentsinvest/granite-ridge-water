# 2026-10-07: Controller reports and the Eco Verde assessment

## Decision

* Added a `sources/controllers/` folder with full transcriptions of the Eco Verde Irrigation assessment (meeting 2026-02-16, settings 2026-03-29) and the HydroPoint WeatherTRAK alert and usage reports of 2025-04-04. Contact names, phones, emails, and street addresses are removed; controller serials are kept as last 4. The Eco Verde zone and valve map is kept as an image with the address blanked, because the image is the data.
* Matched each controller to a meter by location, not by a printed label: the four points of connection on the Eco Verde map sit where the Waterfluence Controller Map puts the four meters, and the backflow sizes agree with the meter sizes. Recorded with medium confidence in `meters/*.md` and `areas.md`:
  * meter-3: Entrance controller (WeatherTRAK LC+): entry turf (now artificial), entry and McKellips drip, west wash drip (Off).
  * meter-4: controller B (not a WeatherTRAK, make unknown): interior strip, Crismon frontage, northeast corner.
  * meter-1 and meter-2: Park controller (WeatherTRAK ETPRO3): 12 turf rotor stations and 3 drip stations (park edges, south and southeast desert). The split between the two park meters is unknown.
* Logged the entry turf to artificial turf change as a `landscape` event with year precision (2026), because the exact date is unknown. The Eco Verde text still describes turf there in February 2026.
* Linked the Eco Verde repairs to existing flags: the east park master valve leak (repair 1) is now the leading explanation for the meter-1 overnight trickle, and the broken lateral and the valve at B4 are noted on the meter-4 flag. Neither flag's status changed, because nobody has confirmed a repair.
* Added the investment "Switch the WeatherTRAK controllers to Auto mode" with a best case of 30% (the assessor's "up to 30%" from other sites), low confidence, and no cost until quoted. Updated the smart controller, flow sensor, nozzle, pressure regulation, and audit investments with what is already installed and the City incentives printed in the report.
* The spray nozzle and pressure regulation investments now note that the entry turf was the only spray zone on the property, so they likely no longer apply.
* No turf reduction lever was added, even though the report recommends exploring it; landscape conversions stay out of scope.

## Open

* Date of the entry turf conversion, and whether entrance stations 1 to 3 were turned off.
* Whether the Eco Verde repairs were made, and when.
* The rest of the Park settings report (run times) and a printout from controller B.

## Update: run times matched to Waterfluence (2026-10-07)

* Jennifer confirmed the entry became artificial turf in September 2026. The event is now month precision (2026-09).
* Compared the controller reports with Waterfluence hourly data in `docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md`. The park controller's totals match meters 1 and 2 within the proration error, and both park meters pause on the same days.
* Recorded the likely park station split (1 to 7, 14, 15 on meter-1; 8 to 12, 13 on meter-2) in the meter files as medium confidence, based on valve locations, station names, and flow. Not added as zone files yet, because square footage and run times are still unknown.
* Logged that meter-3 had no water at all from 2026-09-15, drip included, as a `schedule` event, and asked for the entrance drip to be turned back on. Not raised as a leak flag, because it is missing water, not extra water.
* The park's every-night 10 PM program (about a third of summer park water) goes into the open questions rather than into an option or saving, because its stations and minutes are unknown.

## Update: zones and controllers on the site map (2026-10-07)

* Added optional `controllers` and `zones` to `data/map.md` and the map schema. Zones are traced by hand onto the site map's own canvas from the Eco Verde map, following the area outlines already drawn, instead of transforming the Eco Verde image: an affine fit between the two maps was off by up to about 20 pixels, enough to put narrow drip strips on top of houses.
* Zone labels use the controller letter plus station (A4, B3, C13). The letter is printed on the map, in the legend, and in a table under the map, so color is never the only cue. The turned-off west wash zone is drawn with a dashed outline.
* Controller markers sit near, not exactly on, each controller so they do not hide the meter pins.
* The entry turf stations (A1 to A3) are not drawn: their outline is not on the Eco Verde map, and the entry is artificial turf since September 2026.
* A checkbox hides the zones for anyone who wants the simpler area map.
