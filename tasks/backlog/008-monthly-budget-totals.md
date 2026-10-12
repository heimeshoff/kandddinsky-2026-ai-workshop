---
id: "008"
title: Show the monthly budget totals
milestone: M01
depends_on: ["006"]
parent: null
split_into: []
attempts: 0
---
## Goal
For the shown month the user sees the totals of the whole monthly budget: monthly budget (sum of all budgeted
amounts), total spent, total remaining (monthly budget − total spent) and usage.

## Acceptance criteria
- AC1: Given storage is empty, When the app is opened, Then `total-monthly-budget` shows "€0.00", `total-spent` "€0.00", `total-remaining` "€0.00" and `total-usage` "–".
- AC2: Given today is 2026-10-12 and the categories "Groceries" (300.00), "Eating out" (120.00) and "Transport" (80.00) exist, with October 2026 expenses of 57.80 for "Groceries" and 60.00 for "Eating out", When the app is opened, Then `total-monthly-budget` shows "€500.00", `total-spent` "€117.80", `total-remaining` "€382.20" and `total-usage` "24%" (117.80 / 500.00 = 23.56 %, rounded).
- AC3: Given the state of AC2, When an expense of 100.00 for "Groceries" dated 2026-09-15 is recorded, Then the totals are unchanged (only the shown month counts).
- AC4: Given "Eating out" (120.00) is the only category and has 150.00 spent today, When the app is opened, Then `total-remaining` shows "-€30.00", `total-usage` "125%" and the `totals` container has `data-over-budget="true"`; in the state of AC2 it has `data-over-budget="false"`.
- AC5: Given the state of AC2, When the category "Gifts" (50.00) is added and an expense of 10.00 for "Transport" is recorded today, Then without a reload the totals show monthly budget "€550.00", total spent "€127.80", total remaining "€422.20", usage "23%"; after a page reload the same values are shown and no console errors occurred.

## Notes
- Domain: totals for a month (monthly budget, total spent, total remaining, usage), built from the per-category
  functions of tasks 004/006, with the same rounding and zero-budget rule as category usage. Unit-test the empty
  case and the over-budget case.
- Selectors: `totals` (container, carries `data-over-budget`), `total-monthly-budget`, `total-spent`,
  `total-remaining`, `total-usage`.
- Assumption: when total spent > monthly budget the totals are styled like an over-budget category (same CSS
  treatment). purpose.md defines over budget as spent > budgeted; applying it to the whole monthly budget is a
  display choice, not a new rule.
- Fix "today" with `await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'))` before `openApp(page)`.

## Implementation log
## Test report
## Ratification
