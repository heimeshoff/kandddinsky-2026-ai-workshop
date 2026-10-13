---
id: 006
title: Reject invalid expenses
depends_on: [005]
---

## Goal
Wrong input never ends up as an expense, so my numbers stay trustworthy.

## Acceptance criteria
- When I record an amount of 0 or -5, then I see an error message and nothing is recorded.
- When I record amount "abc" or empty, then I see an error message and nothing is recorded.
- When I record 12.345, then I see an error message and nothing is recorded.
- When I record without choosing a category, then I see an error message and nothing is recorded.
- Given no categories exist, then I cannot record an expense and I see a hint to add a category first.
- When I record without a date, then I see an error message and nothing is recorded.
- Given a rejected input, then spent and the expense list are unchanged.

## Domain notes
- Rules from **Expense**: amount > 0, max 2 decimals, category required, date required.
- Note is optional and never a reason to reject.
- Out of scope: upper limit for amounts. Future dates are allowed.

## Notes
