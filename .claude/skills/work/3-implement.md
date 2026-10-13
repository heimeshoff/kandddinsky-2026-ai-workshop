# 3. Implement (subagent)

Spawn one fresh `implementer` agent per claimed task, all in a single
message with `run_in_background: true`, so they run in parallel. The
prompt is two absolute paths, nothing else:

```
<main>/tasks/doing/NNN-slug.md
<worktree>
```

The agent's rules live in `.claude/agents/implementer.md`. It returns one
line: `DONE` or `BLOCKED: <question>` (plus a `Tried:` line). Its decisions go to the log
`tasks/doing/NNN-slug.log.md` in the main checkout, not to you.

Handle each agent as it returns — don't wait for the others:

- `DONE` → **Verify** that task (spawn its verifier).
- `BLOCKED: ...` + `Tried: ...` → **Finish** (blocked) that task.

After each finished task → **Pick** again (finished tasks may unblock
dependents).
