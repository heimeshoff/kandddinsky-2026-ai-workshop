# Wait

When nothing is ready, say so in one line ("waiting for tasks — 2 blocked,
1 waiting on 004") and run this with `run_in_background: true`:

```
bash .claude/skills/work/wait-for-tasks.sh
```

It exits when a file in `tasks/todo/` is created or edited (exit 0), or after
~55 minutes of quiet (exit 2). You are woken up when it exits: on 0 go to
**Pick**; on 2 start it again. Don't poll by hand and don't end the session
— the loop runs until the user stops it.
