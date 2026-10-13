# 4. Verify

Don't take the subagent's word for it. Work **inside the task's worktree**.

1. Commit the agent's work on its branch:
   `git -C <worktree> add -A && git -C <worktree> commit -m "task NNN: wip"`.
2. Bring in what other tasks merged meanwhile:
   `git -C <worktree> merge master`. Resolve any conflicts here, in the
   worktree — keep both tasks' behavior — and commit the merge.
3. Run the full test suite in the worktree and check each acceptance
   criterion is covered by a test (`git -C <worktree> diff master...`).

- All green and covered → **Finish** (done).
- Otherwise append the findings to `tasks/doing/NNN-slug.log.md`:

  ```markdown
  ### Verify n
  - Red: <failing test and why>
  - Missing: <criterion without a test>
  - Conflict: <files you could not merge cleanly, and why>
  ```

  `n` = number of existing `### Verify` headings + 1. Then go back to
  **Implement** with a fresh agent in the same worktree — the log carries
  the context.
- If you just wrote `### Verify 2` → don't retry; treat as blocked.

You keep no state between rounds; the log is the memory.
