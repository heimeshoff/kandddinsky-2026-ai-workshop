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
### Round 1 — 2026-10-12
- `app/domain.js`: `EXPENSE_ERRORS` now has the fixed texts `amountInvalid` ("Expense amount must be a valid
  amount in euros, e.g. 12.50"), `amountNotPositive` ("Expense amount must be greater than zero"), `dateMissing`
  ("Please choose a date") and `categoryUnknown` ("Please choose an existing category"). `validateExpense` checks in
  this order: amount is integer cents → amount > 0 → category id exists → date is a real calendar date. Task 004's
  provisional texts (`amountInvalid` combined text, `dateInvalid`) were replaced.
- `app/ui.js`: `renderCategorySelect` disables `expense-add-button` and the category select and shows
  `expense-hint` while there are no categories; the first category is preselected once one exists. The UI only
  displays the domain's error; on rejection all inputs are kept; a successful add hides `expense-error`.
- `app/index.html`: new `expense-hint` paragraph; `app/styles.css`: `.form-hint` style.
- Assumptions: an invalid date string (not only an empty one) also gets "Please choose a date"; "-0" parses to 0 and
  gets "greater than zero"; the unknown-category text is not specified by the task and only reachable via the domain.
- Coverage (tests/acceptance/005-reject-invalid-expenses.spec.js):
  - AC1 → "AC1: an amount of "0" or "-5" is rejected with "Expense amount must be greater than zero""
  - AC2 → "AC2: an empty, non-numeric or over-precise amount is rejected as not a valid amount in euros"
  - AC3 → "AC3: an expense without a date is rejected with "Please choose a date""
  - AC4 → "AC4: without categories the expense form is disabled with a hint; adding a category enables it"
  - AC5 → "AC5: after a rejected attempt a valid expense clears the error and is the only one stored after reload"
  - Domain rules incl. "category id does not exist" → tests/unit/005-reject-invalid-expenses.test.js
## Test report
### Round 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: unit 36/36 pass; acceptance 26 passed (tasks 001–005 green)
CRITERIA:
| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 | PASS | probe: "0", "-5", "0.00", "0,00", "-0", "-0.01", "-5.50" → "Expense amount must be greater than zero", 0 rows, spent €0.00, input kept, nothing stored (also after reload) |
| AC2 | PASS | probe: "", "abc", "4.999", "   ", "1e3", "12.5.0", "€10", "--5", "1,000.00" → "Expense amount must be a valid amount in euros, e.g. 12.50", 0 rows, nothing stored |
| AC3 | PASS | probe: cleared date, amount 10, note kept → "Please choose a date", 0 rows, inputs kept; setting date then submitting records 1 row and hides error |
| AC4 | PASS | probe: empty storage → expense-add-button disabled, expense-hint text exact; Enter/forced click record nothing; after adding Groceries → enabled, hint hidden, Groceries selected; holds after reload |
| AC5 | PASS | probe: "-5", "abc", then "10" → error hidden, 1 row €10.00, spent €10.00; after reload stored {amount:1000, date:"2026-10-12"} |
FINDINGS: none
OBSERVATIONS:
1. validateExpense in app/domain.js checks amount format → >0 → category exists → valid date; ui.js only displays. Unknown category id rejected with "Please choose an existing category".
2. Malformed date also gets "Please choose a date"; not reachable via the date input.
3. "-0" parses to 0 → greater-than-zero message.
4. Error texts use purpose.md vocabulary.

## Ratification
2026-10-12 — ratified by /build: all 5 criteria PASS (tester round 1).
