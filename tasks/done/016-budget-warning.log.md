
### Attempt 1
- Decisions: pure `budgetWarning(month, names, expenses, budgets)` returns lines; app renders a hidden-when-empty `<ul id="budget-warning">`, refreshed from renderCategories (runs on every expense/budget change).
- Open: no browser test of the DOM wiring.
- Where: src/warning.js, test/warning.test.js, src/app.js, index.html.
