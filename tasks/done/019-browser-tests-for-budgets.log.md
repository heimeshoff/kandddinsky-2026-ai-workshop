### Attempt 1
- Decisions: new file test/browser/budget.test.js; flow: add category, set budget 50, no warning, spend 60, warning shows "Food: spent 60.00 € of 50.00 €", survives reload. Reused helpers.
- Open: node_modules was absent in main and worktree; ran `npm install` in worktree (playwright-core). Open question in task (future UI tasks add browser checks?) left to the human.
- Where: test/browser/budget.test.js
- Backlog: Decide rule that each UI task adds a browser check — open question from task 019
