# Landscape problems

One file per problem with how the landscape is maintained or contracted, at `landscape/<id>.md`. These are not leaks: they explain why leaks and waste go unnoticed, or why water work costs more. They show on the Problems screen under "Landscape", in `rank` order.

| Field | Required | What it holds |
|---|---|---|
| `id` | yes | Same as the file name. |
| `rank` | yes | Order on the page, 1 first. Rank by how much the problem costs or hides. |
| `title` | yes | The problem in one plain line. |
| `summary` | yes | Two or three plain sentences a neighbor can follow. |
| `status` | yes | `open`, `asked` (raised with the landscaper or Trestle), or `resolved`. |
| `contract_sections` | no | Contract section numbers, for example `["6b", "7m"]`. |
| `paid` | no | What the HOA paid, one row per period: `{ period, amount, source }`. Amounts come from the HOA financial reports in `/sources/pl/`, each with its source. Partial years say so in `period`, for example `2026 through August`. |
| `action` | no | Id of the action in `data/actions/` that fixes it. |
| `related_flags` | no | Ids of leak flags in `data/flags/` this problem helped cause or hide. |
| `source` | yes | Where the problem comes from. |
| `updated` | yes | YYYY-MM-DD of the last change. |
| `todo` | no | Open questions for maintainers. |

The text below the front matter is shown as the detail, in plain markdown.

## Example

```markdown
---
id: example-cost
rank: 1
title: "Example: a landscape cost"
summary: "One plain sentence on what the cost is."
status: open
contract_sections: ["6b"]
paid:
  - { period: "2025", amount: 100.00, source: "sources/pl/2025.md, account 51120" }
action: null
related_flags: []
source: "HOA financial reports"
updated: 2026-10-15
---

Detail for homeowners.
```
