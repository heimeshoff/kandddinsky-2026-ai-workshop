# 5. Finish

Finish one task at a time, even if several agents returned together.

**Before either:** don't read the log. Grep it:
`grep '^- Backlog:' tasks/doing/NNN-slug.log.md`. For each hit, write a
backlog item (see *Backlog capture* in `SKILL.md`) — unless
`ls tasks/backlog/` shows an item with that slug already.

**Done:** the verifier already merged `master` into the branch, so the
merge is clean. In the main checkout:

1. Move the task and its log `doing/ → done/`
   (`NNN-slug.md` and `NNN-slug.log.md`).
2. Squash the branch in and commit only the task's paths:

   ```
   git merge --squash -q task/NNN-slug
   git add -A -- tasks/done/NNN-slug.md tasks/done/NNN-slug.log.md tasks/todo/NNN-slug.md
   git commit -q -m "task NNN: <title>" -- tasks/todo/NNN-slug.md      $(git diff --cached --name-only -- . ':(exclude)model' ':(exclude)tasks/todo' ':(exclude)tasks/backlog')
   ```

   (The `add` of `todo/` records the file leaving it.) If the squash
   conflicts (another task merged after Verify), undo with
   `git reset --merge` and go back to **Verify** (fresh verifier).
3. Remove the worktree and branch. Unlink `node_modules` first —
   with `rmdir`, which removes only the link, never the shared packages
   (no `rm -rf`, no `Remove-Item`):

   ```
   cmd //c rmdir "<worktree>
ode_modules"
   git worktree remove ../<repo>.worktrees/NNN-slug
   git branch -D task/NNN-slug
   ```

If git reports `index.lock`, the modeling session is committing — wait a
moment and retry.

**Blocked:** throw the code away — unlink `node_modules`, then
`git worktree remove --force` and `git branch -D` as above. Nothing to revert in the main checkout. Add
`blocked: <the question>` to the task's frontmatter and append the
agent's `Tried:` line to `## Notes` — don't read the log. Delete the log —
it describes discarded code. Move the task back `doing/ → todo/`
and commit just that file (`git commit -q`). Tell the user the question in one line — they
will answer it in the modeling session, which removes the `blocked:` field.
Then continue the loop; other tasks may still be ready.

Report each finished task to the user in one line: `✓ NNN <title>` or
`⚠ NNN blocked: <question>`.
