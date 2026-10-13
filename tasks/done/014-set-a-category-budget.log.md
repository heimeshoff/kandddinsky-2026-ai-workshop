### Attempt 1
- Decisions: `src/budgets.js` store, per category `{month: cents|null}`; null = removal marker. Latest setting <= month wins. Key `budget.budgets`. UI per category row: input, Set budget, Remove budget (acts on viewed month); rename/delete hooked in app.js.
- Open: UI not browser-tested.
- Where: src/budgets.js, test/budgets.test.js, src/app.js.
