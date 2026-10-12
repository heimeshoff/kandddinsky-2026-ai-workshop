---
name: add-task
description: Add a single small change, bug or feature for the budget app straight to tasks/backlog/ as a well-formed task with testable acceptance criteria, without creating a milestone. Use when the user describes one concrete change ("the total should be bold", "deleting a category doesn't work", "add a task for …").
argument-hint: <description of the change>
---

# Add a single task

Input: `$ARGUMENTS` — a description of one change.

1. **Preflight** as in `plan-milestone`: purpose.md must not be the template; the folder must be a git repo.
2. Dispatch the `planner` agent in **single** mode with the description. Mention the related existing task
   ids if the user referred to existing behaviour.
   - `NEEDS_INPUT` → ask the user, then re-dispatch with the answers.
   - If the planner judges it to be several behaviours it may create a few tasks — that's fine.
3. Check the task file(s) format (frontmatter, Given/When/Then criteria, valid `depends_on`).
4. Commit: `git add tasks && git commit -m "plan: task NNN <title>"` (with the session's attribution trailer).
5. Report the task id, title and criteria, and suggest `/build`.
