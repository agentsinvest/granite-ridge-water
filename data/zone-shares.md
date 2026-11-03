---
period: "July 3 to mid-September 2026"
source: "Waterfluence hourly reads, typical week by program (docs/analysis/2026-10-07-controller-run-times-vs-waterfluence.md, section 2): meter 1 about 49,700 gallons in the early-morning program and 15,200 in the evening program; meter 2 about 30,500 and 29,500. Station-to-meter split from the same analysis, section 3 (medium confidence)."
note: "The early-morning program waters only the lawn rotors (stations C1 to C12), so its share is a floor for the lawn and a ceiling for the drip. The evening program is mostly drip, but on many summer Sunday nights a lawn station runs with drip C14 (WeatherTRAK Mainline Break alerts), so the drip's true share is lower than its ceiling. Shares are of each meter's water in summer 2026; overseed months and winter differ. Turning a share into dollars also needs each meter's price blocks, so the site shows shares of water, not dollars."
confidence: medium
todo: "Get the park controller's run minutes per station (pages 1, 2, and 4 to 9 of the Controller Settings Detail Report, or a WeatherTRAK station runtime report) to replace these bounds with each zone's own share. No shares yet for the Entrance controller (meter 3) or controller B (meter 4)."
---

What share of a meter's water a group of stations uses, as a floor and a ceiling. A blank cell means no bound is known.

| Stations | Meter | At least % | At most % | What |
|---|---|---|---|---|
| C1, C2, C3, C4, C5, C6, C7 | meter-1 | 77 | | Park lawn, east side (early-morning program, plus some Sunday evenings) |
| C14, C15 | meter-1 | | 23 | Park drip, east and north edges (evening program, shared some nights with a lawn station) |
| C8, C9, C10, C11, C12 | meter-2 | 51 | | Park lawn, west side (early-morning program, plus possibly part of the evening) |
| C13 | meter-2 | | 49 | Park drip, south and southwest (evening program, possibly shared with a lawn station) |
