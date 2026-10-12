---
id: "006"
title: Show remaining and usage per category
milestone: M01
depends_on: ["004"]
parent: null
split_into: []
attempts: 0
---
## Goal
For the shown month, each category shows its remaining (budgeted amount − spent) and its usage (spent as a
percentage of the budgeted amount) next to its budgeted amount and spent.

## Acceptance criteria
- AC1: Given today is 2026-10-12 and "Groceries" with budgeted amount 300.00 exists without expenses, When the app is opened, Then its `category-row` shows `category-remaining` "€300.00" and `category-usage` "0%".
- AC2: Given "Groceries" (300.00) has expenses 45.50 and 12.30 dated in October 2026, When the app is opened, Then its row shows `category-spent` "€57.80", `category-remaining` "€242.20" and `category-usage` "19%" (57.80 / 300.00 = 19.27 %, rounded).
- AC3: Given "Eating out" (120.00) has an expense of 60.00 dated 2026-10-05 and one of 100.00 dated 2026-09-20, When the app is opened, Then its row shows `category-spent` "€60.00", `category-remaining` "€60.00" and `category-usage` "50%" (the September expense is not counted).
- AC4: Given "Transport" with budgeted amount 0 and no expenses, When the app is opened, Then its row shows `category-remaining` "€0.00" and `category-usage` "–" (en dash: usage is not defined for a budgeted amount of zero).
- AC5: Given the state of AC2, When the page is reloaded, Then the row still shows spent "€57.80", remaining "€242.20" and usage "19%", and no console errors occurred.

## Notes
- Domain: remaining (integer cents) and usage (integer percent) per category for a given month. Usage =
  spent × 100 / budgeted, rounded to the nearest whole percent (half up), computed with integers. Unit-test:
  budgeted 0 → no usage (e.g. `null`), exactly 100 %, 19.27 → 19, 19.5 → 20, spent above budgeted → above 100 %
  and negative remaining.
- Selectors inside each `category-row`: `category-remaining`, `category-usage`.
- Over-budget values (negative remaining, usage above 100 %) come out of the same functions; their visual
  highlighting is task 007.
- Assumption: usage is shown as a whole percent ("19%"); for a budgeted amount of 0 it is shown as "–".
- Fix "today" with `await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'))` before `openApp(page)`.

## Implementation log
## Test report
## Ratification
