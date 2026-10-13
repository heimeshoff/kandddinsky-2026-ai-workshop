---
id: 011
title: Edit an expense
depends_on: []
---

## Goal
I can correct an expense in place instead of deleting and re-entering it.

## Acceptance criteria
- Given an October expense 54.20 € Food on 2026-10-05 "groceries", when I change the amount to 45.20 and save, then the list shows 45.20 € and Food spent drops by 9.00 €.
- Given that expense, when I change its category to Rent and save, then Food spent drops by 54.20 € and Rent spent rises by 54.20 €.
- Given that expense, when I change the note to "market" and save, then the list shows "market".
- Given that expense, when I clear the note and save, then it is saved with no note.
- Given that expense, when I change the date to 2026-09-28 and save, then it is gone from October and listed in September; spent of both months is updated.
- Given I edit an expense, when I enter amount 0, -5, "abc", empty or 12.345, or clear the category or date, and save, then I see an error message and the expense is unchanged.
- Given I edit an expense, when I cancel, then the expense is unchanged.
- Given I edited an expense, when I reload, then the change is still there.
- Given two identical expenses, when I edit one, then only that one changes.

## Domain notes
- Same rules as **Expense** (task 006): amount > 0, max 2 decimals, category required, date required. Note optional.
- Changing the date can move the expense to another **Month**.
- Average, expected rest and projected balance follow from the changed data.
- Out of scope: undo, edit history.

## Notes
