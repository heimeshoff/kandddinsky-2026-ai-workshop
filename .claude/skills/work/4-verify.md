# 4. Verify (subagent)

Don't take the implementer's word for it — and don't check it yourself.
Spawn one fresh `verifier` agent for the task, with
`run_in_background: true`. The prompt is two absolute paths, nothing else:

```
<main>/tasks/doing/NNN-slug.md
<worktree>
```

The agent's rules live in `.claude/agents/verifier.md`. It commits the
work, merges `master` into the branch, runs the tests and checks criteria
coverage — all in the worktree. Findings go to the log, not to you. It
returns one line (plus `Tried:` on `FAIL 2`):

- `PASS` → **Finish** (done).
- `FAIL 1: ...` → back to **Implement** with a fresh agent in the same
  worktree — the log carries the context.
- `FAIL 2: ...` → don't retry; **Finish** (blocked) with the summary as
  the question and its `Tried:` line for the Notes.

You keep no state between rounds; the log is the memory.
