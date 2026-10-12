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
### Round 1 — 2026-10-12
- `app/domain.js`: added `isIsoDate`, `toIsoDate` (local date → "YYYY-MM-DD"), `monthOf` ("YYYY-MM"),
  `formatMonth` ("October 2026"), `validateExpense`, `addExpense` (immutable, ids "e1", "e2", … referencing the
  category by id, note trimmed, '' when absent), `addExpenseFromInput` (reuses `parseAmount`; returns
  `{ expenses, error }`), `expensesInMonth` (newest date first, same date → higher id first) and `spentInMonth`.
  Rules enforced: amount integer cents > 0, category must exist, date must be a real calendar date.
- `app/ui.js`: state gains `expenses` (persisted in the same `budget-app-v1` key; `load()` defaults to `[]`) and
  a non-persisted `shownMonth` = month of today, used for all month computations so switching can be added later.
  Renders `shown-month`, the category select (creation order, first preselected, keeps the user's choice across
  re-renders), the expense list and `category-spent` per category row. After a successful add amount and note
  are cleared, category and date keep their values.
- `app/index.html`: header with `shown-month`; "Spent" column in the category table; new Expenses section with
  form and table. `app/styles.css`: shared `.entry-form` / `.data-table` styles (category form/table now use them).
- Assumption: invalid expense input (validation is task 005) is not silently dropped — the domain error is shown
  in a provisional `expense-error` element and the inputs are kept. Task 005 may replace texts/behaviour.
- Coverage:
  - AC1 → tests/acceptance/004-record-an-expense.spec.js "AC1: with empty storage the app shows October 2026, …"
  - AC2 → "AC2: recording 45.50 for Groceries with a note shows one expense-row and adds to category-spent"
  - AC3 → "AC3: two expenses are listed newest date first and summed per category"
  - AC4 → "AC4: expenses dated in another month are neither listed nor counted"
  - AC5 → "AC5: expenses survive a page reload and only the shown month is listed"
  - Domain incl. month boundaries (2026-09-30, 2026-10-01, 2026-10-31, 2026-11-01) → tests/unit/004-record-an-expense.test.js
## Test report
### Round 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: unit 28/28 pass; acceptance 21 passed (5 new for 004, all earlier green)
CRITERIA:
| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 | PASS | probe: clock 2026-10-12T10:00, empty storage → shown-month "October 2026", expense-date-input "2026-10-12", expense-empty "No expenses this month"; 2026-10-01T00:05 local → "2026-10-01" (no UTC off-by-one) |
| AC2 | PASS | probe: 45.50 / Groceries / today / "Weekly shop" → 1 row with all fields; Groceries spent €45.50, Transport €0.00; amount+note cleared, category+date kept |
| AC3 | PASS | probe: 45.50 today + 12,30 on 2026-10-03 (Enter) → 2 rows newest first, empty note shown empty, Groceries €57.80; 0.10+0.20 → €0.30 |
| AC4 | PASS | probe: 2026-09-30, 2026-11-01, 2025-10-12 not listed/counted; 2026-10-01 and 2026-10-31 counted; stored as integer cents with categoryId |
| AC5 | PASS | probe: scenario then reload → one row €45.50 "Weekly shop", Groceries €45.50, no console errors; task-002-era storage loads cleanly |
OBSERVATIONS:
1. Invalid expense input is rejected with a provisional expense-error and nothing stored; task 005 may replace the texts.
2. Unit tests cover month boundaries 09-30, 10-01, 10-31, 11-01.
3. Vocabulary matches purpose.md.

## Ratification
2026-10-12 — ratified by /build: all 5 criteria PASS (tester round 1).
