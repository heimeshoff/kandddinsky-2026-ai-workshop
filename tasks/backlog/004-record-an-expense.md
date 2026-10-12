---
id: "004"
title: Record an expense and see it in the current month
milestone: M01
depends_on: ["002"]
parent: null
split_into: []
attempts: 0
---
## Goal
The app shows the current month. The user records an expense (amount, category, date, optional note); it
appears in the list of the shown month's expenses and adds to the spent of its category. Expenses dated in
another month are recorded but neither listed nor counted. Everything survives a page reload.

## Acceptance criteria
- AC1: Given today is 2026-10-12 and storage is empty, When the app is opened, Then `shown-month` shows "October 2026", `expense-date-input` has the value "2026-10-12", and `expense-empty` shows "No expenses this month".
- AC2: Given today is 2026-10-12 and the category "Groceries" (300) exists, When the user types "45.50" into `expense-amount-input`, selects "Groceries" in `expense-category-select`, keeps the date 2026-10-12, types "Weekly shop" into `expense-note-input` and clicks `expense-add-button`, Then one `expense-row` is shown with `expense-date` "2026-10-12", `expense-category` "Groceries", `expense-amount` "€45.50", `expense-note` "Weekly shop", and the "Groceries" `category-row` shows `category-spent` "€45.50".
- AC3: Given today is 2026-10-12 and the categories "Groceries" (300) and "Transport" (80) exist, When the user records 45.50 for "Groceries" today with no note and 12.30 for "Groceries" dated 2026-10-03, Then two `expense-row`s are shown, 2026-10-12 first, then 2026-10-03; the row without note has an empty `expense-note`; "Groceries" shows `category-spent` "€57.80" and "Transport" shows `category-spent` "€0.00".
- AC4: Given today is 2026-10-12 and "Groceries" exists, When the user records 20.00 for "Groceries" dated 2026-09-30 and 10.00 dated 2026-11-01, Then no `expense-row` is shown (`expense-empty` still visible) and "Groceries" shows `category-spent` "€0.00".
- AC5: Given today is 2026-10-12 and expenses 45.50 (2026-10-12, note "Weekly shop") and 20.00 (2026-09-30) were recorded for "Groceries", When the page is reloaded, Then exactly the 45.50 `expense-row` is shown with its note, "Groceries" shows `category-spent` "€45.50", and no console errors occurred.

## Notes
- Fix "today" in acceptance tests with Playwright's clock before opening the app:
  `await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'))`, then `openApp(page)`.
- Domain: an expense has amount (integer cents), category (reference by category id, not by name), date
  ("YYYY-MM-DD") and optional note. Domain functions for: the month of a date, the expenses of a given month,
  and the spent of a category in a month. Unit-test month boundaries (last day of the previous month, first day
  of the next month).
- The app always shows the current month (month switching is a later milestone), but compute with an explicit
  "shown month" value so switching can be added without rework.
- Reuse the amount parser and `formatEuro` from task 002. `expense-category-select` lists all categories in
  creation order; the first one is preselected.
- After a successful add, amount and note are cleared; category and date keep their values.
- Selectors: `shown-month`, `expense-amount-input`, `expense-category-select`, `expense-date-input`
  (`<input type="date">`), `expense-note-input`, `expense-add-button`, `expense-empty`, `expense-row` with
  `expense-date`, `expense-category`, `expense-amount`, `expense-note` inside; `category-spent` inside each `category-row`.
- Assumption: the month is shown as English month name + year ("October 2026"); expense dates as YYYY-MM-DD.
- Assumption: the expense list shows the shown month's expenses newest date first; on the same date the most
  recently recorded first.
- Assumption: an expense dated in another month is stored (it becomes visible once month switching exists); it is
  only hidden from the current view.
- Out of scope: validation errors (task 005), editing/deleting expenses, remaining/usage (task 006).

## Implementation log
## Test report
## Ratification
