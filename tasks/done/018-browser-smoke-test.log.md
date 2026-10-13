
### Attempt 1
- Decisions: Playwright (`playwright-core@1.56.1`, devDependency, added via npm install) driving headless Chromium from the local ms-playwright cache. Command: `npm run test:browser`. `npm test` unchanged (glob excludes `test/browser/`).
- Decisions: tiny node http server serves the repo (ES modules need http). Fresh browser context per run = empty storage. `context.clock.setFixedTime` fixes today to 2026-10-13. Broken-script criterion: a second test serves index.html with a wrong script path and asserts the flow rejects. Added `.gitignore` (node_modules).
- Open: needs Playwright's Chromium installed (`npx playwright-core install chromium` if missing).
- Where: test/browser/helpers.js, test/browser/smoke.test.js, package.json.
- Backlog: Document `npm run test:browser` in a README — none exists yet.
