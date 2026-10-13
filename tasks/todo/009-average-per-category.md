---
id: 009
title: Show average spent per category over past months
depends_on: [008]
---

## Goal
I see what I usually spend per category, so I can judge the current month.

## Acceptance criteria
- Given today 2026-10-13 and Food spent July 300.00 €, August nothing, September 330.00 €, with July the first month with data, when I view October, then Food's average shows 210.00 €.
- Given expenses only in the current month, then every category's average shows "–".
- Given October Food expenses, then they do not change Food's average.
- Given a category with no expenses in any past month while other categories have past data, then its average shows 0.00 €.
- Given an average of 100/3, then it shows 33.33 €.

## Domain notes
- **Past month**: a month before the current month, from the first month that has any expense or own income on.
- **Average** per category: total spent in all past months ÷ number of past months. Months without expenses in that category count as 0.
- The average is always relative to the *current* month (today), regardless of which month is shown.
- Round to 2 decimals for display only.
- Out of scope: configurable averaging window, median, trends.

## Notes
