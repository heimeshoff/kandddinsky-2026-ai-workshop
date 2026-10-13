### Attempt 1
- Decisions: viewed month is in-memory state of the income store (not persisted, so reload resets). Today injected via `createIncomeStore(storage, today)`. Added shiftMonth/monthLabel in src/income.js; prev/next buttons in index.html.
- Open: UI buttons not browser-tested; logic covered by unit tests.
- Where: src/income.js, src/app.js, index.html, test/income.test.js.
