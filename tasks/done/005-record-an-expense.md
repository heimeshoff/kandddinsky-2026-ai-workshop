---
id: 005
title: Record an expense
depends_on: [002, 004]
---

## Goal
I can enter money I spent, so I see what went out this month.

## Acceptance criteria
- Given category "Food" and today 2026-10-13, when I open the app, then the expense date is prefilled with 2026-10-13.
- Given category "Food", when I record 54.20 in "Food" on 2026-10-05 with note "groceries", then October lists it with amount 54.20 €, category, date and note.
- Given an expense without a note, then it is recorded and listed without a note.
- Given October expenses 54.20 € and 800.00 €, then October shows spent 854.20 €.
- Given an expense dated 2026-09-30, when I view October, then it is not listed and not in October's spent; when I view September, then it is.
- Given no expenses in a month, then spent shows 0.00 €.
- Given expenses were recorded, when I reload, then they are still listed.

## Domain notes
- **Expense**: amount (> 0, EUR, max 2 decimals), category, date, optional note.
- An expense belongs to the month of its date, not the month that was shown when entered.
- **Spent**: sum of expenses in a month.
- Same number parsing as income (comma or dot decimal separator).
- List order: newest date first.
- Out of scope: validation errors (task 006), deleting (007), per-category totals (008), editing.

## Notes
