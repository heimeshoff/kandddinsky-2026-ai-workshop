---
id: "003"
title: Reject invalid categories
milestone: M01
depends_on: ["002"]
parent: null
split_into: []
attempts: 0
---
## Goal
When the user tries to create a category with an empty name, a name that already exists (ignoring upper/lower
case), or a budgeted amount that is negative or not a valid amount, no category is created and the user sees why.

## Acceptance criteria
- AC1: Given the app is opened with empty storage, When the user leaves `category-name-input` empty (and, separately, when it contains only spaces "   "), types "100" into `category-budget-input` and clicks `category-add-button`, Then no `category-row` is shown and `category-error` shows "Category name must not be empty".
- AC2: Given the category "Groceries" (300) exists, When the user adds a category named "groceries" (and, separately, " GROCERIES ") with budgeted amount "50", Then still exactly one `category-row` ("Groceries", €300.00) is shown and `category-error` shows `A category named "Groceries" already exists`.
- AC3: Given the app is opened with empty storage, When the user adds "Groceries" with budgeted amount "-10", Then no `category-row` is shown and `category-error` shows "Budgeted amount must be zero or more".
- AC4: Given the app is opened with empty storage, When the user adds "Groceries" with budgeted amount "" (empty), "abc" or "12.345" (each tried separately), Then in each case no `category-row` is shown and `category-error` shows "Budgeted amount must be a valid amount in euros, e.g. 300 or 12.50".
- AC5: Given a rejected attempt left an error visible, When the user then adds "Groceries" with budgeted amount "300", Then `category-error` is empty or hidden and the row "Groceries" €300.00 is shown; after a page reload exactly that one category exists.

## Notes
- Rules from purpose.md: category names are unique ignoring upper/lower case and not empty; a budgeted amount is
  zero or more. Validation lives in `app/domain.js` (unit-tested); the UI only displays the returned error.
- The duplicate message names the existing category as stored ("Groceries"), not as typed.
- On rejection keep the user's input in the fields so it can be corrected.
- Assumption: the exact error texts above are fixed here so tests are stable.
- Selector: `category-error`.

## Implementation log
### Round 1 — 2026-10-12
- `app/domain.js`: added `ERRORS` (fixed error texts), `findCategoryByName` (case- and space-insensitive),
  `validateCategory(categories, name, budgetedCents)` → error text or null (checks in order: empty name,
  duplicate name, not integer cents, negative), and `addCategoryFromInput(categories, name, amountText)` →
  `{ categories, error }`. `addCategory` now enforces the rules itself and throws on invalid input, so the
  domain can never store an invalid category (addresses the task-002 tester note).
- `app/ui.js`: the submit handler only calls `addCategoryFromInput` and displays `result.error` in
  `category-error`; on rejection the inputs are kept, on success the error is hidden and inputs cleared.
  The old UI-side empty-name check is gone.
- `app/index.html`: added `<p data-testid="category-error" role="alert" hidden>` under the form.
- `app/styles.css`: `.form-error` style (red text, left border; dark-mode variant).
- Assumption: when several rules are broken at once, only the first error (name before amount) is shown.
- Coverage:
  - AC1 → tests/acceptance/003-reject-invalid-categories.spec.js "AC1: …"; unit "validateCategory rejects an empty or blank name"
  - AC2 → "AC2: …"; unit "validateCategory rejects a duplicate name ignoring case …"
  - AC3 → "AC3: …"; unit "validateCategory rejects a negative budgeted amount"
  - AC4 → "AC4: …"; unit "addCategoryFromInput parses the amount text …"
  - AC5 → "AC5: …"
## Test report
### Round 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: unit 19/19 pass; acceptance 16/16 passed (000, 001, 002, 003 green)
CRITERIA:
| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 | PASS | probe: names "", "   " (button) and "  " (Enter) with "100" → 0 rows, category-error "Category name must not be empty", inputs kept, storage empty |
| AC2 | PASS | probe: "groceries", " GROCERIES ", "Groceries", "gRoCeRiEs" after "Groceries"/300 → still 1 row, error `A category named "Groceries" already exists`; also after reload; "Groceries extra" accepted |
| AC3 | PASS | probe: "-10", "-0.01", "-5,50" → 0 rows, "Budgeted amount must be zero or more", input kept; "0" accepted as €0.00 |
| AC4 | PASS | probe: "", "abc", "12.345", "1e3", "12.", "€300", "1 000", "   " → 0 rows, exact "Budgeted amount must be a valid amount in euros, e.g. 300 or 12.50" |
| AC5 | PASS | probe: errors then valid "Groceries"/300 → error hidden, row shown, inputs cleared; after reload 1 row, storage 30000 cents |
FINDINGS:
OBSERVATIONS:
1. Business rules only in app/domain.js (validateCategory, addCategoryFromInput); addCategory throws on invalid input; ui.js only displays result.error.
2. With both name and amount invalid only the name error is shown (logged assumption; not covered by criteria).
3. Earlier probes (001, 002) still pass.

## Ratification
2026-10-12 — ratified by /build: all 5 criteria PASS (tester round 1).
