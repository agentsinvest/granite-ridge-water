# Redesign inventory: current screens (2026-10-07)

Step 0 of the "action first" redesign. This is a snapshot of the site as it stands on `main` (commit 89b7b7c), before any changes.

The router is `src/App.tsx` (the `SCREENS` list) plus `src/lib/route.ts` (hash routes, the `ROUTES` list, and one existing redirect from `#what-if` to `#invest`). Every screen gets `data` (the JSON from `scripts/build-data.ts`). Most also get `model`, built once by `src/lib/model.ts` from `data.meters`, `data.bills`, `data.rates`, `data.billingPeriods`, `data.areas`, `data.options`, `data.investments`, and `data.config`.

The homeowner questions are numbered as in the brief: **Q1** what it costs and what that means per home, **Q2** on track to $30,000, **Q3** what is broken now, **Q4** what is being done and by whom, **Q5** did the last change work. (The brief says "four questions" but lists five, so this table uses all five.)

## Screens

| # | Hash | Menu label | Component | Data files it reads | Answers | Moves to |
|---|---|---|---|---|---|---|
| 1 | `#overview` | Overview | `src/pages/Overview.tsx` | bills, meters (incl. `checks`), financials, experiments, plus model (rates, site config, options, investments, flags) | Q1 (12-bill total), Q2 (gap to target), Q3 (possible leaks, watering checks), Q5 (experiments, partly). Q4 only as "What to do first" with no owner or status. | Home |
| 2 | `#history` | How we got here | `src/pages/HowWeGotHere.tsx` | bills, meters, financials, events, history/by-meter-year, weather/annual-rainfall, rates | Q1 (cost by year, price vs volume vs fees) | History and bills |
| 3 | `#meters` | Meters and leaks | `src/pages/MetersAndAreas.tsx`, `src/components/LeakFlags.tsx`, `src/components/SiteMap.tsx` | meters (incl. `checks`), areas, map (controllers A/B/C and zones), billing-periods, bills, usage, flags, rates, config | Q3 (leak flags with cost so far, watering checks), Q1 by meter | Flags and checks go to Problems. Meter cards, map, and areas go to Where the water goes |
| 4 | `#schedule` | Watering schedule | `src/pages/Schedule.tsx` | hourly (AMI reads), billing-periods, bills, meters, rates, config/site (watering_schedule) | Q3 (watering at odd hours), partly | Where the water goes |
| 5 | `#budget` | How much should we use | `src/pages/HowMuch.tsx` | budget/annual-check, budget/turf-minimum, weather/monthly-normals, meters, plus model rates and periods | Q3 (over need), partly | Where the water goes |
| 6 | `#whatif` | What if | `src/pages/WhatIf.tsx` | options, investments, plus model (baseline, flags, greenspace meters, rates) | None directly; it is the "what if we..." tool | Savings calculator |
| 7 | `#quickwins` | Quick wins | `src/pages/QuickWins.tsx` | scenarios/quick-wins, investments, meters, financials, weather/monthly-normals, budget/turf-minimum, config/site | Q2 (plan to reach target), Q4 (steps by year, no owner) | Action plan (the plan output stays reachable, numbers unchanged) |
| 8 | `#invest` (old `#what-if`) | Is an investment worth it? | `src/pages/Investment.tsx` | investments, rates, bills, billing-periods, flags, meters, config | None directly; payback tool | Savings calculator |
| 9 | `#moves` | Recommended moves | `src/pages/Moves.tsx` | model only (`buildMoves`, `rankMoves`: flags, options, investments) | Q4 partly (ranked list, no owner or status), Q3 (leaks first) | Action plan |
| 10 | `#experiments` | Experiments | `src/pages/Experiments.tsx` | experiments, usage, config/site (experiment_check) | Q5 | Savings calculator, tab "Did it work?" |
| 11 | `#bills` | Bills | `src/pages/Bills.tsx` | bills, meters, financials | Q1 | History and bills |
| 12 | `#data` | Data and accuracy | `src/pages/DataAccuracy.tsx` | bills, rates, usage, financials, investments, data-needs, weather, open `todo:` notes from every file | None for homeowners | About the data (footer link) |

