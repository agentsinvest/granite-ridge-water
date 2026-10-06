# 2026-10-06: Waterfluence settings, meter locations, and site map

## Decisions

* Adopted Waterfluence's water budget factors (Ks, Kd, Kr, IE, areas) and weather station (AZMET Encanto) as the default inputs in `config/plant-factors.md` and `config/site.md`, at medium confidence. This lets our Phase 2 budget be compared directly with Waterfluence's.
* Followed Waterfluence's formula order (effective rain subtracted from ETo before the plant factor). The spec subtracts rain after; the difference is noted in `config/plant-factors.md`.
* Recorded Waterfluence's $8.35 per thousand gallons as its cost assumption only. It is not a City of Mesa rate and is never used to price bills.
* Meter locations come from the Waterfluence Controller Map. Areas served stay `null`: every controller map shades the whole site the same.
* Mesa account numbers are stored as the last 4 digits; screenshots in `sources/` have the full numbers covered. Meter service addresses stay in `sources/` only, because they may match homeowner addresses.
* The website map is a traced schematic (`data/map.md`), not the satellite screenshots. The screenshots carry Google, Airbus, and Maxar imagery and are not cleared for a public site.
* The 2026-10-06 ENERGY STAR export replaces the 2026-09-30 one in `sources/` (it contains every earlier row unchanged plus one new period).
