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
### Round 1 — 2026-10-12
- `app/domain.js`: added `formatEuro(cents)` (built on `formatCents`; `-2000 -> "-€20.00"`), `parseAmount(text)`
  (string/regex based, "." or "," separator, max 2 decimals, optional leading "-", no thousands separators;
  returns integer cents or `null` when not an amount — task 003 can build its messages on this), and
  `addCategory(categories, name, budgetedCents)` returning a new list with `{ id, name (trimmed), budgeted }`
  appended; ids are `"c1"`, `"c2"`, … (max existing + 1, never reused).
- `app/index.html`: "Categories" section with a form (`category-name-input`, `category-budget-input`,
  `category-add-button` as submit, so Enter also works), `category-empty` paragraph and a table whose
  `tbody` holds one `category-row` per category with `category-name` / `category-budgeted` cells.
- `app/ui.js`: `load()` normalises `state.categories` to an array; submit parses, calls the domain, `save()`s,
  re-renders, clears both inputs and refocuses the name field. Empty state and table toggle via `hidden`.
- `app/styles.css`: `[hidden]` rule, form/table layout; amounts right-aligned with tabular numerals. Button
  styling unchanged (shared green rule from task 001).
- Assumption: until task 003 adds error messages, a submit with an empty name or an unparseable amount is
  silently ignored (nothing stored, inputs kept).
- Tests: `tests/unit/002-add-a-category.test.js` (parseAmount incl. float-artefact cases like "12.29" and
  invalid inputs, formatEuro, addCategory ordering/trim/ids/immutability).
- AC1 → tests/acceptance/002-add-a-category.spec.js "AC1: with empty storage no category-row is shown and category-empty says \"No categories yet\""
- AC2 → "AC2: adding \"Groceries\" with 300 shows one row with €300.00, hides empty state and clears inputs"
- AC3 → "AC3: three categories are shown in creation order with their budgeted amounts"
- AC4 → "AC4: a comma decimal separator \"12,5\" is shown as €12.50"
- AC5 → "AC5: categories survive a page reload in the same order"
## Test report
### Round 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: unit fail 0; acceptance 11 passed (5 from 002-add-a-category.spec.js)
CRITERIA:
| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 | PASS | probe: cleared localStorage + reload → 0 category-row, category-empty "No categories yet", no console errors; test AC1 asserts same |
| AC2 | PASS | probe: typed "Groceries"/"300", clicked category-add-button → rows [["Groceries","€300.00"]], empty state hidden, inputs cleared |
| AC3 | PASS | probe: "Eating out" 120.50 (click), "Transport" 0 (Enter) → rows in order Groceries €300.00, Eating out €120.50, Transport €0.00; stored cents [30000,12050,0] |
| AC4 | PASS | probe: "12,5" → "€12.50" (1250 cents); also "1234,56" → "€1,234.56", "12.29" → 1229 cents, name trimmed |
| AC5 | PASS | probe: two reloads → same 3 rows in order, no console errors |
FINDINGS: none
OBSERVATIONS:
1. Empty-name rule lives only in app/ui.js; Budget.addCategory accepts empty names and negative amounts ("-10" currently yields "-€10.00"). Out of scope here; task 003 (AC1, AC3) should put these rules in domain.js.
2. Empty inputs, "abc" amount, whitespace-only name store nothing; corrupt storage starts empty without crashing; Add button is green (task 001 holds).
3. Labels use purpose.md vocabulary.

## Ratification
2026-10-12 — ratified by /build: all 5 criteria PASS (tester round 1).
