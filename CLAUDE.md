# Granite Ridge Water Model: Build Spec

This file is the standing spec for every Claude Code session in this repo. Follow it on every change.

## Context

Granite Ridge HOA pays City of Mesa for irrigation water on 4 common-area meters. Costs have climbed over 5 years and the HOA has been chasing leaks for about two years. The goal is to get annual common-area water spend back to roughly $30K while keeping the turf greenspace.

The app has to answer five questions in plain language for neighbors:

1. How did we get here? Where did cost growth come from: higher rates, more gallons, or new meters and fees?
2. Is anything leaking? Which meter is using more than the landscape needs, and when did it start?
3. How many gallons should we be using? A weather-based water budget per meter and per zone.
4. What if we change something? Turn water down or off in parts of the neighborhood, install smart controllers, or make any other investment, and see gallons, dollars, and payback.
5. What should we do first? A ranked list of the best options.

Out of scope for now: rain gardens, rainwater harvesting, and landscape conversions. Do not build levers, copy, or recommendations for them. The investment catalog (below) is generic, so they can be added later as data files without code changes.

Accuracy is the top priority. Simplicity for neighbors is second. Everything else is third.

## Architecture: no database, no login, markdown is the data

* All data lives as markdown files in `/data/` in this private repo. Git history is the audit trail.
* A build script (`scripts/build-data.ts`) parses every markdown file (YAML frontmatter plus markdown tables), validates it with Zod, and writes typed JSON into `src/generated/`. Any malformed or missing required value fails the build with the file name and line. Files named `README.md`, `INVENTORY.md`, and `RECONCILIATION.md` are documentation and are skipped by the parser.
* Updating data means editing markdown (by hand or via Claude Code), committing, and pushing. Netlify rebuilds automatically.
* The site is public with no login. Anyone with the link can view it.
* Stack: Vite + React + TypeScript + Tailwind + shadcn/ui, Recharts, Vitest, Zod, gray-matter. No Lovable. No database.

## Public site rules (because there is no login)

* Nothing goes into `/data/` that the HOA would not be comfortable posting publicly: no full Mesa account numbers (last 4 only), no homeowner names or addresses, no bill PDFs, no contact details.
* Raw bills and Waterfluence exports stay in `/raw/`, which is in `.gitignore` and never deployed.
* Add `<meta name="robots" content="noindex, nofollow">` and a `robots.txt` disallowing all, so the site does not show up in search results.
* Footer on every page: "Estimates are based on City of Mesa published rates and HOA records. Bills from the City are the official record."

## Data files (`/data/`)

Each folder has a `README.md` describing its format with one complete example.

```
/data/
  meters/meter-1.md ... meter-4.md        one file per meter
  zones/<zone-slug>.md                    one file per irrigation zone
  areas.md                                named parts of the neighborhood and which zones are in each
  bills/<meter>/<YYYY-MM>.md              one file per bill
  rates/<effective-start>.md              one file per City of Mesa rate period
  usage/<meter>/<YYYY>.md                 Waterfluence daily totals, one table per year
  weather/<YYYY>.md                       AZMET daily ETo and rain, one table per year
  events.md                               dated log: repairs, leaks, controller and landscape changes
  financials/<YYYY>.md                    HOA year-end P&L water and landscape lines (cross-check only; bills are the record)
  flags/<flag-id>.md                      leak flags with status
  investments/<investment-slug>.md        catalog of changes and investments that can be modeled
  scenarios/<scenario-slug>.md            saved scenarios
  config/plant-factors.md                 plant factors and irrigation efficiencies with sources
  config/site.md                          annual target ($30K), thresholds, station name, post-2027 rate assumption
```

Zone files include: meter, area, name, landscape type, square footage, irrigation type (spray, rotor, drip, bubbler), controller and station, current schedule (days, run minutes, seasonal adjust), plant factor, `is_turf_greenspace`, and `has_trees`.

Rate files hold effective start and end dates, service type, fixed charge by meter size, volumetric pricing per 1,000 gallons including any tiers or seasons Mesa actually uses, other per-bill fees, and tax rates, with a `source` (document and page) on every value. Model the structure the documents show; do not assume tiers or seasons that are not there.

Rules for all data files:

* Never invent a value. Unknown values are `null` with a `todo:` note, and the UI shows them as missing.
* Every assumption (plant factor, savings percent, cost) carries a `source` and a `confidence` (high, medium, low).

## Phase 0: Data inventory (before app code)

