---
id: 003
title: Income carries over to later months
depends_on: [002]
---

## Goal
I enter my income once; later months reuse it until I change it.

## Acceptance criteria
- Given September income 2,500.00 € and no October income, when I view October, then the income shows 2,500.00 €.
- Given September income 2,500.00 € and no income for October or November, when I view November, then the income shows 2,500.00 €.
- Given September income 2,500.00 €, when I set October to 2,700.00 €, then September still shows 2,500.00 € and November shows 2,700.00 €.
- Given October income 2,500.00 € and no earlier income, when I view September, then the income shows 0.00 €.
- Given carried-over income in November, when I set November to 0, then November shows 0.00 € and December shows 0.00 €.
- Given income set in September and October changed, when I reload, then all months show the same values as before.

## Domain notes
- **Carry-over**: a month without own income uses the income of the latest earlier month that has one.
- Carry-over never flows backwards in time.
- Entering an income for a month only changes that month (and later months that carry over from it).
- 0 is a real income value and carries over like any other.
- Out of scope: marking which months are carried over vs. explicitly set (optional, not required).

## Notes
