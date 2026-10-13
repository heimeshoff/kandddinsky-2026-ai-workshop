---
id: 018
title: Browser smoke test for the UI
depends_on: []
---

## Goal
A test opens the real app in a browser and walks the core flows, so a broken page (like the bad `<script>` tag in task 004) fails a test before it ships.

## Acceptance criteria
- Given the app, when I run one documented command, then a headless real browser loads `index.html` and the smoke tests run without manual steps.
- Given a broken page script (e.g. a wrong `<script>` path or a syntax error), when the smoke tests run, then they fail.
- Given an empty app, when the test sets the October 2026 income to 2,500.00 €, adds category Food and records 54.20 € Food on 2026-10-05, then the page shows Food spent 54.20 € and the projected balance updates.
- Given that data, when the test reloads the page, then income, category and expense are still shown.
- Given that data, when the test switches to November 2026, then the income shows 2,500.00 € (carry-over) and Food spent shows 0.00 €.
- Given that data, when the test edits the expense to 60.00 € and then deletes it, then Food spent shows 60.00 € and then 0.00 €.
- Given the test runs, then each run starts from empty stored data (no leftovers from earlier runs or from the user's own browser).
- Given `npm test`, then the existing unit tests still run as before and stay fast (browser tests may be a separate command).

## Domain notes
- Smoke test = a few end-to-end happy paths, not a full re-check of every criterion of tasks 001–013. Unit tests stay the main check for domain rules.
- "Today" must be fixed in the test (2026-10-13) so results don't depend on the real date.
- Tool choice is up to the implementer; pick one that runs a real browser engine, headless, from the command line.
- Out of scope: budget screens (tasks 014–017), visual/screenshot comparison, cross-browser matrix, CI setup.

## Notes
