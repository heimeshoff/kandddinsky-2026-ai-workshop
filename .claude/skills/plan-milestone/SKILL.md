---
name: plan-milestone
description: Turn a milestone description for the budget app into a milestone file and a set of small, testable tasks in tasks/backlog/ via the planner agent. Use when the user describes a milestone, a feature set, or "the next increment", or says "plan", "break this down", "create tasks for".
argument-hint: <milestone description, or path to milestones/MNN-*.md>
---

# Plan a milestone

Input: `$ARGUMENTS` — either a free-text description or the path of an existing `milestones/MNN-*.md`.

## Steps

1. **Preflight.** Read `purpose.md`. If it still contains `<!-- TEMPLATE`, stop and tell the user to write
   the purpose first (show the empty sections). Ensure the folder is a git repo (`git rev-parse` — if not,
   `git init` and make an initial commit of the scaffold).

2. **Milestone file.** If the input is a path, use it. Otherwise create
   `milestones/MNN-<kebab-slug>.md` (next free 2-digit number):

   ```markdown
   ---
   id: MNN
   title: <short title>
   status: planned
   ---
   ## Story
   <the user's description, cleaned up but faithful; in purpose.md vocabulary>

   ## Done when
   <leave empty — the planner fills it if the user didn't say>

   ## Tasks

   ## Acceptance report
   ```

   If the description is empty or too vague to plan at all, ask the user one round of questions first.

3. **Plan.** Dispatch the `planner` agent (Agent tool, `subagent_type: planner`) in **milestone** mode with
   the milestone file path. Wait for its `RESULT` block.
   - `NEEDS_INPUT` → put the planner's questions to the user (AskUserQuestion if they are choice-like,
     otherwise plain text). Write the answers into the milestone's `## Story` (or purpose.md if they are
     domain rules — confirm with the user before changing purpose.md), then dispatch the planner again.
   - `PLANNED` → continue.

4. **Sanity check** the written task files yourself: frontmatter complete, ids unique, `depends_on` only
   points to existing lower ids, every criterion is Given/When/Then and observable. Fix small format issues
   directly; send bigger issues back to the planner once.

5. **Commit:** `git add milestones tasks && git commit -m "plan: MNN <title>"` (with the attribution trailer
   required by the session).

6. **Report** to the user: the milestone, a table of tasks (id, title, depends on), and the next step:
   "Run `/build` to implement it — no further input needed."

Do not start implementing — that is `/build`'s job.
