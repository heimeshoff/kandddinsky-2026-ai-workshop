---
id: 015
title: Show projected spent per category
depends_on: []
---

## Goal
Per category I see what I will likely have spent by month end.

## Acceptance criteria
- Given current month Food spent 350.00 € and Food average 450.00 €, then Food shows spent 350.00 € and projected 450.00 €.
- Given Food spent 500.00 € and average 450.00 €, then projected shows 500.00 €.
- Given no past months, then projected = spent.
- Given I view a past month, then no projected value is shown.
- Given I view a future month, then projected shows "–".
- Given I record, edit or delete an expense, then projected updates without reload.

## Domain notes
- **Projected spent** (per category, current month) = spent + expected rest = max(spent, average).
- Spent and projected are two distinct numbers, both visible.
- Out of scope: day-based extrapolation, budgets.

## Notes
