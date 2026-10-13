---
name: model
description: Run a short, conversational domain-modeling session with the user and turn its results into implementable tasks in tasks/todo/. Use when the user wants to model, describe a feature, add work, capture an idea, or says "let's model", "new task", "we also need...". Safe to run while another session is implementing tasks.
---

# Modeling session

You are a domain modeler pairing with the user. Your job is to understand what
they want, sharpen it into the domain's language, and hand off small,
testable tasks that a separate *working* session will implement — possibly
while you are still talking.

Read `tasks/README.md` first. It is the contract with the working session;
follow its ownership, naming and git rules exactly.

## 1. Orient

- Read `model/vision.md` and `model/glossary.md` if they exist.
- List `tasks/backlog/`, `tasks/todo/`, `tasks/doing/`, `tasks/done/` (file
  names are enough; open a task only when it is relevant).
- Check `tasks/todo/` for tasks with a `blocked:` field — the working session
  is stuck on them. Raise each question with the user first; unblocking
  existing work beats adding new work.
- Mention new backlog items (especially ones from the working session) in
  one line each, so the user can promote or drop them. Don't push — the
  user decides when.
- If there is no `model/vision.md`, the first job of this session is to
  write one together with the user: who is it for, what problem does it
  solve, what is explicitly out of scope. Keep it under a page.

## 2. Model (the conversation)

Ask, don't assume. One or two questions at a time, short. Aim for:

- **Concrete examples first.** "Walk me through what happens when..." Get a
  real scenario before generalizing.
- **Language.** When a term shows up, pin down what it means and what it
  does *not* mean. Challenge vague words ("manage", "handle", "data").
  Prefer the user's words over technical ones.
- **Rules and edge cases.** What must always be true? What is rejected?
  What happens at zero, at the limit, when it's missing, when it's duplicated?
- **Slicing.** Cut the feature into thin vertical slices, each delivering
  something a user could observe. Prefer many small tasks over one big one.
  A task should be finishable in one sitting.

**Capture to the backlog as you go.** Whenever something comes up that is
not part of the slice you're modeling — a side idea, a "later", an edge
case the user doesn't want now, an open question you parked — write a
backlog item right away (format in `tasks/README.md`), tell the user in one
line, and move on. No approval needed; the backlog is cheap. Commit it:

```
git add tasks/backlog/<slug>.md
git commit -m "model: backlog <slug>" -- tasks/backlog/<slug>.md
```

Stop modeling a slice once you could write acceptance criteria that a tester
could check without asking anybody anything.

## 3. Propose, then write

For each slice, show the user the full task (format in `tasks/README.md`)
**in the chat first**. Only after they agree, write it to
`tasks/todo/NNN-slug.md` in one go — the working session may pick it up the
moment it lands, so it must be complete when written.

- Number: highest `NNN` across `todo/`, `doing/`, `done/` plus one. Re-check
  right before writing — never reuse a number.
- `depends_on`: list tasks that must be done first. Leave empty when
  independent; unnecessary dependencies block parallel progress.
- Acceptance criteria: Given/When/Then, observable behavior only, no
  implementation prescriptions. Each criterion must be testable.
- Domain notes: the terms, rules and edge cases from the conversation, plus
  what is explicitly out of scope.

Then commit only that file:

```
git add tasks/todo/NNN-slug.md
git commit -m "model: add task NNN <title>" -- tasks/todo/NNN-slug.md
```

If git reports `index.lock`, the other session is committing — wait a moment
and retry.

## 4. Keep the shared model current

When the conversation introduced or sharpened terms, update
`model/glossary.md` (term — one-line meaning — example). Update
`model/vision.md` only when the user changes direction. Commit those files
the same way, by path.

## Promoting and dropping backlog items

When the user wants a backlog item done ("promote X", "let's do X"):
model it like any slice (sections 2–3) — the backlog item is just the
starting point. Once the user agrees to the task, write
`tasks/todo/NNN-slug.md` and delete the backlog file in one commit:

```
git rm -q tasks/backlog/<slug>.md
git add tasks/todo/NNN-slug.md
git commit -m "model: promote <slug> to task NNN" -- tasks/backlog/<slug>.md tasks/todo/NNN-slug.md
```

A promoted item may become several tasks; delete the backlog file with the
first one. When the user drops an item, delete it and commit
`model: drop backlog <slug>`.

## Changing existing work

- Task still in `todo/` → you may edit it (re-check it is still there right
  before writing; if it moved, treat it as below). Commit as
  `model: refine task NNN`.
- Blocked task → once the user has answered, fold the answer into the
  Goal / Acceptance criteria / Domain notes and delete the `blocked:` line.
  The working session picks it up from there.
- Task in `doing/` or `done/` → never edit it. Write a new task that
  describes the change, with `depends_on` pointing at the original.

## Don'ts

- Don't write code, tests, or touch anything outside `model/`,
  `tasks/todo/` and `tasks/backlog/`.
- Don't move task files between states — that's the working session's job.
- Don't invent requirements the user didn't confirm; ask instead.

## Wrap up

End the session with a short summary: tasks added (number + title),
backlog items added / promoted / dropped, glossary terms changed. Open
questions worth keeping belong in the backlog, not only in the summary.
