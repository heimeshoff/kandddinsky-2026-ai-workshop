
### Attempt 1
- Decisions: extended `budgetWarning` in src/warning.js; year line follows the month line per category. Current month detected via projected cents being non-null. Year budget 0 (no budget in year) skips the line. Spec example numbers (3,000 spent, rest 50) are not reachable with the real store; tests use 2,950 spent -> 3,600.
- Open: existing tests updated, since year lines now appear in addition. No app.js change needed (renderWarning already re-runs on change); no browser test.
- Where: src/warning.js, test/warning.test.js.
