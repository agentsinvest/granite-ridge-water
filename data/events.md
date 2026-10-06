---
todo: "Need event history: leak repairs, controller changes, landscape changes, meter changes, overseeding (see INVENTORY.md)"
---

# Events

Dated log of anything that changes water use. The leak engine uses this to explain step changes, and the How we got here chart annotates the timeline with it.

Types: `leak`, `repair`, `controller`, `schedule`, `landscape`, `meter`, `overseed`, `rebate`, `other`. `Precision` is `day`, `month`, or `year` so approximate dates are never shown as exact.

| Date | Precision | Meter | Zones | Type | What happened | Source |
|---|---|---|---|---|---|---|
| 2022-01-01 | year | | | rebate | HOA booked $1,138.60 of "Landscape Irrigation Equipment Incentives" income. Equipment and install date unknown. | 2022_PL.pdf, page 2, account 46002 |
| 2024-12-31 | day | | | other | Waterfluence monitoring program start date for the site (Waterfluence Agency panel). | Waterfluence Agency panel, sources/waterfluence/water-budget-and-site-settings.md |
| 2025-04-30 | day | meter-3 | | meter | City replaced the meter on account ...8681: old meter ...3703 final read 6,124 on 2025-04-30; new meter ...4706 installed reading 0 the same day. The 2025-05-27 bill billed both meters for the split period. | City of Mesa bill dated 05/27/25 (Drive file Invoices (1)_opt (1).pdf) |
| 2025-09-17 | day | meter-1 | | other | Late fee of $111.27 plus $9.24 tax on account ...8651 after the 2025-08-26 bills (all four meters) were not paid by the due date; a $3.00 delinquent letter charge plus $0.25 tax followed on 2025-09-30. Paid 2025-10-06. | City of Mesa bills dated 09/26/25 and 10/24/25 |
