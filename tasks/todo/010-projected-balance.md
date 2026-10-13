---
id: 010
title: Show the projected balance at month end
depends_on: [003, 009]
---

## Goal
I see how much money will likely be left at the end of the current month.

## Acceptance criteria
- Given October income 2,500.00 €, Food average 210.00 € with October Food spent 150.00 €, Rent average 800.00 € with October Rent spent 800.00 €, when I view October, then projected balance shows 1,490.00 € (2,500 − 950 − 60).
- Given a category whose spent this month exceeds its average, then it adds 0 expected rest (never negative).
- Given no past months, then projected balance = income − spent.
- Given spent plus expected rest exceed income, then projected balance shows a negative amount, visibly highlighted.
- Given I record an expense or change the income, then the projected balance updates without reload.
- Given I view a past month, then it shows "left" = income − spent instead of a projection.
- Given I view a future month, then the projected balance shows "–".

## Domain notes
- **Expected rest** per category: max(0, average − spent this month).
- **Projected balance**: income − spent − sum of expected rest over all categories.
- Uses carried-over income when the month has none of its own.
- Out of scope: day-based extrapolation, recurring expenses, savings goals.

## Notes
