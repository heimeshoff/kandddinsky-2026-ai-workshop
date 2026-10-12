---
id: M01
title: Core budget loop for the current month
status: accepted-by-tester
---
## Story
As the user, I create categories, each with a budgeted amount, and record expenses against them (amount,
category, date, optional note). For the current month I see per category what I have spent, what remains and
the usage, plus the totals for the whole monthly budget (monthly budget, total spent, total remaining, usage).
Categories that are over budget stand out clearly, with a negative remaining amount. All data survives a page
reload.

Switching to other months is not part of this milestone (planned for a later one); the app shows the current
month only. Expenses dated in another month are therefore not counted in what is shown.

## Done when
- The user can create categories with a name and a budgeted amount in euros; empty names, duplicate names
  (ignoring upper/lower case) and negative or invalid budgeted amounts are rejected with a visible reason.
- The user can record expenses (amount greater than zero, an existing category, a date, an optional note); invalid
  expenses are rejected with a visible reason.
- The app shows the current month and, for it, per category the budgeted amount, spent, remaining and usage;
  expenses dated in another month are not counted.
- The monthly totals (monthly budget, total spent, total remaining, usage) are shown for the current month.
- Over-budget categories are recorded and stand out clearly, with a negative remaining amount.
- All categories and expenses survive a page reload.

## Tasks
- [x] 002 Add a category with a budgeted amount
- [x] 003 Reject invalid categories
- [x] 004 Record an expense and see it in the current month
- [x] 005 Reject invalid expenses
- [x] 006 Show remaining and usage per category
- [x] 007 Highlight categories that are over budget
- [x] 008 Show the monthly budget totals

## Acceptance report
### Run 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: unit 57/57, acceptance 41/41; probe .tester/M01-e2e.spec.js 1/1 (real typing/clicks from empty storage, month derived from system date)

| Done when | Verdict | Evidence |
|-----------|---------|----------|
| Create categories; invalid ones rejected with a visible reason | PASS | 3 categories added ("120,00" accepted); empty/blank name, duplicates ignoring case, "-5", "abc", "", "1.234", "1e3" each rejected with category-error, row count unchanged |
| Record expenses; invalid ones rejected with a visible reason | PASS | "0"/"-5", ""/"abc"/"1.234", empty date, forged category "c999" each rejected, nothing stored; valid expenses with/without note recorded; form disabled with hint when no categories |
| Current month with budgeted/spent/remaining/usage per category; other months not counted | PASS | "October 2026"; Groceries €300.00/€57.80/€242.20/19% excluding the previous month's 999.00; next month's 77.00 excluded; budget 0 → "–" |
| Monthly totals for the current month | PASS | €420.00 / €212.80 / €207.20 / 51%; after +300.00 → -€92.80, totals over budget with badge |
| Over-budget categories stand out with negative remaining | PASS | Eating out 150.00 of 120.00 → -€30.00, 125%, data-over-budget="true", badge, distinct colour; Transport budget 0 with 5.00 → over budget |
| Data survives a reload | PASS | all values and rows identical after reload; storage holds integer cents |
| Story end to end | PASS | full flow from cleared storage, no console errors |

Observations: some invalid input is already blocked by the browser (select, date input); domain rules still cover it. Labels use purpose.md vocabulary.
