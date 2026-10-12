---
name: unblock
description: Hand a blocked budget-app task back to the pipeline after the human answered its question or gave guidance on its failed tests. Use when the user says "unblock 007", answers a blocked task's question, or decides how a blocked task should proceed.
argument-hint: <task id> <answer / guidance>
---

# Unblock a task

Input: `$ARGUMENTS` — a task id followed by the human's answer or guidance.

1. Find `tasks/blocked/<id>-*.md`. If it isn't there, say where the task is and stop.
2. If no guidance was given, show the open questions / last findings from the file and ask for it.
3. Append to the task file:

   ```
   ## Human guidance — <date>
   <the answer, verbatim>
   ```

   If the answer changes what the task should do, also update `## Acceptance criteria` accordingly (show
   the user the changed criteria). Reset `attempts: 0`.
4. Move the file to `tasks/backlog/` (`git mv`) and commit `unblock: task <id>`
   (with the session's attribution trailer).
5. Tell the user it will be picked up by the next `/build`.
