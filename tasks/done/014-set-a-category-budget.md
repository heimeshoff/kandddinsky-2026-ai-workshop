---
id: 014
title: Set a budget for a category
depends_on: []
---

## Goal
I give a category a monthly limit that applies from that month on.

## Acceptance criteria
- Given no budgets, when I set Food to 400.00 € in October, then Food shows budget 400.00 € in October.
- Given Food 400.00 € set in October, when I view November or December, then Food shows 400.00 €.
- Given Food 400.00 € set in October, when I view September, then Food shows no budget.
- Given Food 400.00 € from October, when I set 350.00 € in December, then October and November show 400.00 € and December and later show 350.00 €.
- Given Food 400.00 € from October, when I remove it in December, then October and November show 400.00 € and December and later show no budget.
- Given I enter 0, a negative amount or more than 2 decimals, then it is rejected and the budget is unchanged.
- Given budgets set and removed, when I reload, then all months show the same budgets as before.

## Domain notes
- **Budget**: planned limit per category per month, EUR, > 0.
- Budgets carry over like income: a month without its own budget setting uses the latest earlier setting for that category. Never flows backwards.
- Removing a budget in a month is itself a setting: that month and later have no budget until set again.
- "No budget" is not the same as 0 (0 is rejected).
- Renaming a category keeps its budgets. Deleting a category removes its budgets.
- Out of scope: warnings (task 016), year budgets (task 017).

## Notes
