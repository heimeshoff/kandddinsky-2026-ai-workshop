---
id: M01
title: Core budget loop for the current month
status: in-progress
---
## Story
As the user, I create categories, each with a budgeted amount, and record expenses against them (amount,
category, date, optional note). For the current month I see per category what I have spent, what remains and
the usage, plus the totals for the whole monthly budget (monthly budget, total spent, total remaining, usage).
Categories that are over budget stand out clearly, with a negative remaining amount. All data survives a page
reload.

Switching to other months is not part of this milestone (planned for a later one); the app shows the current
month only. Expenses dated in another month are therefore not counted in what is shown.

## Done when
- The user can create categories with a name and a budgeted amount in euros; empty names, duplicate names
  (ignoring upper/lower case) and negative or invalid budgeted amounts are rejected with a visible reason.
- The user can record expenses (amount greater than zero, an existing category, a date, an optional note); invalid
  expenses are rejected with a visible reason.
- The app shows the current month and, for it, per category the budgeted amount, spent, remaining and usage;
  expenses dated in another month are not counted.
- The monthly totals (monthly budget, total spent, total remaining, usage) are shown for the current month.
- Over-budget categories are recorded and stand out clearly, with a negative remaining amount.
- All categories and expenses survive a page reload.

## Tasks
- [x] 002 Add a category with a budgeted amount
- [x] 003 Reject invalid categories
- [x] 004 Record an expense and see it in the current month
- [x] 005 Reject invalid expenses
- [x] 006 Show remaining and usage per category
- [x] 007 Highlight categories that are over budget
- [x] 008 Show the monthly budget totals

## Acceptance report
