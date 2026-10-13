### Attempt 1
- Decisions: `categories.rename(old,new)` validates (trim, empty, duplicate excluding self) and keeps order; `expenses.renameCategory` rewrites all months; app.js calls both. Inline rename row with Save/Cancel.
- Open: UI not browser-tested (no browser tests in repo).
- Where: src/categories.js, src/expenses.js, src/app.js; tests in test/categories.test.js, test/expenses.test.js.

### Verify 1
- Conflict resolved by conductor: merged with task 013 (delete category) in app.js, categories.js and both test files; kept both behaviors.