Shared pieces: `src/components/ui.tsx` (PageHeader, Section, Stat, Pill, Sure disclosure, TableView "show as a table"), `src/components/charts.tsx` (Bars, Lines, Waterfall), `src/lib/data.ts` (`fmt`, `meterNumber`).

## Data the redesign builds on

* `data/flags/` 5 flags: meter 4 constant flow (2023), meter 4 winter use (2025), meter 1 trickle (2026-07), meter 1 step change (2026-08), meter 4 step change (2026-09, manual).
* `data/meters/meter-*.md` include `checks:` (the "Watering checks"). Meter 1 is named "Entry and north parkway"; meters 2 to 4 have `name: null`.
* `data/options/` 4 watering changes (park tune-up, park summer back to 2022, park winter overseed trim, meter 4 winter seasonal adjust).
* `data/investments/` 8 catalog items, including flow sensor and master valve, and WeatherTRAK Auto mode.
* `data/experiments/` 1 experiment: meter 4 valve repair.
* `data/scenarios/quick-wins.md` the Quick wins plan.
* `data/config/site.md` has `homes: 56` and the $30,000 target.
* `data/map.md` has controllers A (Entrance, meter 3), B (meter 4), C (Park, meters 1 and 2) and their zones.
* `data/zones/` has only a README, no zone files.
* Controller detail lives in `sources/controllers/` (Eco Verde assessment, HydroPoint reports), not in `/data`.

## Maintainer text that renders publicly today

Found by searching `src/` and the data fields the pages print:

* `src/pages/Experiments.tsx` lines 50 and 89 print `data/experiments/` and `data/config/site.md`.
* `src/pages/Schedule.tsx` lines 41 and 49 print `data/config/site.md` and `data/hourly`.
* `data/config/site.md`, `data/meters/meter-1.md` to `meter-4.md`, `data/events.md`, and several `data/investments/*.md` contain "Fill value", INVENTORY, or CLAUDE.md wording in fields that some screens show (todo notes, sources, catalog notes).
* `src/pages/DataAccuracy.tsx` "Open notes in the data files" lists file paths by design.

## Things to settle before Step 1

1. **Branch.** This session is assigned `claude/wonderful-pasteur-kiting`, and CLAUDE.md says to use an assigned branch. I am working there instead of `redesign/action-first`. Say so if you want the other name.
2. **Controller files are in `/sources`, not `/data/sources`.** CLAUDE.md says `/sources` is never parsed or deployed. For the zone table (Task 4) I plan to add `data/controllers/<id>.md` with one station table per controller, each value cited to the Eco Verde or HydroPoint page it came from, and unknowns as `null`.
3. **Controller names.** `data/map.md` uses A, B, C. The brief uses Park, Entrance, B. I will show A as "Entrance", C as "Park", and B as "Controller B", and keep the ids.
4. **Meter names.** Meters 2 to 4 have no name on file, and meter 1's file says "Entry and north parkway" while the brief says "East park". I will set the four names from the brief (`East park`, `West park`, `Entrance`, `East side near June St`) in the meter files, sourced to your brief of 2026-10-07. Correct me if meter 1's current name is the right one.
5. **Greenspace toggle vs CLAUDE.md.** CLAUDE.md says greenspace is hidden unless toggled on (Phase 5 and Phase 6). The brief removes the toggle and adds a lawn badge. I will follow the brief, log it in `docs/decisions/`, and update CLAUDE.md to match. The ranking math stays the same; it is just called with greenspace included.
6. **Decision log location.** Your preferences point to `company-brain/` in Cowork, which this cloud container cannot reach. Decisions for this work go to `docs/decisions/` in the repo, as CLAUDE.md says.
