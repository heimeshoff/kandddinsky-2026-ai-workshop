---
id: "002"
title: Add a category with a budgeted amount
milestone: M01
depends_on: []
parent: null
split_into: []
attempts: 0
---
## Goal
The user creates a category by entering a name and a budgeted amount in euros. The category then appears in
the list of categories with its budgeted amount and is still there after a page reload.

## Acceptance criteria
- AC1: Given storage is empty, When the app is opened, Then no `category-row` is shown and `category-empty` shows "No categories yet".
- AC2: Given the app is opened with empty storage, When the user types "Groceries" into `category-name-input`, "300" into `category-budget-input` and clicks `category-add-button`, Then exactly one `category-row` is shown whose `category-name` is "Groceries" and whose `category-budgeted` is "€300.00", `category-empty` is no longer visible, and both inputs are empty again.
- AC3: Given the category "Groceries" with budgeted amount "300" exists, When the user adds "Eating out" with budgeted amount "120.50" and then "Transport" with budgeted amount "0", Then three `category-row`s are shown in creation order: "Groceries" €300.00, "Eating out" €120.50, "Transport" €0.00.
- AC4: Given the app is opened with empty storage, When the user adds "Groceries" with budgeted amount "12,5" (comma as decimal separator), Then its `category-budgeted` shows "€12.50".
- AC5: Given the categories "Groceries" (300) and "Eating out" (120.50) were added, When the page is reloaded, Then both `category-row`s are still shown with the same names and budgeted amounts in the same order, and no console errors occurred.

## Notes
- Domain (`app/domain.js`): creating a category (name, budgeted amount in integer cents, a stable id), a parser
  that turns user input like "300", "120.50", "12,5" into integer cents (string-based, never float arithmetic
  that can yield e.g. 1229.9999), and `formatEuro(cents)` built on the existing `formatCents`:
  `30000 -> "€300.00"`, `123456 -> "€1,234.56"`, `-2000 -> "-€20.00"`. Later tasks reuse `formatEuro` for every
  amount shown.
- Persistence: categories are stored in the existing `localStorage` state via `load()`/`save()` in `app/ui.js`.
- The category name is trimmed of surrounding whitespace before it is stored.
- Selectors (reused by later tasks, keep them stable): `category-name-input`, `category-budget-input`,
  `category-add-button`, `category-empty`, `category-row` (one per category) and inside each row
  `category-name`, `category-budgeted`.
- Assumption: amounts are entered with "." or "," as decimal separator, at most 2 decimal places, no thousands
  separators. Amounts are displayed as "€" + formatCents (e.g. "€1,234.56", negative "-€20.00").
- Assumption: categories are listed in the order they were created.
- Out of scope: validation errors (task 003), editing/deleting categories, spent/remaining/usage (later tasks).

## Implementation log
## Test report
## Ratification
