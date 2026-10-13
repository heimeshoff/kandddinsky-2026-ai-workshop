# 2. Claim

For each picked task, **before** doing anything else:

1. Move `tasks/todo/NNN-slug.md → tasks/doing/NNN-slug.md` (plain `mv`).
   If the move fails, the file changed under you — go back to Pick.
2. Create its worktree on a fresh branch from `master`, outside the repo:

   ```
   git worktree add -q -b task/NNN-slug ../<repo>.worktrees/NNN-slug master
   ```

   `<repo>` = name of this repo's folder. Each task gets its own folder
   and branch, so parallel tasks never edit each other's files.
3. If the main checkout has `node_modules/`, link it into the worktree
   instead of installing (a junction — no admin rights needed):

   ```
   cmd //c mklink /J "<worktree>
ode_modules" "<main>
ode_modules"
   ```

   All worktrees share the main checkout's packages.

Task files and logs stay in the **main** checkout (`tasks/doing/`).
Worktrees hold only code and tests.
