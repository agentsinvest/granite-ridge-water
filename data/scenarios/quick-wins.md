---
id: quick-wins
name: "Quick wins plan"
kind: quick_wins_plan
source: "Jennifer's Zone Plan Model, Quick Wins tab, section 3 The plan: levers by year (sources/workbook/zone-plan-model.md)"
confidence: low
created_on: 2026-10-07
years: [2027, 2028, 2029, 2030]
levers:
  leak_repair_cut_percent:
    label: "Leak repair and wet check"
    by_year: [5, 5, 5, 5]
    applies_to: all_water
    why: "Fix heads, valves, and laterals. The hourly data shows small daytime flows and odd one-off runs."
    investment: irrigation-audit-leak-repair
    source: "Zone Plan Model, Quick Wins lever: cut in all water"
    confidence: low
  controller_cut_percent:
    label: "Smart controller with rain shutoff"
    by_year: [10, 10, 10, 10]
    applies_to: all_water
    why: "Today the controllers water full schedules after storms. One controller runs everything; Mesa pays 50% (up to $2,000)."
    investment: smart-et-controller
    source: "Zone Plan Model, Quick Wins lever: cut in all water"
    confidence: low
  stop_overseeding:
    label: "Stop winter overseeding"
    by_year: [true, true, true, true]
    applies_to: turf
    why: "Bermuda goes tan December to February but the green stays."
    source: "Zone Plan Model, Quick Wins lever"
    confidence: medium
  winter_turf_percent:
    label: "Winter turf water when not overseeding (percent of today)"
    by_year: [20, 20, 20, 20]
    months: [11, 12, 1, 2]
    applies_to: turf
    why: "Dormant Bermuda needs only occasional water."
    source: "Zone Plan Model, Quick Wins lever"
    confidence: low
  october_turf_percent:
    label: "October turf water when not overseeding (percent of today)"
    by_year: [60, 60, 60, 60]
    months: [10]
    applies_to: turf
    why: "No germination watering for winter rye."
    source: "Zone Plan Model, Quick Wins lever"
    confidence: low
  summer_turf_percent:
    label: "Summer turf water, May to September (percent of today)"
    by_year: [85, 75, 70, 70]
    months: [5, 6, 7, 8, 9]
    applies_to: turf
    why: "Step down a little each year and check against the turf healthy minimum."
    source: "Zone Plan Model, Quick Wins lever"
    confidence: low
  desert_drip_percent:
    label: "Desert drip, every meter (percent of today)"
    by_year: [75, 50, 35, 25]
    applies_to: drip
    why: "Established natives need little or no drip. Step down and watch the plants."
    source: "Zone Plan Model, Quick Wins lever"
    confidence: low
controller_rebate:
  share: 0.5
  cap_usd: 2000
  source: "Zone Plan Model, Quick Wins lever note: Mesa pays 50% of a smart controller, up to $2,000"
  confidence: low
  todo: "Confirm the program, its terms, and that it applies to an HOA with City of Mesa."
overseeding_cost:
  source: "HOA year-end books, account 51110 Landscape - Overseeding (data/financials/)"
  note: "Stopping overseeding also ends this landscape line, separate from the water bill."
proposed_2027_prices:
  status: proposed
  label: "City of Mesa proposed FY26/27 landscape water prices (not adopted)"
  source: "Zone Plan Model, Quick Wins assumptions: proposed FY26/27 usage $5.95 plus 15%, peak surcharge $2.99 plus 15% up to 150% of the winter average and plus 25% above it, drought charge $0.13, service charge plus 3.5%. The City proposal itself is not in the repo."
  confidence: low
  usage_price: 6.8425
  tier1_surcharge: 3.4385
  tier1_limit_multiple_of_winter_average: 1.5
  tier2_surcharge: 3.7375
  drought_per_kgal: 0.13
  service_increase_percent: 3.5
  todo: "Get the City's FY26/27 rate proposal or adopted rate book and replace these with its numbers."
notes: "The workbook raises prices 10% a year after 2027. This plan holds 2027 prices flat after 2027, the site default in config/site.md."
---

# Quick wins plan

No-construction steps from Jennifer's Zone Plan Model, applied in order to each meter's latest 12 months of metered use. Each meter's water is split into turf and desert drip by its turf share (meter files). Rain gardens, rainwater harvesting, and landscape conversion are out of scope.
