---
id: "007"
title: Highlight categories that are over budget
milestone: M01
depends_on: ["006"]
parent: null
split_into: []
attempts: 0
---
## Goal
Spending more than the budgeted amount is allowed: the expense is always recorded, and the category is then shown
as over budget, with a negative remaining amount, clearly distinguishable from categories within budget.

## Acceptance criteria
- AC1: Given today is 2026-10-12 and "Eating out" (budgeted 120.00) exists, When the user records an expense of 150.00 for "Eating out" today, Then the expense is recorded (an `expense-row` with "€150.00" is shown) and the row shows `category-spent` "€150.00", `category-remaining` "-€30.00" and `category-usage` "125%".
- AC2: Given the state of AC1 plus "Groceries" (300.00) with no expenses, When the app is opened, Then the "Eating out" `category-row` has `data-over-budget="true"` and a visible `category-over-budget` label with the text "Over budget", while the "Groceries" row has `data-over-budget="false"` and no visible `category-over-budget`; the computed `color` of "Eating out"'s `category-remaining` differs from that of "Groceries"' `category-remaining`.
- AC3: Given "Groceries" (300.00) with expenses totalling exactly 300.00 in October 2026, When the app is opened, Then its row shows `category-remaining` "€0.00", `category-usage` "100%", `data-over-budget="false"` and no visible `category-over-budget` (spent equal to budgeted is not over budget).
- AC4: Given "Transport" with budgeted amount 0 and an expense of 5.00 today, When the app is opened, Then its row shows `category-remaining` "-€5.00", `category-usage` "–", `data-over-budget="true"` and the "Over budget" label.
- AC5: Given the state of AC1, When the page is reloaded, Then "Eating out" is still shown over budget with remaining "-€30.00", and no console errors occurred.

## Notes
- Domain: over budget (spent > budgeted amount) per category and month, unit-tested including the equal case
  and the zero-budget case.
- Visual: e.g. a red remaining amount and a red "Over budget" badge via a CSS class in `app/styles.css`. Do not
  rely on colour alone; the text label is required.
- Selectors: `data-over-budget` attribute ("true"/"false") on each `category-row`; `category-over-budget` label,
  present/visible only when over budget.
- Fix "today" with `await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'))` before `openApp(page)`.

## Implementation log
## Test report
## Ratification
