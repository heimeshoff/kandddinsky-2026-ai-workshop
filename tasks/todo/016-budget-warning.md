---
id: 016
title: Budget warning for the month
depends_on: [014, 015]
---

## Goal
One warning box lists every category that is over budget or likely to be.

## Acceptance criteria
- Given Food budget 400.00 € and spent 420.00 €, then the box lists "Food: spent 420.00 € of 400.00 €".
- Given Fun budget 400.00 €, spent 300.00 € and projected 450.00 €, then the box lists "Fun: projected 450.00 € of 400.00 €".
- Given Food budget 400.00 € and spent 400.00 € and projected 400.00 €, then Food is not listed.
- Given Food spent 420.00 € of 400.00 €, then Food is listed once, only with the spent line.
- Given a category without budget, then it is never listed, whatever it spent.
- Given no category is over, then the box is not shown.
- Given I view a past month, then only spent-over lines are shown.
- Given I view a future month, then the box is not shown.
- Given I change an expense or a budget, then the box updates without reload.

## Domain notes
- **Over budget**: strictly greater than the budget (400.00 of 400.00 is fine).
- One box, one line per problem. Spent-over wins over projected-over for the same category.
- Uses the budget valid in the viewed month (carry-over, task 014).
- Out of scope: year-end lines (task 017).

## Notes
