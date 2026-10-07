---
source: "Traced by hand from the HOA website annotated aerial map (sources/maps/areas-aerial.md), 2026-10-06. Meter locations transferred from the Waterfluence Controller Map (sources/waterfluence/landscape-and-controller-maps.md)."
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
controllers:
  - id: A
    name: "Entrance controller"
    meters: [meter-3]
    at: [110, 178]
  - id: B
    name: "Controller B"
    meters: [meter-4]
    at: [800, 292]
  - id: C
    name: "Park controller"
    meters: [meter-1, meter-2]
    at: [800, 700]
zones:
  - id: a4
    controller: A
    label: "A4"
    name: "Drip along McKellips, west of the northwest homes"
    status: on
    label_at: [395, 72]
    parts:
      - [[215, 68], [520, 63], [520, 78], [275, 78], [275, 185], [215, 185]]
  - id: a5
    controller: A
    label: "A5"
    name: "West wash drip (turned off)"
    status: off
    label_at: [118, 330]
    parts:
      - [[80, 215], [150, 192], [160, 212], [120, 232], [122, 420], [135, 500], [170, 600], [205, 648], [180, 660], [150, 612], [110, 508], [95, 420], [78, 300]]
  - id: a6
    controller: A
    label: "A6"
    name: "Entry drip"
    status: on
    label_at: [95, 110]
    parts:
      - [[40, 65], [180, 65], [190, 150], [150, 150], [140, 82], [40, 82]]
  - id: b12
    controller: B
    label: "B1, B2"
    name: "Interior strip south half and the Crismon frontage"
    status: on
    label_at: [870, 560]
    parts:
      - [[232, 350], [400, 345], [560, 365], [700, 385], [790, 395], [790, 442], [600, 418], [450, 392], [400, 372], [232, 380]]
      - [[912, 300], [955, 300], [955, 735], [818, 735], [818, 700], [912, 700], [912, 435], [820, 432], [820, 400], [912, 400]]
  - id: b3
    controller: B
    label: "B3"
    name: "Interior strip north half"
    status: on
    label_at: [330, 332]
    parts:
      - [[232, 315], [400, 308], [560, 318], [700, 345], [790, 348], [790, 395], [700, 385], [560, 365], [400, 345], [232, 350]]
  - id: b4
    controller: B
    label: "B4"
    name: "Northeast corner along McKellips and Crismon"
    status: on
    label_at: [700, 90]
    parts:
      - [[520, 63], [535, 62], [545, 72], [935, 72], [952, 100], [955, 300], [912, 300], [912, 265], [825, 262], [828, 115], [585, 110], [575, 195], [520, 190]]
  - id: c1-12
    controller: C
    label: "C1 to C12"
    name: "Park lawn (12 turf stations)"
    status: on
    label_at: [560, 720]
    parts:
      - [[368, 665], [400, 635], [450, 628], [520, 645], [600, 665], [700, 680], [770, 690], [785, 700], [785, 770], [740, 775], [660, 760], [600, 780], [520, 790], [450, 770], [400, 740], [370, 700]]
  - id: c13
    controller: C
    label: "C13"
    name: "South and southwest desert drip"
    status: on
    label_at: [600, 955]
    parts:
      - [[175, 650], [215, 640], [245, 700], [290, 760], [300, 880], [400, 885], [410, 935], [790, 935], [790, 975], [400, 975], [300, 950], [265, 900], [255, 800], [215, 720]]
  - id: c14
    controller: C
    label: "C14"
    name: "Park east and south edges, and the southeast corner drip"
    status: on
    label_at: [880, 870]
    parts:
      - [[720, 655], [785, 658], [785, 818], [760, 818], [760, 700], [700, 670]]
      - [[580, 782], [760, 775], [760, 818], [580, 818]]
      - [[815, 762], [860, 762], [880, 777], [905, 762], [950, 762], [950, 985], [800, 985], [800, 940], [815, 925]]
  - id: c15
    controller: C
    label: "C15"
    name: "Drip on the north side of the park"
    status: on
    label_at: [470, 612]
    parts:
      - [[265, 522], [300, 580], [345, 583], [500, 610], [640, 645], [720, 655], [700, 670], [600, 655], [520, 635], [450, 620], [400, 625], [368, 640], [330, 600], [285, 560]]
zones_source: "Traced by hand onto this canvas from the Eco Verde assessment map (sources/controllers/eco-verde-assessment-2026.md), 2026-10-07, following the area outlines already on this map. Zone letters are the controller (A Entrance, B controller B, C Park) and numbers are the station. Controller markers sit near, not exactly on, each controller so they do not cover the meter pins. Which zone is which station on controllers A and B, and the park station split between meters 1 and 2, are inferred (medium confidence). The entry turf (A1 to A3) is not drawn: it was small, its exact outline is not on the map, and it is artificial turf since September 2026."
slope:
  text: "Ground slopes about 2% from north to south. The park is the lowest point."
  source: "HOA website annotated aerial map"
---

# Site map geometry

Shapes for the schematic map on the website. Edit coordinates here to adjust the drawing; nothing on the site computes square footage from them.
