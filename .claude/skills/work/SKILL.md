---
name: work
description: Implement tasks from tasks/todo/ in an endless loop — claim the next ready task, build and test it, move it to done, commit, repeat; when nothing is ready, wait for the modeling session to add more. Use when the user says "work", "start working", "build it", "implement the tasks", "let's go". Safe to run while another session is modeling.
---

# Working session

You implement the tasks the modeling session writes, one after another, and
keep going until the user stops you. New tasks may land in `tasks/todo/` at
any moment — that is expected.

Read `tasks/README.md` first. It is the contract with the modeling session;
follow its ownership, naming and git rules exactly.

You are the **conductor**: you pick, claim, merge, move and commit.
Implementation and verification of each task happen in fresh subagents,
so this session's context stays small no matter how many tasks go by.

All ready tasks run in parallel. Each gets its own git worktree and
branch (`task/NNN-slug`), so agents never edit each other's files. You
merge each branch into `master` when its task is done; merge conflicts are
resolved then, in the worktree.

## The loop

Each phase lives in its own file in this folder. Read it when you enter
that phase.

1. **Pick** — `1-pick.md`
2. **Claim** — `2-claim.md`
3. **Implement** (subagent) — `3-implement.md`
4. **Verify** (subagent) — `4-verify.md`
5. **Finish** — `5-finish.md`
6. **Repeat** — whenever a task finishes, go back to **Pick**. Re-read `tasks/README.md` and the
   glossary only if they changed since you last read them.

**Wait** — `wait.md` — when Pick finds nothing ready.

## Backlog capture

When something comes up that is out of scope for the current task — in a
subagent's log (`- Backlog:` lines), in verify findings, or in conversation
with the user ("we should also...", "later we need...") — write a backlog
item to `tasks/backlog/<slug>.md` (format and naming in `tasks/README.md`)
and commit just that file:

```
git add tasks/backlog/<slug>.md
git commit -m "backlog: <slug>" -- tasks/backlog/<slug>.md
```

Set `source:` to `task NNN` or `working conversation`. Tell the user in one
line (`+ backlog: <title>`). Never edit or delete existing backlog items,
and never implement them — the user promotes them in the modeling session.

## Don'ts

- Never create tasks, and never edit a task's Goal, Acceptance criteria or
  Domain notes — those belong to modeling. If you discover missing work,
  capture it as a backlog item (see above).
- Never touch `model/`.
- Never let an agent write code in the main checkout — only in its worktree.
- Never merge a branch into `master` with a red test suite.
- Never move a task to `done/` with a red test suite.
