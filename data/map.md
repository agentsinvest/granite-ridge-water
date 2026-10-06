---
source: "Traced by hand from Jennifer's annotated aerial map (sources/maps/areas-aerial.md), 2026-10-06. Meter locations transferred from the Waterfluence Controller Map (sources/waterfluence/landscape-and-controller-maps.md)."
confidence: medium
note: "Schematic, not to scale. Coordinates are pixels on a 1050 by 1020 canvas matching Jennifer's map. Shapes are simplified; square footages come from areas.md, never from these shapes."
canvas:
  width: 1050
  height: 1020
areas:
  - id: west-south-desert
    landscape: shrub
    label_at: [110, 560]
    parts:
      - [[32, 65], [180, 65], [190, 195], [100, 225], [118, 420], [130, 500], [165, 600], [245, 700], [290, 760], [300, 880], [400, 885], [410, 935], [800, 935], [815, 920], [815, 760], [860, 760], [880, 775], [905, 760], [950, 760], [950, 990], [32, 990]]
  - id: perimeter
    landscape: shrub
    label_at: [890, 160]
    parts:
      - [[215, 68], [535, 62], [545, 72], [935, 72], [952, 100], [955, 735], [818, 735], [818, 700], [912, 700], [912, 435], [820, 432], [820, 400], [912, 400], [912, 265], [825, 262], [828, 115], [585, 110], [575, 195], [520, 190], [520, 78], [275, 78], [275, 185], [215, 185]]
  - id: interior-strip
    landscape: shrub
    label_at: [520, 372]
    parts:
      - [[232, 315], [400, 308], [560, 318], [700, 345], [790, 348], [790, 442], [600, 418], [450, 392], [400, 372], [232, 380]]
  - id: park-green
    landscape: shrub
    label_at: [600, 630]
    parts:
      - [[265, 522], [300, 580], [345, 583], [500, 610], [640, 645], [785, 658], [785, 818], [410, 818], [395, 760], [368, 688], [322, 612], [285, 560]]
turf:
  - area: park-green
    points: [[368, 665], [400, 635], [450, 628], [520, 645], [600, 665], [700, 680], [770, 690], [785, 700], [785, 770], [740, 775], [660, 760], [600, 780], [520, 790], [450, 770], [400, 740], [370, 700]]
streets:
  area: streets
  label_at: [600, 192]
  width: 20
  lines:
    - [[195, 62], [203, 200], [215, 330], [225, 475], [262, 560], [330, 650], [375, 740], [398, 830], [405, 912], [795, 912]]
    - [[205, 200], [400, 195], [600, 207], [760, 222], [798, 245], [800, 912]]
    - [[225, 478], [400, 470], [600, 515], [798, 545]]
    - [[800, 745], [950, 745]]
meters:
  - meter: meter-1
    at: [750, 662]
  - meter: meter-2
    at: [355, 621]
  - meter: meter-3
    at: [165, 179]
  - meter: meter-4
    at: [750, 362]
boundary_roads:
  - name: "McKellips Road"
    line: [[0, 36], [1050, 36]]
    label_at: [600, 44]
  - name: "Crismon Road"
    line: [[1000, 60], [1000, 1020]]
    label_at: [1008, 520]
    rotate: 90
slope:
  text: "Ground slopes about 2% from north to south. The park is the lowest point."
  source: "Jennifer's annotated aerial map"
---

# Site map geometry

Shapes for the schematic map on the website. Edit coordinates here to adjust the drawing; nothing on the site computes square footage from them.
