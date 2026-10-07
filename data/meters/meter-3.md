---
id: meter-3
name: null
account_last4: "8681"
meter_number_last4: "4706"
size_inches: 1
size_source: "Jennifer's water model workbook, Meters table (sources/workbook/water-model-2026-10-07.md). Consistent with the service charge: the two meters listed at the same size pay the same charge."
turf_share_percent:
  value: 0
  source: "Jennifer's water model workbook, Meters table: this meter waters no turf"
  confidence: medium
service_type: null
waterfluence_id: "MESA-437"
location: "Northwest corner, at the entry gate off McKellips Road"
areas_served: ["perimeter", "west-south-desert"]
areas_served_note: "The entry (now artificial turf), drip for the trees and shrubs at the entry and along McKellips, and the west wash, whose drip is turned off."
areas_served_source: "Eco Verde assessment map and settings, 2026 (sources/controllers/eco-verde-assessment-2026.md). Matched to this meter by location: its point of connection, master valve MV3, and backflow BF4 are at the entry gate where the Waterfluence Controller Map puts meter-3."
controller:
  name: "Entrance controller"
  model: "WeatherTRAK LC+ smart controller"
  summary: "Stations 1 to 3 watered the entry turf, which became artificial turf in September 2026. Drip stations 4 and 6 water the entry and McKellips trees and shrubs. Station 5 (west wash drip) is set to off. Set to User ET mode. Has a master valve and a flow sensor."
  source: "Eco Verde irrigation assessment, 2026 (sources/controllers/eco-verde-assessment-2026.md); HydroPoint reports of 2025-04-04; Jennifer, 2026-10-07"
  confidence: medium
checks:
  - kind: action
    title: "Entrance trees and shrubs have had no water since September 14"
    detail: "Meter 3 read zero in every reported hour from September 15 to October 1, including the nights the drip should run. The turf is now artificial, but drip stations 4 and 6 still water the entrance trees and shrubs. Ask the landscaper to turn those back on and leave only turf stations 1 to 3 off."
    source: "data/hourly/meter-3/2026.md; docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md"
    confidence: medium
active_from: null
active_to: null
source: "Meter numbers from Waterfluence exports, 2026-09-30. Account last 4 and location from the Waterfluence Controller Map (sources/waterfluence/landscape-and-controller-maps.md). Labels meter-1 to meter-4 are labels only: meter-1 and meter-2 are the two largest users; meter-4 uses slightly more than meter-3 (1,622 vs 1,431 thousand gallons, 2023-09 to 2026-09)."
todo: "No water at all on this meter from 2026-09-15 to 10-01, including the drip that waters the entrance trees and shrubs. Ask the landscaper to turn drip stations 4 and 6 back on and leave only turf stations 1 to 3 off. Need a plain name and service type. Confirm the meter size on a City bill (see INVENTORY.md)"
---
