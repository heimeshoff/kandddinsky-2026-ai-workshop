### Attempt 1
- Decisions: added `update(month, position, fields)` to the expense store (shared `build` validation with `add`). UI: Edit button per row turns the row into inline fields with Save/Cancel; errors shown in the row.
- Open: UI not browser-tested (no browser tests in repo).
- Where: src/expenses.js, src/app.js, test/expenses.test.js (section "edit").
