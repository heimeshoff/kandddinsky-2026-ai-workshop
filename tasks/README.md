# Task board

The contract between the **modeling** session (writes tasks) and the **working**
session (implements them). Both may run at the same time, so the rules below
exist to keep them from stepping on each other.

## States are folders

| Folder     | State   | Who moves files in   | Who may edit the file |
|------------|---------|----------------------|-----------------------|
| `backlog/` | idea    | modeling, working (create) | modeling only   |
| `todo/`    | to do   | modeling (creates / promotes) | modeling only |
| `doing/`   | doing   | working (claims)     | working only          |
| `done/`    | done    | working (finishes)   | nobody (append-only history) |

Next to a task in `doing/` the working session may keep a log
`NNN-slug.log.md` — its memory between implement and verify rounds. Only
working writes it. It moves to `done/` with the task; it never goes to
`todo/`. Modeling ignores it.

Working may have several tasks in `doing/` at once; each is built in its
own git worktree outside the repo and merged into `master` when done.
Modeling never sees the worktrees.

A task's state is *where its file is*. There is no index file, no status field
to keep in sync — moving the file is the state transition.

## Backlog

`backlog/` holds things that came up but nobody has decided to do yet:
ideas, follow-ups, gaps noticed while modeling or implementing. Nothing in
`backlog/` is ever picked up by working.

- **Both sessions capture.** Whenever something comes up that is out of
  scope for the current task or conversation, write a backlog item right
  away instead of dropping it. Modeling and working may both *create* files
  here; neither needs approval for that.
- **Only modeling edits, promotes or drops.** The user decides. To promote,
  modeling refines the item into a full task (`todo/NNN-slug.md`, new
  number) and deletes the backlog file in the same commit. To drop, it
  deletes the file.
- **No numbers.** Backlog files are named `slug.md` (e.g.
  `edit-an-expense.md`), so working can create them without colliding with
  modeling's numbering. If the name exists, the item is probably a
  duplicate — read it; append `-2` only if it's really different.

Backlog item format — short, a rough capture, not a task:

```markdown
---
title: Edit an expense
source: modeling | task NNN | working conversation
---

What came up and why it might matter. One short paragraph.
Open questions, if any, as bullets.
```

## Ownership rules

- **Modeling** only ever creates new files in `todo/` and `backlog/`, and edits
  or deletes files that are still in `todo/` or `backlog/`. It never touches
  `doing/` or `done/`. If something that is
  already in progress or done needs to change, modeling writes a *new* task.
- **Working** claims a task by moving it `todo/ → doing/` *before* starting work,
  and moves it `doing/ → done/` when the acceptance criteria pass. It never
  creates tasks (only backlog items) and never edits a task's Goal or
  Acceptance criteria. It may
  append to the `## Notes` section of a task it owns.
- **Blocked handback.** If working can't finish a task as written, it moves
  it back `doing/ → todo/` with a `blocked: <question>` line in the
  frontmatter. That is the one time working writes into `todo/`. Working
  skips blocked tasks; modeling answers the question by refining the task
  and removing the `blocked:` line, which makes it ready again.
- A task file only appears in `todo/` once it is complete. Modeling never writes
  half-finished tasks to disk — a file in `todo/` is always ready to be picked up.

## File naming

Tasks: `NNN-short-slug.md` — `NNN` is a zero-padded, never-reused number. The next
number is `max(NNN across todo/, doing/, done/) + 1`. Only modeling allocates
numbers, so the working session can never collide with it.

## Picking order

The working session picks the lowest-numbered task in `todo/` that is not
`blocked:` and whose `depends_on` tasks are all in `done/`.

## Git

Each session commits **only the paths it touched**
(`git add <paths> && git commit -m "..." -- <paths>`), never `git add -A`,
so neither session sweeps the other's in-flight changes into its commit.

- Modeling: `model: add task NNN <title>` / `model: refine task NNN` /
  `model: backlog <slug>` / `model: promote <slug> to task NNN` /
  `model: drop backlog <slug>`
- Working: `task NNN: <title>` / `backlog: <slug>`

## Task file format

```markdown
---
id: 007
title: Highlight categories that are over budget
depends_on: [006]
---

## Goal
One or two sentences: what the user can do afterwards, and why it matters.

## Acceptance criteria
- Given <context>, when <action>, then <observable outcome>.
- ...

## Domain notes
Terms (as in model/glossary.md), rules, invariants, edge cases the implementer
must respect. Out-of-scope items go here too, explicitly.

## Notes
(Working session appends here: decisions, surprises, follow-ups.)
```
