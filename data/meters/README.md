# Meters

One file per City of Mesa meter: `meter-1.md` through `meter-4.md`. Frontmatter only; notes in the body.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | `meter-1` to `meter-4`. Matches folder names under `bills/` and `usage/`. |
| `name` | yes | Plain-language label neighbors will recognize. `null` until known. |
| `account_last4` | yes | Last 4 digits of the Mesa account only. |
| `meter_number_last4` | no | Last 4 digits of the meter serial, if printed on bills. |
| `size_inches` | yes | Meter size, for fixed-charge lookup. |
| `service_type` | yes | As printed by Mesa (for example, landscape irrigation). |
| `waterfluence_id` | no | Identifier used in Waterfluence exports. |
| `active_from` / `active_to` | no | Service dates if the meter was added or retired. |
| `source` | yes | Document and page each fact came from. |
| `todo` | no | What is still unknown. |

## Example (format only, not real data)

```markdown
---
id: meter-2
name: "Entry and north parkway"
account_last4: "0000"
meter_number_last4: null
size_inches: 1.5
service_type: "landscape irrigation"
waterfluence_id: null
active_from: null
active_to: null
source: "bills-2024.pdf, page 7"
todo: "Confirm meter serial and Waterfluence ID"
---

Serves zones on controller A, stations 1 to 12.
```
