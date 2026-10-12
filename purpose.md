# Purpose

## Who is it for?
One person managing their own day-to-day money, who wants to decide in advance how much to spend on each
part of life and then see, during the month, how close they are to those limits.

## What problem does it solve?
Without a plan, money gets spent without noticing until the month is over. This app lets the user set a
budget per category (groceries, eating out, transport, …), record what they actually spend, and see at any
time how much of each category's budget, and of the whole monthly budget, is already used and what is left.

## Core concepts (ubiquitous language)
- **Category** — an area of day-to-day spending, e.g. "Groceries". Has a name and a budgeted amount.
- **Budgeted amount** — how much the user plans to spend in a category per month. Set once; applies to every month until changed.
- **Expense** — one actual spending: an amount, the category it belongs to, a date, and an optional note.
- **Month** — a calendar month. Every expense belongs to the month of its date. The app always shows one month at a time.
- **Spent** — the sum of a category's expenses in the shown month.
- **Remaining** — budgeted amount − spent, for a category in the shown month. Negative when over budget.
- **Monthly budget** — the sum of the budgeted amounts of all categories.
- **Usage** — spent as a percentage of the budgeted amount (per category, and for the monthly budget as a whole).
- **Over budget** — spent is greater than the budgeted amount.

## Business rules
- All amounts are in euros (€), one currency, stored as integer cents.
- A budgeted amount is zero or more; an expense amount is greater than zero.
- Category names are unique (ignoring upper/lower case) and not empty.
- Every expense belongs to exactly one existing category.
- Each month starts fresh: leftovers and overspending do not carry over to the next month.
- Spending more than the budgeted amount is allowed. The expense is always recorded; the category is then
  shown as over budget, with a negative remaining amount, clearly distinguishable from categories within budget.
- Monthly totals: total spent = sum of all categories' spent in the shown month; total remaining = monthly budget − total spent.
- Changing a category's budgeted amount applies to every month, including ones already shown.
- The app opens on the current month; the user can switch to other months.
- All data survives a page reload.

## Out of scope
- Bank import or connection to any bank account.
- Income tracking, savings goals, recurring expenses.
- Multiple currencies.
- Multiple users, accounts, sync between devices.
- Rolling leftover money over to the next month.
- Different budgeted amounts for different months.
