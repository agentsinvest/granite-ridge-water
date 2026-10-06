# Smart controller for the interior strip: does $6,000 make sense? (2026-10-06)

Board proposal: spend about $6,000 on a smart controller for the desert strip between the two interior rows of homes (area D), watered from the meter on its east end (meter 4, ...5793).

Short answer: **not as the first $6,000.** Meter 4 is the smallest-cost meter, and its real problem (a valve that does not shut off) is not something a smart controller fixes. The same money aimed at the park meters, or a valve repair plus a flow sensor on meter 4, would pay back much faster.

These are estimates using rates derived from the City bills (not yet confirmed against the published schedule). The savings percentages are scenarios, not quotes or vendor claims.

## What meter 4 costs

* Last 12 City bills (2025-08-26 to 2026-07-28): **$3,035.81** for 448,000 gallons.
* The same water at current rates (May 2026): **$3,551 a year**.
* Even with **no water at all**, the service charge and fees remain, so the most any device could ever save on this meter is about **$2,950 a year**.

| If the controller cuts meter 4's water by | Saves per year | Simple payback on $6,000 |
|---|---|---|
| 10% | $398 | about 15 years |
| 20% | $770 | about 7.8 years |
| 30% | $1,129 | about 5.3 years |

Payback gets longer with any subscription or maintenance cost.

## Is the strip overwatered?

Estimated need for the 88,708 sq ft strip (desert-adapted plants, plant factor 0.3, 68 inches a year net ETo, canopy 20% to 40% of the area): **225,000 to 451,000 gallons** of plant water, or **309,000 to 618,000** with typical sprinkler losses. Meter 4 used 448,000. So unless meter 4 also waters other areas, the strip is not heavily overwatered on schedule. Which areas meter 4 serves is not confirmed.

## What is actually wrong on meter 4

* Its 2 AM valve stuck open three times in September and October 2026 (about 39,500 gallons): see `data/flags/2026-09-meter-4-step-change.md`.
* Before its meter was replaced in October 2024 it ran 46,000 to 61,000 gallons every month, year round.

A smart controller adjusts schedules for weather. It cannot close a valve that is stuck open. A valve repair, plus a **flow sensor and master valve** (in the investment catalog), is the device that stops this kind of loss automatically.

## Where $6,000 would go further

The two park meters used 5.65 million gallons in the same 12 months and are where the overwatering check found the most likely excess (`docs/analysis/2026-10-06-are-we-overwatering.md`).

| Same cut on | 10% | 20% | 30% |
|---|---|---|---|
| Meter 1 (park, northeast) | $3,412 a year | $6,847 | $10,197 |
| Meter 2 (park, northwest) | $1,975 a year | $3,963 | $5,898 |

A 10% cut on meter 1 alone would repay $6,000 in under two years.

## Before deciding

1. Get the quote in writing: what the $6,000 buys (controller, stations, sensors, installation), annual subscription, and whether it includes a flow sensor and master valve.
2. Confirm which zones meter 4 and the new controller would run.
3. Repair or replace the sticking valve on meter 4 now regardless.
4. Jennifer believes the park meters already run smart controllers (update below). If so, check how those are set up before buying another.
5. Check for a City of Mesa rebate; the HOA booked $1,138.60 of "Landscape Irrigation Equipment Incentives" in 2022, so it may already have a smart controller somewhere.

Caveat: cutting winter water also lowers next year's cheaper-block allowance (the City sets it from December to February use), which trims savings slightly; the figures above hold the current allowance fixed.

## Update: the park meters may already have smart controllers

Jennifer believes the park meters (1 and 2) already run smart, weather-based controllers. If so:

* The park is where the overwatering check found the most likely excess (5.65 million gallons against an estimated 3.0 to 4.4 million with typical sprinkler losses). Smart controllers alone have not prevented it, so a new smart controller on the strip should not be expected to deliver large savings by itself.
* The useful step for the park is a settings check, not new hardware: what plant type, area, soil, slope, sprinkler precipitation rate, and efficiency each zone is set to; whether the controller is actually running in weather-based mode or on a fixed schedule; any seasonal-adjust or water-budget override above 100%; manual runs; and how overseed watering is programmed. These settings decide how much a smart controller waters.
* It is still possible that meters 1 and 2 water more than the park (which would explain their volume). The controller setup screens would show this too.
* The $1,138.60 irrigation equipment incentive the HOA booked in 2022 may have been for these controllers.
