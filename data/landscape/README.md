# Landscape problems

One file per problem with how the landscape is maintained or contracted, at `landscape/<id>.md`. These are not leaks: they explain why leaks and waste go unnoticed, or why water work costs more. They show on the Problems screen under "Landscape contract", in `rank` order.

| Field | Required | What it holds |
|---|---|---|
| `id` | yes | Same as the file name. |
| `rank` | yes | Order on the page, 1 first. Rank by how much the problem costs or hides. |
| `title` | yes | The problem in one plain line. |
| `summary` | yes | Two or three plain sentences a neighbor can follow. |
| `status` | yes | `open`, `asked` (raised with the landscaper or Trestle), or `resolved`. |
| `contract_sections` | no | Contract section numbers, for example `["6b", "7m"]`. |
| `cost_account` | no | HOA P&L account the cost is booked to, for example `51110`. The site shows the actual amounts from `data/financials/`; dollars are never written here. |
| `action` | no | Id of the action in `data/actions/` that fixes it. |
| `related_flags` | no | Ids of leak flags in `data/flags/` this problem helped cause or hide. |
| `source` | yes | Where the problem comes from. |
| `updated` | yes | YYYY-MM-DD of the last change. |
| `todo` | no | Open questions for maintainers. |

The text below the front matter is shown as the detail, in plain markdown.

## Example

```markdown
---
id: overseeding-billed-extra
rank: 2
title: "Winter overseeding is billed on top of the monthly price"
summary: "Seeding the park lawn with winter rye is not in the monthly price."
status: open
contract_sections: ["2c", "7a"]
cost_account: "51110"
action: overseeding-decision
related_flags: []
source: "sources/landscape/maintenance-contract-2024-07-17.md, sections 2c and 7a"
updated: 2026-10-15
---

Detail for homeowners.
```
