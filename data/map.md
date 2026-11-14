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
    stations: [A4]
    controller: A
    label: "A4"
    name: "Drip along McKellips, west of the northwest homes"
    status: on
    confirmed: true
    label_at: [395, 72]
    parts:
      - [[215, 68], [520, 63], [520, 78], [275, 78], [275, 185], [215, 185]]
  - id: a4-northeast
    stations: [A4]
    controller: A
    label: "A4"
    name: "Northeast corner along McKellips and Crismon"
    status: on
    confirmed: false
    note: "The owner of Schnepf Landscape says controller A waters all the landscape outside the gates (Jennifer, 2026-11-14). A4 is the only station on controller A still turned on that could reach it. Eco Verde labels this Zone 4, the same number as A4 along McKellips. Valve B4 sits next to it, so it could still be controller B."
    label_at: [700, 90]
    parts:
      - [[520, 63], [535, 62], [545, 72], [935, 72], [952, 100], [955, 300], [912, 300], [912, 265], [825, 262], [828, 115], [585, 110], [575, 195], [520, 190]]
  - id: a5
    stations: [A5]
    controller: A
    label: "A5"
    name: "West wash drip (turned off)"
    status: off
    label_at: [118, 330]
    parts:
      - [[80, 215], [150, 192], [160, 212], [120, 232], [122, 420], [135, 500], [170, 600], [205, 648], [180, 660], [150, 612], [110, 508], [95, 420], [78, 300]]
  - id: a6
    stations: [A6]
    controller: A
    label: "A6"
    name: "Entry drip"
    status: on
    label_at: [95, 110]
    parts:
      - [[40, 65], [180, 65], [190, 150], [150, 150], [140, 82], [40, 82]]
  - id: a-crismon
    stations: [A4]
    controller: A
    label: "A"
    name: "Crismon Road frontage"
    status: on
    confirmed: false
    note: "The owner of Schnepf Landscape says controller A waters all the landscape outside the gates (Jennifer, 2026-11-14). A4 is the only station on controller A still turned on that could reach it. Eco Verde labels it Zone 1 & 2, the same numbers as B1 and B2, which water the interior strip."
    label_at: [935, 560]
    parts:
      - [[912, 300], [955, 300], [955, 735], [818, 735], [818, 700], [912, 700], [912, 435], [820, 432], [820, 400], [912, 400]]
  - id: b12
    stations: [B1, B2]
    controller: B
    label: "B1, B2"
    name: "Interior strip south half"
    status: on
    label_at: [520, 410]
    parts:
      - [[232, 350], [400, 345], [560, 365], [700, 385], [790, 395], [790, 442], [600, 418], [450, 392], [400, 372], [232, 380]]
  - id: b3
    stations: [B3]
    controller: B
    label: "B3"
    name: "Interior strip north half"
    status: on
    label_at: [330, 332]
    parts:
      - [[232, 315], [400, 308], [560, 318], [700, 345], [790, 348], [790, 395], [700, 385], [560, 365], [400, 345], [232, 350]]
  - id: c1
    stations: [C1]
    controller: C
    label: "C1"
    name: "Park lawn, east end and northeast along the sidewalk"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [760, 714]
    parts:
      - [[652, 673], [672, 676], [693, 679], [714, 682], [735, 685], [735, 703], [714, 700], [693, 696], [672, 693], [652, 691]]
      - [[735, 685], [747, 687], [760, 689], [772, 692], [785, 700], [785, 742], [772, 739], [760, 739], [747, 739], [735, 738]]
  - id: c2
    stations: [C2]
    controller: C
    label: "C2"
    name: "Park lawn, southeast along the curb"
    status: on
    confirmed: false
    note: "Not on the Eco Verde sprinkler head map. Placed at the southeast curb from its name in the controller, SE curb 180."
    label_size: 13
    label_at: [760, 748]
    parts:
      - [[735, 738], [747, 739], [760, 739], [772, 739], [785, 742], [785, 757], [772, 757], [760, 758], [747, 758], [735, 758]]
  - id: c3
    stations: [C3]
    controller: C
    label: "C3"
    name: "Park lawn, south middle"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [580, 742]
    parts:
      - [[526, 746], [579, 746], [631, 740], [683, 738], [735, 747], [735, 758], [683, 749], [631, 752], [579, 761], [526, 764]]
  - id: c4
    stations: [C4]
    controller: C
    label: "C4"
    name: "Park lawn, middle (south band)"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [700, 728]
    parts:
      - [[526, 725], [579, 727], [631, 725], [683, 725], [735, 734], [735, 747], [683, 738], [631, 740], [579, 746], [526, 746]]
  - id: c5
    stations: [C5]
    controller: C
    label: "C5"
    name: "Park lawn, middle (center band)"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [580, 710]
    parts:
      - [[526, 704], [579, 709], [631, 710], [683, 712], [735, 721], [735, 734], [683, 725], [631, 725], [579, 727], [526, 725]]
  - id: c6
    stations: [C6]
    controller: C
    label: "C6"
    name: "Park lawn, north middle"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [700, 697]
    parts:
      - [[526, 675], [579, 684], [631, 690], [683, 695], [735, 703], [735, 721], [683, 712], [631, 710], [579, 709], [526, 704]]
  - id: c7
    stations: [C7]
    controller: C
    label: "C7"
    name: "Park lawn, along the north sidewalk"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [600, 668]
    parts:
      - [[526, 647], [558, 654], [589, 662], [620, 668], [652, 673], [652, 691], [620, 689], [589, 686], [558, 681], [526, 675]]
  - id: c8
    stations: [C8]
    controller: C
    label: "C8"
    name: "Park lawn, west curb and around the north side of the playground"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [393, 686]
    parts:
      - [[370, 663], [381, 653], [393, 642], [406, 634], [418, 632], [418, 751], [406, 743], [393, 731], [381, 714], [370, 700]]
      - [[418, 632], [433, 630], [447, 628], [462, 631], [476, 634], [476, 652], [462, 648], [447, 645], [433, 646], [418, 647]]
  - id: c9
    stations: [C9]
    controller: C
    label: "C9"
    name: "Park lawn around the ramada and playground"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [447, 675]
    parts:
      - [[418, 647], [433, 646], [447, 645], [462, 648], [476, 652], [476, 713], [462, 709], [447, 705], [433, 701], [418, 698]]
  - id: c10
    stations: [C10]
    controller: C
    label: "C10"
    name: "Park lawn, northwest center"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [501, 680]
    parts:
      - [[476, 634], [489, 637], [501, 640], [514, 644], [526, 647], [526, 725], [514, 723], [501, 720], [489, 716], [476, 713]]
  - id: c11
    stations: [C11]
    controller: C
    label: "C11"
    name: "Park lawn, southwest center"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [472, 731]
    parts:
      - [[418, 698], [445, 705], [472, 712], [499, 719], [526, 725], [526, 764], [499, 758], [472, 751], [445, 742], [418, 730]]
  - id: c12
    stations: [C12]
    controller: C
    label: "C12"
    name: "Park lawn, along the whole south edge"
    status: on
    note: "Traced from the Eco Verde Park Sprinklers head map, where each rotor is colored by valve. Approximate."
    label_size: 13
    label_at: [602, 769]
    parts:
      - [[418, 730], [510, 761], [602, 759], [693, 751], [785, 757], [785, 770], [693, 766], [602, 779], [510, 787], [418, 751]]
  - id: c13
    stations: [C13]
    controller: C
    label: "C13"
    name: "Drip on the southwest side of the park lawn"
    status: on
    confirmed: true
    note: "The controller names it \"Drip- SW side of grass\". Eco Verde colors this edge and the outer south desert the same (Zone 13)."
    label_size: 15
    label_at: [455, 804]
    parts:
      - [[398, 745], [450, 775], [520, 795], [560, 795], [560, 816], [412, 816], [396, 762]]
  - id: a-south
    stations: [A4]
    controller: A
    label: "A"
    name: "South and southwest desert outside the wall"
    status: on
    confirmed: false
    note: "The owner of Schnepf Landscape says controller A waters all the landscape outside the gates (Jennifer, 2026-11-14). A4 is the only station on controller A still turned on that could reach it. Eco Verde labels it Zone 13, the same as the park drip C13. Where it meets the west wash it could also be A5, which is turned off."
    label_at: [600, 955]
    parts:
      - [[175, 650], [215, 640], [245, 700], [290, 760], [300, 880], [400, 885], [410, 935], [790, 935], [790, 975], [400, 975], [300, 950], [265, 900], [255, 800], [215, 720]]
  - id: c14
    stations: [C14]
    controller: C
    label: "C14"
    name: "Drip on the east and south sides of the park lawn"
    status: on
    confirmed: true
    note: "The controller names it \"Drip- SE side of grass\"."
    label_size: 15
    label_at: [690, 805]
    parts:
      - [[720, 655], [785, 658], [785, 700], [770, 690], [700, 680], [700, 670]]
      - [[580, 782], [600, 780], [660, 760], [740, 775], [785, 770], [785, 818], [580, 818]]
  - id: a-southeast
    stations: [A4]
    controller: A
    label: "A"
    name: "Southeast corner along Crismon"
    status: on
    confirmed: false
    note: "The owner of Schnepf Landscape says controller A waters all the landscape outside the gates (Jennifer, 2026-11-14). A4 is the only station on controller A still turned on that could reach it. Eco Verde labels it Zone 14, the same as the park drip C14."
    label_at: [880, 870]
    parts:
      - [[815, 762], [860, 762], [880, 777], [905, 762], [950, 762], [950, 985], [800, 985], [800, 940], [815, 925]]
  - id: c15
    stations: [C15]
    controller: C
    label: "C15"
    name: "Drip on the north side of the park"
    status: on
    note: "The controller names it \"Drip- NW side of grass\"."
    label_at: [470, 612]
    parts:
      - [[265, 522], [300, 580], [345, 583], [500, 610], [640, 645], [720, 655], [700, 670], [600, 655], [520, 635], [450, 620], [400, 625], [368, 640], [330, 600], [285, 560]]
