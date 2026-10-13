---
title: Browser tests for the UI
source: task 004
---

Only domain logic is unit-tested; index.html and src/app.js are never run in a test. Task 004 shipped a broken `<script>` tag that all tests missed (caught in verify).
- Add a smoke/acceptance test in a real browser (e.g. Playwright)?
- Which criteria should be checked end to end?
