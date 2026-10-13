# 1. Pick

There is no limit — every ready task runs at once, each in its own worktree.

- Tasks already in `tasks/doing/` that no running agent owns (a previous
  run was interrupted) → resume those first. Ignore `*.log.md`. If the
  worktree exists, reuse it; if a log exists, go straight to **Implement**
  — the log carries the context.
- Otherwise list `tasks/todo/` and `tasks/done/`. Ready = no `blocked:`
  field and every `depends_on` is in `done/`. Take the lowest-numbered
  ready tasks — all of them that aren't running yet.
- A task whose dependency is still in `doing/` is **not** ready — it
  waits until that one is merged.
- Nothing ready and no agent running → go to **Wait** (`wait.md`).
- Nothing ready but agents running → just wait for them; you are woken
  when one returns.
