### Attempt 1
- Decisions: plain JS store over storage (key `budget.categories`, array of trimmed names, insertion order); duplicate check case-insensitive. UI list + form in index.html/app.js.
- Open: UI not browser-tested; logic unit-tested only.
- Where: src/categories.js, test/categories.test.js, src/app.js, index.html.

### Verify 1
- Fixed by conductor: `<scripttype=` typo in index.html (UI would not load). No UI test caught it.
