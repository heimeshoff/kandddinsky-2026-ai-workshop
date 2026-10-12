---
name: status
description: Show the budget app's delivery board — milestones with their status and which tasks are in backlog, doing, review, done and blocked, plus what needs the human. Use when the user asks "where are we", "status", "what's left", "what's blocked".
---

# Board status

Read `milestones/*.md` and the frontmatter of every file in `tasks/*/`. Don't change anything.

Print, compactly:

1. **Milestones** — id, title, status, `done/total` tasks.
2. **Board** — one line per folder: `backlog (3): 008 …, 009 …` etc. For backlog, mark tasks that are
   *ready* (all `depends_on` in done/) with ▶. For parents with `split_into`, show the subtasks' progress.
3. **Needs you** — every task in `tasks/blocked/` with its reason (last test report findings or open
   questions, one line each) and the hint: "answer with `/unblock <id> <answer>`". Also milestones in
   `accepted-by-tester` waiting for the human to try the app and close them.
4. **Next step** — usually `/build` if anything is ready, or `/plan-milestone` if the backlog is empty.

Also show the last 3 lines of CHANGELOG.md.
