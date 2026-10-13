---
id: 004
title: Add a category
depends_on: []
---

## Goal
I can create categories like Rent, Food, Insurance, so I can sort my expenses.

## Acceptance criteria
- Given no categories, when I add "Food", then "Food" appears in the category list.
- Given "Food" exists, when I add "Rent", then both are listed.
- When I add an empty or whitespace-only name, then I see an error message and nothing is added.
- Given "Food" exists, when I add "food" or " Food ", then I see an error message (duplicate) and nothing is added.
- When I add "  Rent  ", then it is listed as "Rent".
- Given categories were added, when I reload the page, then they are still listed.

## Domain notes
- **Category**: a name grouping expenses. Unique, case-insensitive, trimmed.
- Categories are not per month; they exist for all months.
- Out of scope: renaming, deleting, ordering, budgets per category.

## Notes
