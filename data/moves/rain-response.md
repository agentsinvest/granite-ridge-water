---
id: rain-response
title: "Stop watering right after rain"
meter: park
controller: Park
category: schedule-change
lawn_impact: none
owner: Landscaper
status: not-started
start_date: null
cost: "needs quote"
verify_with: "after the next rain of 0.25 in or more, meters 1 and 2 do not water through the rain or start again before the skip window ends"
verify_min_inches: 0.25
verify_meters: ["meter-1", "meter-2"]
why: "In summer 2026 the park usually skipped about one night after a storm, then watered again at full volume, sometimes more than before the rain. Eco Verde's February 2026 assessment found two likely causes: every station runs in User ET mode, and the rain sensor is poorly placed."
steps:
  - title: "Move the rain sensor to an open spot"
    detail: "Put it where rain falls on it freely, away from roofs, trees, and sprinkler spray, so it sees the same rain the park does."
  - title: "Set a rain pause"
    detail: "Starting point: skip at least a day after 0.25 in of rain. After 0.5 in or more, pause 2 to 4 days in summer and a week or more in winter. Adjust once we see a few storms."
  - title: "Test WeatherTRAK Auto mode on one park meter"
    detail: "Auto mode lets the controller cut watering from the weather on its own, instead of the fixed run times in User ET mode. Try it on one park meter and compare the two after the next storms."
source: "Eco Verde irrigation assessment, February 2026 (sources/controllers/eco-verde-assessment-2026.md); summer 2026 hourly meter data; rain pause starting point from Jennifer, 2026-10-07"
confidence: medium
todo: "Get a quote or a yes from the landscaper for moving the rain sensor and setting the rain pause. Set status and start_date when the work is done, so the site can check the next storm."
---

# Stop watering right after rain

When `start_date` is set, every later rain of `verify_min_inches` or more where every meter in `verify_meters` shows "Paused as it should" is marked on the site as the fix working.
