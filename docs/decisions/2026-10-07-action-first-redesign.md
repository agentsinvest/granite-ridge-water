# Action-first redesign for homeowners (2026-10-07)

## Decision

Regroup the 12 screens into 5 menu screens plus About the data, add an action tracking layer in `/data/actions/`, and write every screen for homeowners rather than the board. No calculation, rate, bill, flag rule, or chart math changes; new views call the existing functions.

| New screen | Hash | Tabs (old screen) |
|---|---|---|
| Home | `#home` | Overview |
| Action plan | `#plan` | Actions (Recommended moves), Plan to reach the target (Quick wins) |
| Problems | `#problems` | Possible leaks and watering checks (from Meters and leaks) |
| Where the water goes | `#water` | Meters and map, When it waters (Watering schedule), How much should we use |
| Savings calculator | `#calculator` | What if we..., Is an investment worth it?, Did it work? (Experiments) |
| History and bills | `#history` | How we got here, Bills |
| About the data | `#about` (footer link) | Data and accuracy |

Each tab is its own address (`?tab=`). Every old hash redirects (`src/lib/route.ts`, tested in `tests/route.test.ts`): `#meters/<flag id>` and the leak and check headings go to Problems, other `#meters` links go to Where the water goes.

## Why

Homeowners open the site once from a link, on a phone. They need to see in 30 seconds what it costs them, whether we are on track, what is broken, who is fixing it, and whether the last change worked. The old site had the answers spread over 12 screens and mixed in maintainer notes.

## Choices made with Jennifer (2026-10-07)

* Work stays on the session branch rather than `redesign/action-first`.
* Controller detail is transcribed from `/sources/controllers/` into new `/data/controllers/` files (`/sources` is never parsed or deployed).
* Meter names come from the brief: Meter 1 East park, Meter 2 West park, Meter 3 Entrance, Meter 4 East side near June St.
* The greenspace toggle is removed. Every action shows a lawn impact badge instead. This replaces the CLAUDE.md rule that greenspace options are hidden unless toggled on.

## What was built

* `/data/actions/` (one file per action) and `/data/controllers/` (station tables transcribed from the Eco Verde and HydroPoint documents), both validated by `scripts/build-data.ts`.
* Action savings come from the existing calculators through `savings_from`; the progress bands combine watering changes with `runScenario`, so overlapping changes are not double counted.
* Home, Action plan, action pages, Controllers and zones, and the landscaper checklist (print CSS only).
* Data prose is cleaned for homeowners at load (`src/lib/publicText.ts`); `?maintainer=1` shows the raw text.

## Checked

* Last 12 bills $50,594, over target $20,594, meter 12-bill totals $28,050 / $16,491 / $3,100 / $2,953, leak cost ranges, and every dollar figure on Quick wins, What if, History, and Bills are identical to `main` before the redesign.
* Setting one action to `verified` moves its savings into the Verified band and adds a line to What changed.
* No screen scrolls sideways at 375px. The landscaper checklist prints on 2 Letter pages.

## Open

* The built JavaScript still carries the raw data (as it did before), so file paths are in the bundle even though no public view shows them.
* Lighthouse accessibility was not run in this session.
