---
id: 012
title: Rename a category
depends_on: []
---

## Goal
I can fix a typo in a category name without losing its expenses.

## Acceptance criteria
- Given "Fod" with October expenses of 54.20 €, when I rename it to "Food", then "Food" is listed, "Fod" is gone, and Food spent shows 54.20 €.
- Given "Fod" with expenses in September and October, when I rename it to "Food", then expenses in both months show "Food".
- When I rename "Food" to "  Groceries  ", then it is listed as "Groceries".
- When I rename "food" to "Food", then it is listed as "Food".
- Given "Food" and "Rent", when I rename "Rent" to "food" or " Food ", then I see an error message (duplicate) and nothing changes.
- When I rename to an empty or whitespace-only name, then I see an error message and nothing changes.
- Given I cancel a rename, then nothing changes.
- Given I renamed a category, when I reload, then the new name is still there.

## Domain notes
- **Category**: unique, case-insensitive, trimmed. Same rules as adding (task 004).
- Changing only the case of the own name is allowed.
- Expenses stay in the category; average and projected balance are unaffected.
- Out of scope: merging two categories.

## Notes
