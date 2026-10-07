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
