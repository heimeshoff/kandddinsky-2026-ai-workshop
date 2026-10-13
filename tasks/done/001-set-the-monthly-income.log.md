### Attempt 1
- Decisions: vanilla JS ES modules, no deps, node:test (`npm test`). Amounts as integer cents. Incomes stored in localStorage key `budget.incomes` as {"YYYY-MM": cents} (ready for task 002). Manual number formatting (no ICU dependence). Thousands separators in input rejected.
- Open: UI (index.html/app.js) not browser-tested; logic fully unit-tested. Serve via any static server (ES modules need http).
- Where: src/money.js, src/income.js, src/app.js, index.html; test/money.test.js, test/income.test.js.
- Backlog: none
