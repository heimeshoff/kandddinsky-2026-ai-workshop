# Budget app — how this repository works

We build a budgeting web app with an agent workflow. `workflow.html` shows it visually; this file is the
binding version for every agent and skill.

## Workflow in one paragraph

A human writes `purpose.md` once and then describes milestones (`/plan-milestone`) or single tasks
(`/add-task`). The **planner** agent turns them into task files in `tasks/backlog/`. `/build` (the conductor)
then runs fully automatically: it picks the next ready task, an **implementer** agent builds it test-first
(or splits it into subtasks if it is too big), and an independent **tester** agent checks every acceptance
criterion. PASS → the task is ratified (moved to `tasks/done/`, changelog line, git commit). FAIL → back to
the implementer, at most 2 retries, then `tasks/blocked/` for the human. When all tasks of a milestone are
ratified, the tester runs a milestone acceptance pass. `/status` shows the board, `/unblock` hands a blocked
task back.

## Source of truth

- `purpose.md` — why the software exists, domain rules, vocabulary. Use its vocabulary in code, UI and tests.
  If something contradicts purpose.md, purpose.md wins; if purpose.md is silent or ambiguous, ask — don't invent.
- The task's folder is its status: `tasks/backlog/ → doing/ → review/ → done/`, or `blocked/`.

## Tech conventions

- **No build step.** `app/index.html` must work when opened directly from disk (`file://`).
  Therefore: classic `<script src>` tags, **no ES modules, no CDN, no frameworks**.
- **Domain logic** lives in `app/domain.js` (pure functions/objects, no DOM). It uses the UMD footer already
  in the file so it loads both in the browser (`window.Budget`) and in Node (`require('../../app/domain.js')`).
  Split into more `app/domain-*.js` files only if one grows large; keep the same UMD pattern and add the
  `<script>` tag to `index.html` in dependency order.
- **UI** lives in `app/ui.js` (DOM wiring, rendering) and `app/styles.css`. The UI calls the domain; it never
  holds business rules itself.
- **Persistence:** `localStorage`, behind small `load()`/`save()` functions so tests can reason about it.
  Data must survive a page reload.
- **Money:** store amounts as integer cents. Never use floats for money.
- **Selectors:** give interactive elements and important outputs a `data-testid` so acceptance tests are stable.

## Tests

- `npm test` runs everything; it must be green before a task can go to review.
- Unit tests: `tests/unit/NNN-<slug>.test.js`, Node's built-in `node:test` + `node:assert/strict`, testing `app/domain.js`.
- Acceptance tests: `tests/acceptance/NNN-<slug>.spec.js`, Playwright. One `test()` per acceptance criterion,
  named `"AC1: <criterion>"`. Open the app with `openApp(page)` from `tests/acceptance/helpers.js`, which
  also collects console errors — assert they are empty.
- The tester writes its own throwaway probes in `.tester/` (git-ignored), run with `npm run probe`.

## Task file format

```markdown
---
id: "007"                 # 3 digits; subtasks get "007.1", "007.2"
title: Add a spending category
milestone: M01            # or "none" for stand-alone tasks
depends_on: ["005"]       # ids that must be in done/ first
parent: null              # set on subtasks
split_into: []            # set on a parent that was split
attempts: 0               # failed tester rounds so far
---
## Goal
One or two sentences, in purpose.md vocabulary, of the user-visible behaviour.

## Acceptance criteria
- AC1: Given … When … Then …
- AC2: …

## Notes
Hints, edge cases, out of scope.

## Implementation log      <!-- appended by implementer -->
## Test report             <!-- appended by conductor from tester verdicts, one per round -->
## Ratification            <!-- appended by conductor on PASS -->
```

Milestones live in `milestones/MNN-<slug>.md` with a `## Story`, `## Done when`, `## Tasks` and
`## Acceptance report` section, and a `status:` of `planned | in-progress | accepted-by-tester | closed`.

## Git

- One commit per planning run (`plan: M01 …`) and one per ratified task (`task 007: <title>`).
- Only the conductor (`/build`) and the planning skills commit. Agents never commit, never push.
