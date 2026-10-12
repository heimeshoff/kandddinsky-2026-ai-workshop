---
name: build
description: Run the budget app's delivery loop fully automatically — pick ready tasks from tasks/backlog/, have the implementer agent build each test-first (splitting too-big tasks into subtasks), have the independent tester agent verify every acceptance criterion, ratify on PASS (done/, changelog, commit), retry on FAIL, and run milestone acceptance when a milestone's tasks are all done. Use when the user says "build", "implement", "go", "work on the backlog", "continue".
argument-hint: "[task id or milestone id to limit the run — optional]"
---

# Build — the conductor

You are the conductor. You run the loop below **without asking the user anything** until there is nothing
left you can do. You don't write app code yourself — the `implementer` does; you don't judge it — the
`tester` does. You move task files, write reports into them, and commit.

Optional scope: `$ARGUMENTS` (a task id → only that task and the tasks it depends on; a milestone id → only
that milestone's tasks). Empty → everything.

## Preflight

1. `purpose.md` must not contain `<!-- TEMPLATE` — otherwise stop and say so.
2. Git repo exists; if the working tree has uncommitted changes outside `tasks/`, stop and show them (they
   would be mixed into the next task's diff).
3. If `node_modules/` is missing: `npm install` and `npx playwright install chromium`.
4. `npm test` must be green. If it's red, stop: report the failures; don't build on a broken base.
5. Recovery: tasks left in `tasks/doing/` or `tasks/review/` from an interrupted run (without `split_into`)
   → discard their partial changes with `git checkout -- app tests` and `git clean -fd app tests`, then
   `git mv` the task back to backlog. Tell the user you did this.

## The loop

Repeat:

### A. Pick
Read the frontmatter of all task files. A task is **ready** when it is in `tasks/backlog/` and every id in
`depends_on` is in `tasks/done/`. A parent in `tasks/doing/` whose `split_into` subtasks are all in `done/`
is **ready for re-verification** → go straight to step D with it.

Take the ready task with the lowest id (subtasks sort right after their parent: 007.1 < 007.2 < 008).
Tasks run **one at a time** in the working tree, so each tester sees exactly one task's diff.
If nothing is ready → go to **E. Milestones**, then **F. Finish**.

### B. Implement
`git mv` the task to `tasks/doing/`. Dispatch the `implementer` agent (Agent tool,
`subagent_type: implementer`) with: the task file path, the round number (`attempts + 1`) and — on a retry —
the full previous FAIL verdict. Wait for its `RESULT` block.

- **DONE** → `git mv` to `tasks/review/`, go to C.
- **SPLIT** → create one file per subtask in `tasks/backlog/` (`<id>.<n>-<slug>.md`, `parent: <id>`,
  `milestone` copied from parent, `depends_on` from the result plus the parent's own `depends_on`). Set the
  parent's `split_into: [...]` and leave it in `doing/`. Update the milestone's `## Tasks` checklist
  (indent subtasks under the parent). Commit `split: task <id> into …`. Continue the loop — the subtasks
  are now ready, each gets its own fresh implementer.
- **NEEDS_INPUT** → append `## Open questions` (the questions) to the task file, `git checkout -- app tests`
  + `git clean -fd app tests` to discard partial changes, `git mv` to `tasks/blocked/`, commit
  `blocked: task <id> needs input`. Continue with other tasks.

### C/D. Test
Dispatch the `tester` agent (`subagent_type: tester`) in task mode with the task file path. It must be a
**fresh** dispatch every time — never reuse the implementer's context. Wait for its `VERDICT` block and
append it to the task file under `## Test report` as `### Round <n> — <date> — PASS|FAIL`.

- **PASS** → ratify:
  1. `git mv` to `tasks/done/`; append `## Ratification` with date and "all N criteria PASS".
  2. Prepend `- <date> — task <id>: <title>` under the header of `CHANGELOG.md`.
  3. Tick the task in its milestone's `## Tasks` checklist.
  4. `git add -A && git commit -m "task <id>: <title>"` (body: the criteria table; add the session's
     attribution trailer). If this was the last subtask of a parent, the parent becomes ready for
     re-verification in step A.
- **FAIL** → increment `attempts`.
  - `attempts <= 2` → `git mv` back to `doing/`, go to B with the findings (round `attempts + 1`).
  - `attempts > 2` → discard the changes (`git checkout -- app tests`, `git clean -fd app tests`), `git mv`
    to `tasks/blocked/`, commit `blocked: task <id> failed 3 test rounds` (task file keeps all reports).
    Continue with other tasks; tasks depending on it simply won't become ready.

For a parent re-verification (all subtasks done): PASS → ratify the parent as above (the diff is empty,
that's expected; the tester judges the page). FAIL → treat its findings as a new subtask
`<id>.<next>` "Close gaps of <id>" with the findings as criteria, put it in backlog, keep the parent in
`doing/`. Count these against the parent's `attempts`; after 2, block the parent.

### E. Milestones
For each milestone with `status: in-progress` whose tasks (incl. subtasks) are **all** in `done/`:
dispatch the `tester` in milestone mode with the milestone file. Write its verdict under
`## Acceptance report` (`### Run <n> — <date> — PASS|FAIL`).
- PASS → `status: accepted-by-tester`, commit `milestone <id>: accepted by tester`.
- FAIL → if fewer than 2 acceptance runs so far: dispatch the `planner` in **follow-up** mode with the
  milestone and the report, commit the new tasks (`plan: follow-up for <id>`), go back to A.
  Otherwise leave it `in-progress` and report it under "needs you".

### F. Finish
Stop when nothing is ready and no milestone can progress. Report to the user:
- ratified this run (id, title), and how many tester rounds each took;
- blocked tasks with the one-line reason and the hint `/unblock <id> <answer>`;
- milestones now `accepted-by-tester`: "Open `app/index.html` and try it — then tell me to close the
  milestone or describe what's missing (→ `/add-task`)."
- `npm test` summary of the final state.

## Rules
- Never edit app or test code yourself, never weaken a tester verdict, never mark PASS without a tester PASS.
- Never push, never rewrite history.
- When the user later says a milestone is good, set its `status: closed` and commit.
