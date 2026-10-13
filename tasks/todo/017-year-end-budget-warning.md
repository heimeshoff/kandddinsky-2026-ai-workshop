---
id: 017
title: Year-end projection in the budget warning
depends_on: [016]
---

## Goal
The warning box also lists categories likely to exceed their budget for the calendar year.

## Acceptance criteria
- Given current month October 2026, Food budget 400.00 € from October 2026 (none before), Food spent Jan–Oct 2026 3,000.00 €, October expected rest 50.00 € and Food average 300.00 €, when I view October, then the box lists "Food: year projected 3,650.00 € of 1,200.00 €" (3,000 + 50 + 300 × 2 vs. 400 × 3).
- Given year projected ≤ year budget, then no year line is listed for that category.
- Given current month December, then year projected = spent Jan–Dec + expected rest in December.
- Given a category with no budget in any month of the year, then no year line is listed.
- Given a category already listed for the month, when it is also over for the year, then the year line is listed in addition.
- Given I change an expense or a budget, then the year line updates without reload.

## Domain notes
- **Year**: calendar year of the viewed month.
- **Year budget**: sum of the monthly budgets Jan–Dec of that year; months without budget count as 0. Future months use the carried-over budget.
- **Year projected spent**: spent Jan..current month + expected rest this month + average × remaining months of the year.
- Over = strictly greater.
- Shown only when viewing the current month.
- Out of scope: review of past years, year view for months other than the current one.

## Notes
