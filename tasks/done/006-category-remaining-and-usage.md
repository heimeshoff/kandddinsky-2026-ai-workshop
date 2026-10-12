---
id: "006"
title: Show remaining and usage per category
milestone: M01
depends_on: ["004"]
parent: null
split_into: []
attempts: 0
---
## Goal
For the shown month, each category shows its remaining (budgeted amount − spent) and its usage (spent as a
percentage of the budgeted amount) next to its budgeted amount and spent.

## Acceptance criteria
- AC1: Given today is 2026-10-12 and "Groceries" with budgeted amount 300.00 exists without expenses, When the app is opened, Then its `category-row` shows `category-remaining` "€300.00" and `category-usage` "0%".
- AC2: Given "Groceries" (300.00) has expenses 45.50 and 12.30 dated in October 2026, When the app is opened, Then its row shows `category-spent` "€57.80", `category-remaining` "€242.20" and `category-usage` "19%" (57.80 / 300.00 = 19.27 %, rounded).
- AC3: Given "Eating out" (120.00) has an expense of 60.00 dated 2026-10-05 and one of 100.00 dated 2026-09-20, When the app is opened, Then its row shows `category-spent` "€60.00", `category-remaining` "€60.00" and `category-usage` "50%" (the September expense is not counted).
- AC4: Given "Transport" with budgeted amount 0 and no expenses, When the app is opened, Then its row shows `category-remaining` "€0.00" and `category-usage` "–" (en dash: usage is not defined for a budgeted amount of zero).
- AC5: Given the state of AC2, When the page is reloaded, Then the row still shows spent "€57.80", remaining "€242.20" and usage "19%", and no console errors occurred.

## Notes
- Domain: remaining (integer cents) and usage (integer percent) per category for a given month. Usage =
  spent × 100 / budgeted, rounded to the nearest whole percent (half up), computed with integers. Unit-test:
  budgeted 0 → no usage (e.g. `null`), exactly 100 %, 19.27 → 19, 19.5 → 20, spent above budgeted → above 100 %
  and negative remaining.
- Selectors inside each `category-row`: `category-remaining`, `category-usage`.
- Over-budget values (negative remaining, usage above 100 %) come out of the same functions; their visual
  highlighting is task 007.
- Assumption: usage is shown as a whole percent ("19%"); for a budgeted amount of 0 it is shown as "–".
- Fix "today" with `await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'))` before `openApp(page)`.

## Implementation log
### Round 1 — 2026-10-12
- `app/domain.js`: added `usagePercent(spent, budgeted)` (integer half-up rounding via
  `floor((200·spent + budgeted) / (2·budgeted))`, `null` for budgeted 0), `formatUsage(usage)` ("19%" / "–"),
  and `categoryInMonth(category, expenses, month)` → `{ spent, remaining, usage }` (remaining may be negative).
- `app/ui.js`: category rows render `category-remaining` and `category-usage` from `categoryInMonth`; no rules in the UI.
- `app/index.html`: category table gets "Remaining" and "Usage" columns (right-aligned like the other amounts).
- Assumptions: usage of an over-budget category is shown unclamped (e.g. "125%"); over-budget highlighting left to task 007.
- Coverage:
  - AC1 → tests/acceptance/006-category-remaining-and-usage.spec.js "AC1: Groceries (300.00) without expenses shows remaining €300.00 and usage 0%"
  - AC2 → same file "AC2: Groceries (300.00) with 45.50 and 12.30 in October shows spent €57.80, remaining €242.20, usage 19%"
  - AC3 → same file "AC3: Eating out (120.00) counts only the October expense: spent €60.00, remaining €60.00, usage 50%"
  - AC4 → same file "AC4: Transport with budgeted amount 0 and no expenses shows remaining €0.00 and usage "–""
  - AC5 → same file "AC5: after a reload the Groceries row still shows spent €57.80, remaining €242.20, usage 19%"
  - Domain rules (budgeted 0 → null, exactly 100 %, 19.27 → 19, 19.5 → 20, over budget → >100 % and negative remaining)
    → tests/unit/006-category-remaining-and-usage.test.js

## Test report
### Round 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: unit 45/45 pass; acceptance 31 passed (5 new for 006)
CRITERIA:
| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 | PASS | probe: Groceries 300.00, clock 2026-10-12 → remaining "€300.00", usage "0%"; same on fresh page from stored data |
| AC2 | PASS | probe: 45.50 (10-01) + "12,30" (10-31) + 5.00 (11-01, not counted) → "€57.80" / "€242.20" / "19%" |
| AC3 | PASS | probe: Eating out 120.00, 60.00 (10-05) + 100.00 (09-20) → "€60.00" / "€60.00" / "50%" before and after reload |
| AC4 | PASS | probe: Transport 0 → remaining "€0.00", usage U+2013 en dash, stable after reload |
| AC5 | PASS | probe + test: after reload Groceries €57.80 / €242.20 / 19%; no console errors |
FINDINGS: none
OBSERVATIONS:
- Neighbour cases correct: 100.00 of 80.00 → "-€20.00"/"125%"; spent = budget → "€0.00"/"100%"; 19.5% → "20%"; budget 0 with 10.00 → "-€10.00"/"–".
- Unit tests cover all domain cases from the Notes.
- Over-budget highlighting is task 007.

## Ratification
2026-10-12 — ratified by /build: all 5 criteria PASS (tester round 1).
