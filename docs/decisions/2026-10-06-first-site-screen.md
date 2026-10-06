# 2026-10-06: First website screen (Meters and areas)

## Decision

Started the app ahead of the Phase 1 reconciliation gate, because Jennifer asked to see the meter and area data on the site. The first screen shows only recorded facts: meter locations, area sizes, metered water use for the last 12 read periods, and leak flags. It shows no projections, budgets, scenarios, or savings, so the Phase 1 rule is not affected.

## What was built

* Vite + React + TypeScript + Tailwind, as specified. shadcn/ui and Recharts are not installed yet; they will be added with the first screen that needs form controls or charts.
* `scripts/build-data.ts` validates every file in `data/` with Zod and fails with file and line. A file with no matching schema also fails, so nothing reaches the site unvalidated. Em dashes in data fail the build.
* gray-matter is used as specified, but YAML is parsed with the maintained `yaml` package, because gray-matter's bundled js-yaml has a known advisory.
* The map is an SVG schematic from `data/map.md`. Colors encode landscape type (shrub and desert, turf, streets), checked with the palette validator; area identity is carried by letter labels and the area table, not by color. Turf also carries a hatch pattern for color-vision and dark-mode cases.
* Netlify config (`netlify.toml`) builds with `npm run build`, publishes `dist/`, and sends `X-Robots-Tag: noindex, nofollow` on every response, in addition to the meta tag and robots.txt.

## Not yet done

* No favicon (the browser's request for one returns 404).
* Lighthouse accessibility audit not run yet.
* Map labels are small on phones; the tables below the map carry the same information.
