---
id: 002
title: Switch between months
depends_on: [001]
---

## Goal
I can look at earlier and later months, so I can see and edit each month separately.

## Acceptance criteria
- Given today is 2026-10-13, when I open the app, then the shown month is "October 2026".
- Given "October 2026" is shown, when I press "previous month", then "September 2026" is shown.
- Given "October 2026" is shown, when I press "next month", then "November 2026" is shown.
- Given "December 2026" is shown, when I press "next month", then "January 2027" is shown.
- Given October income 2,500.00 € and September income 2,000.00 € were entered while viewing those months, when I switch between them, then each month shows its own income.
- Given I switched to another month, when I reload the page, then the current month is shown again.

## Domain notes
- **Month**: a calendar month. Income belongs to exactly one month.
- No limit on how far back or forward one can navigate.
- Tests need a controllable "today".
- Out of scope: carry-over of income (task 003). Until 003 is done, a month without own income shows 0.00 €.

## Notes
