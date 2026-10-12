---
id: "005"
title: Reject invalid expenses
milestone: M01
depends_on: ["004"]
parent: null
split_into: []
attempts: 0
---
## Goal
An expense is only recorded when its amount is greater than zero, it belongs to an existing category and it has
a date; otherwise nothing is recorded and the user sees why.

## Acceptance criteria
- AC1: Given today is 2026-10-12 and "Groceries" (300) exists, When the user records an expense for "Groceries" with amount "0" (and, separately, "-5"), Then no `expense-row` is shown, "Groceries" shows `category-spent` "€0.00" and `expense-error` shows "Expense amount must be greater than zero".
- AC2: Given "Groceries" exists, When the user records an expense with amount "" (empty), "abc" or "4.999" (each tried separately), Then no `expense-row` is shown and `expense-error` shows "Expense amount must be a valid amount in euros, e.g. 12.50".
- AC3: Given "Groceries" exists, When the user clears `expense-date-input` and records an expense of "10" for "Groceries", Then no `expense-row` is shown and `expense-error` shows "Please choose a date".
- AC4: Given the app is opened with empty storage (no categories), Then `expense-add-button` is disabled and `expense-hint` shows "Add a category first to record expenses"; When the category "Groceries" (300) is then added, Then `expense-add-button` is enabled, `expense-hint` is hidden and "Groceries" is selected in `expense-category-select`.
- AC5: Given a rejected attempt left an error visible, When the user then records a valid expense of "10" for "Groceries" today, Then `expense-error` is empty or hidden, one `expense-row` with "€10.00" is shown, and after a page reload exactly that one expense exists.

## Notes
- Rules from purpose.md: an expense amount is greater than zero; every expense belongs to exactly one existing
  category. Validation lives in `app/domain.js` and is unit-tested, including "category id does not exist" →
  rejected; the UI only displays the returned error.
- On rejection keep the user's input in the fields so it can be corrected.
- Assumption: the error texts above are fixed here for stable tests.
- Assumption: with no categories the expense form cannot be submitted (button disabled plus hint) instead of
  showing an error after submitting.
- Selectors: `expense-error`, `expense-hint`.

## Implementation log
## Test report
## Ratification
