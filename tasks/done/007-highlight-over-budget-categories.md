---
id: "007"
title: Highlight categories that are over budget
milestone: M01
depends_on: ["006"]
parent: null
split_into: []
attempts: 0
---
## Goal
Spending more than the budgeted amount is allowed: the expense is always recorded, and the category is then shown
as over budget, with a negative remaining amount, clearly distinguishable from categories within budget.

## Acceptance criteria
- AC1: Given today is 2026-10-12 and "Eating out" (budgeted 120.00) exists, When the user records an expense of 150.00 for "Eating out" today, Then the expense is recorded (an `expense-row` with "€150.00" is shown) and the row shows `category-spent` "€150.00", `category-remaining` "-€30.00" and `category-usage` "125%".
- AC2: Given the state of AC1 plus "Groceries" (300.00) with no expenses, When the app is opened, Then the "Eating out" `category-row` has `data-over-budget="true"` and a visible `category-over-budget` label with the text "Over budget", while the "Groceries" row has `data-over-budget="false"` and no visible `category-over-budget`; the computed `color` of "Eating out"'s `category-remaining` differs from that of "Groceries"' `category-remaining`.
- AC3: Given "Groceries" (300.00) with expenses totalling exactly 300.00 in October 2026, When the app is opened, Then its row shows `category-remaining` "€0.00", `category-usage` "100%", `data-over-budget="false"` and no visible `category-over-budget` (spent equal to budgeted is not over budget).
- AC4: Given "Transport" with budgeted amount 0 and an expense of 5.00 today, When the app is opened, Then its row shows `category-remaining` "-€5.00", `category-usage` "–", `data-over-budget="true"` and the "Over budget" label.
- AC5: Given the state of AC1, When the page is reloaded, Then "Eating out" is still shown over budget with remaining "-€30.00", and no console errors occurred.

## Notes
- Domain: over budget (spent > budgeted amount) per category and month, unit-tested including the equal case
  and the zero-budget case.
- Visual: e.g. a red remaining amount and a red "Over budget" badge via a CSS class in `app/styles.css`. Do not
  rely on colour alone; the text label is required.
- Selectors: `data-over-budget` attribute ("true"/"false") on each `category-row`; `category-over-budget` label,
  present/visible only when over budget.
- Fix "today" with `await page.clock.setFixedTime(new Date('2026-10-12T10:00:00'))` before `openApp(page)`.

## Implementation log
### Round 1 — 2026-10-12
- `app/domain.js`: added `isOverBudget(spent, budgeted)` (spent > budgeted, so equal is within budget and a zero budget
  is over budget as soon as anything is spent) and `isCategoryOverBudget(category, expenses, month)`. `categoryInMonth`
  is unchanged because task 006's unit tests compare its result with `deepEqual`.
- `app/ui.js`: each `category-row` gets `data-over-budget="true|false"` and the class `over-budget`. Over-budget rows also
  get a `category-over-budget` badge "Over budget" in a new status cell (`category-status`). The badge is not rendered
  at all when the category is within budget.
- `app/index.html`: added a status column header (its text is hidden visually but kept for screen readers).
- `app/styles.css`: an `--over-budget` red (with a dark-mode variant) for the remaining amount, a pill badge, a
  `.visually-hidden` utility, and the category table widened from 40rem to 48rem.
- Decision: I put the badge in its own column, not inside the name cell. Inside the name cell it broke earlier tests that
  check the exact text of `category-name`.
- AC1 already passed before this change, because recording expenses and negative remaining came from tasks 004 and 006. Its test now guards that behaviour.
- Coverage (tests/acceptance/007-highlight-over-budget-categories.spec.js):
  - AC1 → "AC1: an expense of 150.00 for Eating out (120.00) is recorded; …"
  - AC2 → "AC2: Eating out is marked over budget with a label and a different remaining colour; Groceries is not"
  - AC3 → "AC3: Groceries (300.00) with exactly 300.00 spent shows €0.00, 100% and is not over budget"
  - AC4 → "AC4: Transport with budgeted amount 0 and an expense of 5.00 shows -€5.00, usage "–" and is over budget"
  - AC5 → "AC5: after a reload Eating out is still over budget with remaining -€30.00"
  - Domain rule (including the equal case, the zero-budget case and checking per month) → tests/unit/007-highlight-over-budget-categories.test.js
## Test report
### Round 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: 36 passed (unit + acceptance), 0 failed
CRITERIA:
| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 | PASS | probe: clock 2026-10-12, Eating out 120.00 + expense 150.00 → expense recorded; spent "€150.00", remaining "-€30.00", usage "125%" |
| AC2 | PASS | probe: + Groceries 300.00, reload → Eating out data-over-budget="true" with visible "Over budget" badge; Groceries "false", no badge; remaining colours differ (rgb(179,38,30) vs rgb(29,29,27)), also in dark mode |
| AC3 | PASS | probe: Groceries 300.00 + 300 in October → "€0.00", false, no badge; Eating out exactly 120.00 → "€0.00"/"100%", false |
| AC4 | PASS | probe: Transport budget 0 + 5.00 → "-€5.00", "–", true, badge; without expense false |
| AC5 | PASS | probe + test: after reload Eating out still true, label, "-€30.00"; no console errors |
FINDINGS: none
OBSERVATIONS:
- Boundaries: 100.00 within; exactly at budget within; +0.01 over at "-€0.01"; September expense doesn't affect October.
- Badge in a new status column (visually hidden header); category table widened 40rem → 48rem. Cosmetic.
- isCategoryOverBudget exported/tested but UI uses isOverBudget directly; same rule.

## Ratification
2026-10-12 — ratified by /build: all 5 criteria PASS (tester round 1).
