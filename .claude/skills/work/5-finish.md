# 5. Finish

Finish one task at a time, even if several agents returned together.

**Before either:** for every `- Backlog:` line in the task's log, write a
backlog item (see *Backlog capture* in `SKILL.md`) — unless an item with
that content already exists.

**Done:** the branch already contains `master` (Verify step 2), so the
merge is clean. In the main checkout:

1. Move the task and its log `doing/ → done/`
   (`NNN-slug.md` and `NNN-slug.log.md`).
2. Squash the branch in and commit only the task's paths:

   ```
   git merge --squash task/NNN-slug
   git add -A -- tasks/done/NNN-slug.md tasks/done/NNN-slug.log.md tasks/todo/NNN-slug.md
   git commit -m "task NNN: <title>" -- tasks/todo/NNN-slug.md      $(git diff --cached --name-only -- . ':(exclude)model' ':(exclude)tasks/todo' ':(exclude)tasks/backlog')
   ```

   (The `add` of `todo/` records the file leaving it.) If the squash
   conflicts (another task merged after Verify), undo with
   `git reset --merge` and go back to **Verify** step 2.
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
`blocked: <the question>` to the task's frontmatter and append one short
paragraph of what was tried to `## Notes`, condensed from the log. Delete
the log — it describes discarded code. Move the task back `doing/ → todo/`
and commit just that file. Tell the user the question in one line — they
will answer it in the modeling session, which removes the `blocked:` field.
Then continue the loop; other tasks may still be ready.

Report each finished task to the user in one line: `✓ NNN <title>` or
`⚠ NNN blocked: <question>`.
