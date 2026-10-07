---
id: meter-2
name: "West park"
name_source: "Jennifer, redesign brief of 2026-10-07"
account_last4: "8671"
meter_number_last4: "4031"
size_inches: 1.5
size_source: "Jennifer's water model workbook, Meters table (sources/workbook/water-model-2026-10-07.md). Consistent with the service charge: the two meters listed at the same size pay the same charge."
turf_share_percent:
  value: 90
  source: "Jennifer's water model workbook, Meters table: share of this meter's water that flows at sprinkler-level rates in the hourly smart-meter data"
  confidence: medium
service_type: null
waterfluence_id: "MESA-437"
location: "West side, at the northwest corner of the park, east of the curving west street"
areas_served: ["park-green", "west-south-desert"]
areas_served_note: "The west half of the park lawn, and drip for the trees and shrubs along the south and southwest desert. Which park stations are on this meter is a best match from the assessment map, not yet confirmed."
areas_served_source: "Eco Verde assessment map, 2026 (sources/controllers/eco-verde-assessment-2026.md); Jennifer, 2026-10-06"
controller:
  name: "Park controller"
  model: "WeatherTRAK ETPRO3 smart controller"
  summary: "One controller runs both park meters. On this meter, most likely turf stations 8 to 12 (west side of the park) and drip station 13. Every station is set to User ET mode: the landscaper sets the run times and the controller adjusts them for the weather. Has a master valve, a flow sensor, and a rain sensor."
  source: "Eco Verde irrigation assessment, 2026 (sources/controllers/eco-verde-assessment-2026.md); HydroPoint reports of 2025-04-04; station split from docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md"
  confidence: medium
checks:
  - kind: question
    title: "What does the park water every night at about 10 PM?"
    detail: "Besides the early-morning turf watering 5 days a week, the park also waters every night at about 10 PM. On this meter that is about 5,500 gallons a night, about half of this meter's water (July to September 2026). The controller pages that would say what it is are not on file yet."
    source: "docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md"
    confidence: medium
active_from: null
active_to: null
source: "Meter numbers from Waterfluence exports, 2026-09-30. Account last 4 and location from the Waterfluence Controller Map (sources/waterfluence/landscape-and-controller-maps.md). Labels meter-1 to meter-4 are labels only: meter-1 and meter-2 are the two largest users; meter-4 uses slightly more than meter-3 (1,622 vs 1,431 thousand gallons, 2023-09 to 2026-09)."
todo: "Ask what the park program that runs every night at about 10 PM is (about 5,500 gallons a night on this meter, about half its water, July to September 2026). Confirm which park stations draw from this meter (its point of connection is the west (master valve MV1, backflow BF1) one on the Eco Verde map), a plain name, and service type. Confirm the meter size on a City bill (see INVENTORY.md)"
---
