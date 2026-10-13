---
id: 001
title: Set the monthly income
depends_on: []
---

## Goal
I can enter how much money I receive this month, so the app knows what I have to spend.

## Acceptance criteria
- Given no income was ever entered, when I open the app, then the current month shows income 0.00 €.
- Given the current month, when I enter 2500 as income, then the income shows 2,500.00 €.
- Given income 2,500.00 € was entered, when I reload the page, then the income still shows 2,500.00 €.
- Given income 2,500.00 €, when I enter -10, then I see an error message and the income stays 2,500.00 €.
- Given income 2,500.00 €, when I enter "abc" or leave it empty, then I see an error message and the income stays 2,500.00 €.
- Given the current month, when I enter 0, then the income shows 0.00 €.

## Domain notes
- **Income**: the one amount received in a month. Never negative. EUR, max 2 decimals.
- **Current month**: the calendar month containing today.
- Accept "2500", "2500.5", "2500,50" (comma as decimal separator). Reject more than 2 decimals.
- Display format: `2,500.00 €`.
- Data stays in the browser and survives a reload.
- Out of scope: other months (task 002), carry-over (task 003), multiple incomes per month.

## Notes
