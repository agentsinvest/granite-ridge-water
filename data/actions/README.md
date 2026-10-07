# Actions

One file per thing the HOA is doing about its water: a repair, a schedule change, a purchase, a decision, or a question to someone. The site shows these to homeowners on Home and the Action plan, with who is handling each one and its status.

To update an action, change `status`, set `updated` to today, and add a line to `history`. If you only change `status`, the site still shows the change, dated by `updated`.

## Fields

| Field | Required | What it holds |
|---|---|---|
| `id` | yes | Same as the file name. |
| `title` | yes | What to do, in plain words, starting with a verb. Shown as "Do this". |
| `problem` | yes | What is wrong, in one plain sentence. Shown as "What's wrong". |
| `meter` | yes | `meter-1` to `meter-4`, `park` (meters 1 and 2), or `all`. |
| `controller` | yes | `Park`, `Entrance`, `B`, or `null`. |
| `stations` | no | Station labels such as `B4` or `A6`, matching `data/controllers/`. |
| `category` | yes | `fix-leak`, `schedule-change`, `equipment`, `decision`, or `get-info`. |
| `lawn_impact` | yes | `none`, `changes-lawn-watering`, or `removes-lawn`. |
| `owner` | yes | `Landscaper`, `Trestle`, `HOA`, or `City of Mesa`. Shown to homeowners as who is handling it. |
| `status` | yes | `not-started`, `asked`, `scheduled`, `done`, `verified`, or `dropped`. |
| `urgent` | no | `tree-risk` or `open-leak`. Urgent actions go to the top of "Fix now". |
| `due` | no | YYYY-MM-DD. |
| `after` | no | Ids of actions that must happen first. |
| `cost` | yes | A dollar number, `"needs quote"`, or `"no purchase"`. |
| `cost_source` | yes | Where the cost comes from. |
| `savings_from` | no | `option:<id>`, `flag:<id>`, or `investment:<id>`. The site takes the yearly savings from that calculator, so the numbers always match the Savings calculator and Problems screens. |
| `savings_per_year` | no | `[low, high]` in dollars, only when no calculator covers it. Needs `savings_source`. Never both this and `savings_from`. |
| `savings_note` | no | One plain sentence on what the savings figure means. |
| `evidence` | yes | List of `flag:<id>`, `option:<id>`, `investment:<id>`, `experiment:<id>`, or `source:<path without .md>` (a file in `/sources` or `/docs`). Only a source's document name is published. |
| `verify_with` | yes | How we will know it worked, in plain words. |
| `verify_experiment` | no | Id of the experiment in `data/experiments/` that checks it. |
| `updated` | yes | YYYY-MM-DD of the last change to this file. |
| `history` | yes | Status changes, oldest first: `{ date, status, note }`. |
| `todo` | no | Open questions for maintainers. Not shown to homeowners. |

The text below the front matter is the action's detail page, in plain markdown paragraphs and bullet lists.

## Example

```markdown
---
id: meter4-valve-repair
title: "Repair the valve that stays open after the 2 AM watering"
problem: "Three times since mid-September a valve on meter 4 did not shut off after the 2 AM watering, once for about 62 hours straight."
meter: meter-4
controller: B
stations: ["B4"]
category: fix-leak
lawn_impact: none
owner: Landscaper
status: not-started
urgent: open-leak
due: null
cost: "needs quote"
cost_source: "No repair quote on file"
savings_from: flag:2026-09-meter-4-step-change
evidence: [flag:2026-09-meter-4-step-change, source:sources/controllers/eco-verde-assessment-2026, experiment:meter-4-valve-repair]
verify_with: "No day above 400 gallons on meter 4 for 14 days after the repair."
verify_experiment: meter-4-valve-repair
updated: 2026-10-07
history:
  - { date: 2026-10-07, status: not-started, note: "Added to the action plan" }
---

Ask the landscaper which valve runs at about 2 AM on controller B, then inspect and repair it.
```
