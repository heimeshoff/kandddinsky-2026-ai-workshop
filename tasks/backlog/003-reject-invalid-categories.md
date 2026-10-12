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
## Test report
## Ratification
