---
source: "Annotated aerial map published on the HOA website (sources/maps/areas-aerial.webp), shared by Jennifer 2026-10-06; source confirmed 2026-10-07"
site_slope:
  value: "North to south, about 2%. The park green is the lowest point."
  source: "HOA website annotated aerial map"
  confidence: medium
lot_area_included:
  value: false
  source: "Jennifer, 2026-10-06"
  confidence: high
waterfluence_landscape:
  shrub_sq_ft: 728295
  turf_overseed_sq_ft: 86354
  turf_no_overseed_sq_ft: 0
  pool_sq_ft: 0
  total_sq_ft: 814649
  source: "Waterfluence Landscape Map and Water Budget panel, site MESA-437; map updated about late 2024 (sources/waterfluence/landscape-and-controller-maps.md)"
  confidence: medium
  note: "Waterfluence's irrigated area by landscape type, not split by named area. Turf is about 13% above the ~76,600 on Jennifer's map; total is about 6% above areas B to E."
todo: "Square footages in the table are gross common-area map areas, not irrigated areas. Much of the west and south desert is not irrigated (the west wash zone is off). Need irrigated square footage per zone, and confirmation of the meters by area."
---

# Areas

Named parts of the neighborhood. Each zone file names one `area` id from this table. Turn-down and turn-off changes can target a whole area.

| Area id | Map label | Name | Gross sq ft | Turf sq ft | Description | Zones |
|---|---|---|---|---|---|---|
| streets | A | Private streets | 146878 | | Street corridors inside the gate (red outline). Irrigated landscape, if any, unknown. | |
| west-south-desert | B | West and south desert | 383591 | | Desert landscape along the west and south edges (yellow outline). | |
| perimeter | C | McKellips and Crismon perimeter | 147442 | | Frontage along McKellips Road (north) and Crismon Road (east) (blue outline). | |
| interior-strip | D | Interior strip | 88708 | | Desert strip between the two interior rows of homes (magenta outline). | |
| park-green | E | Park green | 149862 | 76600 | Central park with turf, ramada, and playground (orange outline). Turf greenspace. Lowest point of the site. | |

Turf square footage for the park green is marked approximate ("~76,600") on the map; confidence medium.

## Meters by area

From the Eco Verde assessment map (2026, `sources/controllers/eco-verde-assessment-2026.md`), matched to meters by where each point of connection sits. Confidence medium until the landscaper confirms.

* Entry and the McKellips frontage east of it: meter-3 (Entrance controller). The entry turf is now artificial turf (Jennifer, 2026-10-07).
* West wash, the west edge of the west and south desert: meter-3, station set to Off on 2026-03-29.
* Interior strip, Crismon frontage, and the northeast corner: meter-4 (controller B).
* Park green, plus drip zones along the park edges and in the south and southeast desert: meter-1 and meter-2 (Park controller).
