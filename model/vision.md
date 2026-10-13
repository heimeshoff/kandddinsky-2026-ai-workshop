# Vision

## For whom
One person running a household. Single user, no accounts, no sharing.
Built as a workshop demo of agentic development.

## Problem
Money comes in once a month and goes out to rent, food, insurances, etc.
The user wants to know, at any point in the month:
- how much money will be left at the end of the month,
- how much they usually spend per category.

## What it does
- Record the monthly income (carried over to the next month by default).
- Record expenses by hand, each in a category.
- Show spending per category for the month.
- Show the average spending per category over past months.
- Project the money left at month end.
- Set a budget per category and warn when spent or projected (month and year) exceeds it.

## Out of scope
- Multiple users, sharing, login.
- Bank import, receipts scanning, sync.
- Multiple currencies (everything in EUR).
- Several incomes per month, savings goals, recurring-expense automation.

## Constraints
- Runs in the browser. Data stays on the device and survives a reload.