zones_source: "Draft of 2026-11-14. Traced by hand from the Eco Verde assessment map (zones, valves, and controllers) and its Park Sprinklers map (each lawn rotor colored by valve), with meter locations from Waterfluence. Zone letters are the controller (A Entrance, B controller B, C Park) and numbers are the station. The park lawn stations C1 to C12 are approximate, and C2 is not on the sprinkler map. The landscape outside the gates (northeast corner, Crismon frontage, southeast corner, and south desert) is drawn on controller A because the landscaper's owner says controller A waters it, but that is not confirmed: Eco Verde numbered those areas like stations on controllers B and C, and controller A's only station still on that could reach them is A4. A walk test (run A4 by hand and see where the drip comes on) will settle it. Valve B4 is not drawn until then. The entry turf (A1 to A3, now artificial turf) is not drawn."
slope:
  text: "Ground slopes about 2% from north to south. The park is the lowest point."
  source: "HOA website annotated aerial map"
---

# Site map geometry

Shapes for the schematic map on the website. Edit coordinates here to adjust the drawing; nothing on the site computes square footage from them.

Each zone lists its `stations` (ids from `data/controllers/`). The cost card on the map reads each station's meter from the controller tables, so a zone is only ever shown the cost of the meters it is on. A zone has no meter of its own; its own share of a bill needs station run times and flow rates.
