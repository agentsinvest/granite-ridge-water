---
id: park-seasonal-adjust-test
title: "Test 10% less park watering on one meter for 4 weeks"
problem: "The two park meters used 5.65 million gallons in the last 12 bills, while the park lawn should need about 3.0 to 4.4 million."
meter: park
controller: Park
stations: []
category: schedule-change
lawn_impact: changes-lawn-watering
owner: Landscaper
status: not-started
due: null
cost: 0
cost_source: "A setting change on the existing controller; assumes the landscaper's contract covers it (to confirm)"
savings_from: option:park-controller-tune-up
savings_note: "The yearly figure is for keeping the 10% cut on both park meters all year, if the 4-week test goes well."
evidence: [option:park-controller-tune-up, source:docs/analysis/2026-10-06-are-we-overwatering]
verify_with: "Logged as an experiment: daily use on the test meter drops about 10% against the 4 weeks before, with the lawn still green."
updated: 2026-10-07
history:
  - { date: 2026-10-07, status: not-started, note: "Added to the action plan" }
---

Lower the weather adjustment on the park controller by 10 points on one park meter for four weeks, then compare daily water use before and after. Get the settings printout first so the change can be undone exactly.

Turf that gets too little water goes brown and dormant and takes weeks to recover. Ask the landscaper how far the park lawn can be cut before it stresses.
