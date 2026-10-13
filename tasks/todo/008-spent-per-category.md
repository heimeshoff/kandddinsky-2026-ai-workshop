---
id: 008
title: Show spent per category for the month
depends_on: [005]
---

## Goal
I see how much I spent in each category in the shown month.

## Acceptance criteria
- Given categories "Food" and "Rent" and October expenses Food 54.20 €, Food 30.00 €, Rent 800.00 €, when I view October, then Food shows 84.20 € and Rent shows 800.00 €.
- Given category "Insurance" without October expenses, then Insurance shows 0.00 € for October.
- Given a Food expense in September only, when I view October, then Food shows 0.00 €.
- Given I record an expense, then the category's spent updates without reload.

## Domain notes
- **Spent** per category: sum of that category's expenses in the shown month.
- Every category is shown, including those with 0.00 €.
- Out of scope: charts, sorting by amount.

## Notes
