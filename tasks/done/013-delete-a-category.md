---
id: 013
title: Delete a category
depends_on: []
---

## Goal
I can remove a category I no longer need.

## Acceptance criteria
- Given "Travel" with no expenses, when I delete it, then it is gone at once, with no warning.
- Given "Food" with 3 expenses (September and October), when I delete it, then I see a warning saying 3 expenses will be deleted too.
- Given that warning, when I confirm, then "Food" and all its expenses are gone in every month; spent, average and projected balance no longer include them.
- Given that warning, when I cancel, then "Food" and its expenses are unchanged.
- Given I deleted a category, when I reload, then it and its expenses are still gone.
- Given I deleted "Food", when I add "Food" again, then it is a new, empty category.

## Domain notes
- Deleting a **Category** deletes all its **Expenses**, in all **Months**. No undo.
- Warning only when the category has expenses.
- Out of scope: moving expenses to another category, undo, archiving.

## Notes
