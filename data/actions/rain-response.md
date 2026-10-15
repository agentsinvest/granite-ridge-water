---
id: rain-response
title: "Stop watering right after rain"
problem: "The park controller does not respond well to rain: in summer 2026 the park usually skipped about one night after a storm, then watered again at full volume, sometimes more than before the rain."
meter: park
controller: Park
stations: []
category: schedule-change
lawn_impact: none
owner: Landscaper
status: not-started
due: null
cost: "needs quote"
cost_source: "Moving the rain sensor and setting a rain pause need a quote or a yes from the landscaper"
evidence: [source:sources/controllers/eco-verde-assessment-2026, investment:weathertrak-auto-mode]
verify_with: "after the next rain of 0.25 in or more, meters 1 and 2 do not water through the rain or start again before the skip window ends"
updated: 2026-10-07
history:
  - { date: 2026-10-07, status: not-started, note: "Added to the action plan" }
---

Eco Verde's February 2026 assessment found two likely causes: every park station runs on run times the landscaper sets by hand, and the rain sensor is poorly placed. The "Watering after rain" section on the Problems screen lists every rain since July 2026 and what each meter did.

Three steps, in order:

* Move the rain sensor to an open spot, away from roofs, trees, and sprinkler spray, so it sees the same rain the park does.
* Set a rain pause. Starting point: skip at least a day after 0.25 in of rain. After 0.5 in or more, pause 2 to 4 days in summer and a week or more in winter. Adjust once we see a few storms.
* Test automatic weather mode on one park meter, so the controller cuts watering from the weather on its own, and compare the two park meters after the next storms.

Once this is done, every later rain of 0.25 in or more where both park meters pause as they should is marked on the Problems screen as the fix working.
