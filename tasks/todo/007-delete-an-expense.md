---
id: 007
title: Delete an expense
depends_on: [005]
---

## Goal
I can remove an expense I entered by mistake.

## Acceptance criteria
- Given October expenses 54.20 € and 800.00 €, when I delete the 54.20 € expense, then it is no longer listed and spent shows 800.00 €.
- Given two identical expenses (same amount, category, date, note), when I delete one, then exactly one remains.
- Given I deleted an expense, when I reload, then it is still gone.

## Domain notes
- Deleting is immediate; no undo.
- Out of scope: editing an expense, undo, confirmation dialog.

## Notes
