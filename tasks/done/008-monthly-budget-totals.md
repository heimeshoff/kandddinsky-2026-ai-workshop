---
id: "008"
title: Show the monthly budget totals
milestone: M01
depends_on: ["006"]
parent: null
split_into: []
attempts: 0
---
## Goal
For the shown month the user sees the totals of the whole monthly budget: monthly budget (sum of all budgeted
amounts), total spent, total remaining (monthly budget − total spent) and usage.

## Acceptance criteria
- AC1: Given storage is empty, When the app is opened, Then `total-monthly-budget` shows "€0.00", `total-spent` "€0.00", `total-remaining` "€0.00" and `total-usage` "–".
- AC2: Given today is 2026-10-12 and the categories "Groceries" (300.00), "Eating out" (120.00) and "Transport" (80.00) exist, with October 2026 expenses of 57.80 for "Groceries" and 60.00 for "Eating out", When the app is opened, Then `total-monthly-budget` shows "€500.00", `total-spent` "€117.80", `total-remaining` "€382.20" and `total-usage` "24%" (117.80 / 500.00 = 23.56 %, rounded).
- AC3: Given the state of AC2, When an expense of 100.00 for "Groceries" dated 2026-09-15 is recorded, Then the totals are unchanged (only the shown month counts).
- AC4: Given "Eating out" (120.00) is the only category and has 150.00 spent today, When the app is opened, Then `total-remaining` shows "-€30.00", `total-usage` "125%" and the `totals` container has `data-over-budget="true"`; in the state of AC2 it has `data-over-budget="false"`.
- AC5: Given the state of AC2, When the category "Gifts" (50.00) is added and an expense of 10.00 for "Transport" is recorded today, Then without a reload the totals show monthly budget "€550.00", total spent "€127.80", total remaining "€422.20", usage "23%"; after a page reload the same values are shown and no console errors occurred.

## Notes
- Domain: totals for a month (monthly budget, total spent, total remaining, usage), built from the per-category
  functions of tasks 004/006, with the same rounding and zero-budget rule as category usage. Unit-test the empty
  case and the over-budget case.
- Selectors: `totals` (container, carries `data-over-budget`), `total-monthly-budget`, `total-spent`,
  `total-remaining`, `total-usage`.
- Assumption: when total spent > monthly budget the totals are styled like an over-budget category (same CSS
  treatment). purpose.md defines over budget as spent > budgeted; applying it to the whole monthly budget is a
  display choice, not a new rule.
- Fix "today" with `await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'))` before `openApp(page)`.

## Implementation log
### Round 1 — 2026-10-12
- `app/domain.js`: new `monthlyBudget(categories)` and `totalsInMonth(categories, expenses, month)` →
  `{ monthlyBudget, spent, remaining, usage, overBudget }`, built from `spentInMonth`, `usagePercent` and
  `isOverBudget`, so it uses the same rounding, zero-budget rule and over-budget rule as categories.
- `app/index.html`: new `totals` section above Categories with `total-monthly-budget`, `total-spent`,
  `total-remaining`, `total-usage` and a hidden `totals-over-budget` badge.
- `app/ui.js`: `renderTotals` sets the values, `data-over-budget` and the `over-budget` class; it runs on every render,
  so totals update right after adding a category or expense.
- `app/styles.css`: the totals are shown as cards. When over budget, total remaining is red, its card has a red
  border and an "Over budget" badge appears, matching the over-budget category styling.
- Decisions and assumptions: total spent sums the spent of the existing categories, as purpose.md says. Expenses
  with an unknown category are ignored, though they cannot exist anyway. Monthly budget 0 with spending gives
  usage "–" and is over budget, the same as a category with budget 0.
- AC1 → tests/acceptance/008-monthly-budget-totals.spec.js "AC1: with empty storage the totals show …"
- AC2 → "AC2: three categories with October expenses show monthly budget €500.00 …"
- AC3 → "AC3: an expense dated in September leaves the October totals unchanged"
- AC4 → "AC4: over the monthly budget shows remaining -€30.00, usage 125% and data-over-budget=\"true\" …"
- AC5 → "AC5: adding a category and an expense updates the totals without reload, and they survive a reload"
- Unit tests: tests/unit/008-monthly-budget-totals.test.js (empty case, shown-month filter, over budget, equal to
  budget, zero budget, expenses with an unknown category).
## Test report
### Round 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: unit 57 passed / 0 failed; acceptance 41 passed; no regressions in 001–007
CRITERIA:
| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 | PASS | probe: empty storage → "€0.00", "€0.00", "€0.00", "–", data-over-budget "false", badge hidden, labels shown; same after reload; no console errors |
| AC2 | PASS | probe: Groceries 300.00, Eating out 120.00, Transport 80.00; 57.80 (10-01) + 60.00 (10-31); after reload → "€500.00", "€117.80", "€382.20", "24%" |
| AC3 | PASS | probe: 100.00 on 2026-09-15 and 5.00 on 2026-11-01 → totals unchanged; unit test: 2026-09 totals count only September |
| AC4 | PASS | probe: only Eating out 120.00 with 150.00 today, reload → "€120.00", "€150.00", "-€30.00", "125%", data-over-budget "true", badge visible; AC2 state "false" |
| AC5 | PASS | probe: + Gifts 50.00 and 10.00 Transport → "€550.00", "€127.80", "€422.20", "23%" without and after reload |
FINDINGS: none
OBSERVATIONS:
- Rejected input leaves totals unchanged; exactly at budget → "€0.00"/"100%" not over; +0.01 → over with badge; budget 0 with 5.00 → "–", "-€5.00", over.
- Rules in app/domain.js (monthlyBudget, totalsInMonth); ui.js only formats.
- 550.01/550 rounds to "100%" while over budget — consistent with rounding rule.

## Ratification
2026-10-12 — ratified by /build: all 5 criteria PASS (tester round 1).