Ask Jennifer for: 5 years of bills for all 4 meters, City of Mesa pricing guidance for 2025 to 2027 (plus older schedules if available, otherwise derive from bills and mark "derived"), Waterfluence exports per meter, meter facts (size, service type, zones served), the zone list with schedules, how she thinks about the neighborhood's areas (entry, parkways, greenspace, and so on), any quotes for controllers or other investments, and the event history.

Put the originals in `/raw/`, then write `/data/INVENTORY.md` listing every source file, date range, meter, and every gap as an open question.

## Phase 1: Convert data to markdown and reconcile (the accuracy gate)

1. Convert data. `scripts/ingest-bills.ts` extracts each bill into its markdown file. Where extraction is unreliable, write `needs_review: true` instead of guessing. Same approach for rates, Waterfluence daily usage, and zones.
2. Billing engine. `src/engine/` is pure TypeScript with no UI imports. `calculateBill(meter, periodStart, periodEnd, gallons, rates) => { lineItems, total }`. Handle billing periods that straddle a rate change the way Mesa's documents describe; if they are silent, test both proration and "rate in effect at period end" against real bills and keep whichever reconciles.
3. Reconciliation test. A Vitest suite runs every bill through `calculateBill` and compares it to `printed_total`. Pass threshold: within $1.00 per bill and every line item matched. Write `/data/RECONCILIATION.md` with computed vs actual and the delta, and set each bill's `reconciled` field.

Rule: no projections, scenarios, or savings numbers appear in the app until at least 95% of bills reconcile and every failure is explained in RECONCILIATION.md. Unreconciled bills show a visible "unreconciled" badge.

## Phase 2: Water budget (how many gallons we should use)

`src/engine/budget.ts`, using the standard landscape water requirement formula:

```
gallons needed = ETo (inches) x plant factor x area (sq ft) x 0.623 / irrigation efficiency
minus effective rainfall
```

* Weather: `npm run update-weather` pulls daily ETo and rainfall from the nearest AZMET station into `/data/weather/<YYYY>.md`. Backfill all 5 years; run monthly and commit.
* Plant factors and efficiencies come from `/data/config/plant-factors.md` with sources. Zones can override.
* If Waterfluence provides its own budget, show both and flag disagreements over 15%.
* Output per meter, area, and zone, by day and billing period: budget gallons, actual gallons, variance, and variance in dollars.

## Phase 3: Leak and anomaly detection

`src/engine/leaks.ts` runs at build time and suggests flags:

1. Over budget: actual exceeds budget by more than the threshold (default 25%) for 2+ consecutive periods.
2. Step change: a sustained jump in usage divided by ETo not explained by `events.md`.
3. Off-schedule use: usage on days the schedule says off, or during rain shutoff.
4. Never-zero baseline: daily minimum never reaches zero.
5. Winter-to-summer ratio: winter usage too close to summer relative to the ETo ratio.
6. Meter vs meter: gallons per irrigated square foot far above the other meters for similar landscape.

New suggestions are written to `/data/flags/` with `status: suggested`. Status is updated in the file (open, investigating, fixed with date, false-alarm). Fixed flags show whether usage actually dropped afterward.

## Phase 4: "How we got here" decomposition

`src/engine/decomposition.ts`. Split each year over year cost change into price effect, volume effect, and fixed and fee effect. Show a waterfall from year 1 to year 5 with `events.md` entries annotated on the timeline.

## Phase 5: "What if" modeling (changes and investments)

This is the core decision tool. `src/engine/scenarios.ts`. A scenario is a baseline plus a list of changes, each a typed and tested function.

### Baseline

Any historical year, or a "normal weather" year built from 5-year average ETo, priced under 2025, 2026, or 2027 rates. Years after 2027 use the assumption in `config/site.md` (default: hold 2027 rates flat, clearly labeled).

### Change type A: Turn water down or off by area

Pick a whole area, a meter, or individual zones (checkboxes grouped by area), then choose:

* Turn down: reduce runtime by a percent, all year or by season (summer, monsoon, winter).
* Seasonal shutoff: off for chosen months (for example, no winter overseed watering).
* Fewer watering days: change days per week.
* Turn off completely.

Results show gallons and dollars saved per month and per year, and which meter's bill changes. Because turning water off has consequences, every down or off change shows a plain-language risk note from the zone data:

* Zones with `has_trees: true`: "Trees in this zone need deep watering even if surrounding plants are turned off. Losing a mature tree costs far more than the water saved." Include an optional "keep tree watering" toggle that leaves a tree-only allowance from the plant-factor config.
* Turf zones: note dormancy and recovery time.
* Zones where the reduction drops water below the plant-factor budget minimum: flag "below estimated plant need."

