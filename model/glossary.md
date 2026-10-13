# Glossary

- **Month** — a calendar month (e.g. 2026-10). Everything is grouped by month. — "October 2026"
- **Current month** — the month that contains today. — today 2026-10-13 → October 2026
- **Past month** — any month before the current month, from the first month with data on. — September 2026
- **Income** — the one amount of money received in a month. Not an expense. Never negative. — 2,500.00 €
- **Carry-over** — a month without its own income uses the income of the latest earlier month that has one. — Sep 2,500 → Oct shows 2,500 until changed
- **Category** — a name grouping expenses. Unique, case-insensitive. — Rent, Food, Insurance
- **Expense** — money spent: amount (> 0, EUR, 2 decimals), category, date, optional note. Belongs to the month of its date. — 54.20 € Food on 2026-10-05 "groceries"
- **Spent** — sum of expenses, for a month or a category in a month. — Food Oct: 312.40 €
- **Average** — for a category: total spent in all past months ÷ number of past months. Months with no expense in that category count as 0. Current month excluded. — Food: 300, 0, 330 → 210.00 €
- **Expected rest** — for a category: max(0, average − spent this month). What will likely still be spent. — avg 210, spent 150 → 60
- **Projected balance** — income − spent − sum of expected rest over all categories. Money likely left at month end. Can be negative. — 2,500 − 1,400 − 300 = 800.00 €
- **Budget** — planned limit for a category per month, > 0 EUR. Applies from the month set on, carries over, never backwards; can be removed from a month on. — Food 400.00 € from Oct 2026
- **Projected spent** — for a category in the current month: spent + expected rest. — spent 350, avg 450 → 450.00 €
- **Over budget** — spent or projected spent strictly greater than the budget. 400 of 400 is not over. — Food spent 420 of 400
- **Budget warning** — one box listing every over-budget line for the viewed month (and year). — "Food: spent 420.00 € of 400.00 €"
- **Year budget** — sum of monthly budgets Jan–Dec of a calendar year; months without budget count as 0. — 400 from Oct → 1,200.00 €
- **Year projected spent** — spent Jan..current month + expected rest this month + average × remaining months. — 3,000 + 50 + 300×2 = 3,650.00 €
