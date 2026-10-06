# Data inventory

Status as of 2026-10-06: **no source data received yet.** Phase 1 (bill conversion and reconciliation) cannot start until the bills and rate documents below are in `/raw/`.

Originals go in `/raw/` (git-ignored, never deployed). Only public-safe extracts go in `/data/`.

## Source files in hand

| File in /raw/ | What it is | Meter | Date range | Converted to | Notes |
|---|---|---|---|---|---|
| (none yet) | | | | | |

## Coverage by meter

| Meter | Bills (target: 5 years, about 60 per meter) | Waterfluence daily usage | Meter facts | Zones mapped |
|---|---|---|---|---|
| meter-1 | 0 | none | missing | none |
| meter-2 | 0 | none | missing | none |
| meter-3 | 0 | none | missing | none |
| meter-4 | 0 | none | missing | none |

## What we need from Jennifer

Ranked by what unblocks the most. Items 1 and 2 are required before any engine work.

1. **City of Mesa bills, 5 years, all 4 meters.** PDFs or exports from the Mesa utility portal. Every page, including any page with rate or fee notices. About 240 bills total if billed monthly.
2. **City of Mesa rate schedules.** Published rates and fees for irrigation / landscape water for 2025, 2026, and 2027 (the adopted schedule and any approved future increases). Older schedules back to 2021 if available. If older ones cannot be found, we will derive them from bills and mark them "derived."
3. **Waterfluence exports per meter.** Daily usage for the full history available, as CSV if possible. Include Waterfluence's own budget column if it has one.
4. **Meter facts.** For each meter: a plain name (for example, "entry" or "north greenspace"), last 4 of the Mesa account, meter size, service type as Mesa lists it, and which controller and stations it feeds.
5. **Zone list with schedules.** For each controller station: what it waters, plant type, irrigation type (spray, rotor, drip, bubbler), approximate square footage, whether it has trees, whether it is turf greenspace, and the current schedule (days, run minutes, start times, seasonal adjust). A landscaper's zone map or controller printout works.
6. **Neighborhood areas.** How you think about the parts of the neighborhood (entry, parkways, greenspace, and so on) and which zones belong to each.
7. **Event history.** Dates of leak finds and repairs, controller replacements or schedule changes, landscape changes, overseeding, and any meter changes. Rough dates are fine; mark them approximate.
8. **Quotes.** Any quotes or proposals for controllers, flow sensors, nozzles, audits, or other investments.

## Open questions

1. Is each meter billed monthly, and on what read cycle? Does it differ by meter?
2. Do the 4 meters share one Mesa account or have separate accounts?
3. Were all 4 meters in service for the full 5 years, or was any meter added (the spec mentions "new meters and fees" as a possible cost driver)?
4. Does Mesa bill irrigation meters on a flat volumetric rate, tiers, or seasonal rates? (Answer from the rate documents, not assumed.)
5. How does Mesa bill a period that crosses a rate change: prorated or at the rate in effect at period end? (If the documents are silent, we test both against real bills.)
6. Which taxes and fees appear on the bills, and which charges are they applied to?
7. Does Waterfluence calculate its own water budget, and which weather source does it use?
8. Which AZMET station is closest and representative for Granite Ridge? (To confirm against the AZMET station list before backfilling weather.)
9. Is the turf warm-season (Bermuda) with winter rye overseed, or not overseeded?
10. Who is the landscaper, and do they have a zone map with square footage? (Name stays out of `/data/`; we only need the map.)
11. Which plant factor and efficiency source does the HOA want to treat as authoritative (for example WUCOLS, ADWR, AMWUA, or the landscaper)?

## Unknown values in /data/ right now

Every field below is `null` with a `todo` note until a source is in hand.

* `meters/meter-1.md` to `meter-4.md`: all facts.
* `areas.md`: all areas.
* `events.md`: all events.
* `config/site.md`: AZMET station.
* `config/plant-factors.md`: all plant factors, minimums, efficiencies, and the effective rainfall method.
* `investments/*.md`: all effect values, ranges, costs, and lifespans (7 entries).