Turf greenspace zones are excluded from the selector by default; a "include greenspace" toggle unlocks them.

### Change type B: Investments

Every investment is a markdown file in `/data/investments/`, so new ones are added without code. Schema:

```yaml
name: Smart weather-based controller
applies_to: zones | meters | areas        # what the user selects when applying it
effect:
  type: percent_reduction | gallons_per_month | efficiency_change | leak_elimination | fixed_charge_change
  value: null            # filled from quotes or sources, never invented
  range: [low, high]     # used for best case and worst case
upfront_cost_per_unit: null
unit: controller | zone | meter | sq_ft | one_time
annual_cost: null        # subscriptions, maintenance
lifespan_years: null
source: ""
confidence: low | medium | high
notes: ""
```

Seeded catalog (values `null` until filled from Jennifer's quotes or cited sources): smart weather-based (ET) controllers; flow sensor plus master valve; high-efficiency spray nozzle retrofit; pressure regulation at the valve or head; spray to drip conversion for shrub and tree zones; professional irrigation audit and leak repair (linked to open leak flags); meter downsizing or consolidation (marked "needs plumber and City confirmation").

### Results for every scenario

* Annual gallons and cost vs baseline, by meter and by area.
* Progress toward the $30K target.
* For investments: upfront cost, annual savings, payback in months, and 5-year net (savings minus all costs).
* Best case and worst case using each investment's `range`, plus the confidence level.
* Every assumption listed in plain language next to the result, with its source.
* Interactions handled correctly: savings are applied in sequence, not added, so two 20% reductions on the same zone produce 36%, not 40%. Turning a zone off makes any investment on that zone worth zero.

Scenarios are saved in the URL for sharing. Scenarios the HOA wants to keep go into `/data/scenarios/`. Compare up to 3 side by side.

## Phase 6: Recommended first moves

Ranked automatically from leak flags, the investment catalog, and down or off options: annual savings, upfront cost, payback, effort, confidence, and risk note. Greenspace is excluded unless toggled on. Items with `null` costs or savings show as "needs a quote" instead of being ranked on guesses.

## Screens

Left sidebar on desktop, single column on phones. Number first, chart second, explanation on tap.

1. Overview: annual run rate vs $30K target, 5-year cost waterfall, top 3 recommended moves, open leak flags.
2. How we got here: price vs volume vs fees by year, with event annotations.
3. Meters: one card per meter with health status, actual vs budget, and active flags; click through to daily detail.
4. How much should we use: budget vs actual by meter, area, and zone, with the formula explained in one sentence.
5. What if: scenario builder. Step 1, choose a baseline. Step 2, add changes (turn down or off, or add an investment). Step 3, see results. Saved scenarios and compare view.
6. Recommended moves: ranked list.
7. Bills: every bill with its reconciliation badge.
8. Data freshness: last bill per meter, last weather and usage update, open `todo`, `needs_review`, and "needs a quote" items.

Design all five states on every screen: populated, first-time empty, filtered empty, loading, error. WCAG 2.2 AA: visible focus rings, 4.5:1 text contrast, status never shown by color alone.

## Important notes

* Branch per phase (`phase-0-inventory`, `phase-1-billing-engine`, and so on). Merge to `main` only after tests pass. Netlify deploy previews on every pull request. When a session is assigned a specific branch, work there instead.
* Show a before and after diff and list every modified file before each commit.
* Never hardcode a rate, plant factor, threshold, savings percent, or cost in a component. Everything comes from `/data/` with a source.
* Never fabricate data. Missing data shows as missing.
* No em dashes in any UI copy or data file.
* Keep the engine pure and fully unit tested so the numbers can be audited without the UI.

## Verification

* `npm run build` passes Zod validation on every data file, and `npm test` passes, including the full reconciliation suite. `/data/RECONCILIATION.md` is current.
* Pick 3 random bills and confirm the computed total matches the printed bill within $1.00.
* The 5-year waterfall's start and end values equal the sum of actual bills for those years.
* Scenario tests: turning a zone off removes exactly its baseline gallons; two stacked 20% reductions yield 36%; an investment on a zone that is turned off saves $0; payback math matches a hand calculation for one example.
* No full account numbers, homeowner names, or PDFs anywhere in the deployed site. `grep` for any digit run longer than 6 in `/data/` returns only meter reads.
* `robots.txt` disallows all and the noindex tag is present.
* Lighthouse accessibility score 95 or higher on Overview, Meters, and What if; phone check at 390px width.

## Current status

See `/data/INVENTORY.md` for what data is in hand and what is still needed. Decisions are logged in `/docs/decisions/`.
