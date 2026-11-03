---
id: meter-1
name: "East park"
name_source: "Jennifer, redesign brief of 2026-10-07"
account_last4: "8651"
meter_number_last4: "8300"
size_inches: 1.5
size_source: "Jennifer's water model workbook, Meters table (sources/workbook/water-model-2026-10-07.md). Consistent with the service charge: the two meters listed at the same size pay the same charge."
turf_share_percent:
  value: 88
  source: "Jennifer's water model workbook, Meters table: share of this meter's water that flows at sprinkler-level rates in the hourly smart-meter data"
  confidence: medium
service_type: null
waterfluence_id: "MESA-437"
location: "East side, at the northeast corner of the park, west of the east street"
areas_served: ["park-green", "west-south-desert"]
areas_served_note: "The east half of the park lawn, and drip for the trees and shrubs along the park's east and south edges and the southeast corner. Which park stations are on this meter is a best match from the assessment map, not yet confirmed."
areas_served_source: "Eco Verde assessment map, 2026 (sources/controllers/eco-verde-assessment-2026.md); Jennifer, 2026-10-06"
controller:
  name: "Park controller"
  model: "WeatherTRAK ETPRO3 smart controller"
  summary: "One controller runs both park meters. On this meter, most likely turf stations 1 to 7 (east side of the park) and drip stations 14 and 15. Every station is set to User ET mode: the landscaper sets the run times and the controller adjusts them for the weather. Has a master valve, a flow sensor, and a rain sensor."
  source: "Eco Verde irrigation assessment, 2026 (sources/controllers/eco-verde-assessment-2026.md); HydroPoint reports of 2025-04-04; station split from docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md"
  confidence: medium
checks:
  - kind: question
    title: "What does the park water every night at about 10 PM?"
    detail: "Besides the early-morning turf watering 5 days a week, the park also waters every night at about 10 PM. On this meter that is about 2,400 gallons a night (July to September 2026). It may be the drip around the park. The controller pages that would say are not on file yet. Partly answered by the WeatherTRAK alert times: the drip on this meter runs in the evening (station C14 around 9 to 10 PM, station C15 around 10:20 to 10:45 PM), and on many summer Sunday nights a lawn station (C1, C2, or C4) runs at the same time as C14, between about 10 PM and midnight."
    source: "docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md; sources/controllers/weathertrak-usage-park-2024-2025.md and sources/controllers/weathertrak-usage-park-2025-2026.md (alert lists)"
    confidence: medium
  - kind: action
    title: "The park controller's water-main break alarm goes off most summer Sundays"
    detail: "The park controller raised its most serious alarm, Mainline Break, 19 times: 7 in June and July 2025 and 12 from April to September 2026, 15 of them on a Sunday night, all between 10 PM and 1 AM. Each time the flow was 90 to 99 gallons a minute against a limit of 90, with drip station C14 running at the same time as lawn station C1, C2, or C4. Those two stations together use about 90 to 100 gallons a minute, so this looks like two stations scheduled at once, not a broken pipe, and the daily totals do not show the watering stopping. But an alarm that goes off every week gets ignored, which is how a real break would be missed. Ask the landscaper to stop C14 overlapping the lawn stations, or set the limit to fit, so the alarm only goes off for a real break."
    source: "sources/controllers/weathertrak-usage-park-2024-2025.md and sources/controllers/weathertrak-usage-park-2025-2026.md (alert lists); station flows from Eco Verde assessment page 5"
    confidence: medium
active_from: null
active_to: null
source: "Meter numbers from Waterfluence exports, 2026-09-30. Account last 4 and location from the Waterfluence Controller Map (sources/waterfluence/landscape-and-controller-maps.md). Labels meter-1 to meter-4 are labels only: meter-1 and meter-2 are the two largest users; meter-4 uses slightly more than meter-3 (1,622 vs 1,431 thousand gallons, 2023-09 to 2026-09)."
todo: "Ask what the park program that runs every night at about 10 PM is (about 2,400 gallons a night on this meter, July to September 2026). Confirm which park stations draw from this meter (its point of connection is the east (master valve MV2, backflow BF2) one on the Eco Verde map), a plain name, and service type. Confirm the meter size on a City bill (see INVENTORY.md)"
---
