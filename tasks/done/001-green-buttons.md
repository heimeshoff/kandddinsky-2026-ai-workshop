---
id: "001"
title: All buttons are green
milestone: none
depends_on: []
parent: null
split_into: []
attempts: 0
---
## Goal
Every button in the app, present and future, is shown with the same green background and readable text.
The rule comes from one shared style in `app/styles.css`, so new buttons are green without any per-button styling.

## Acceptance criteria
- AC1: Given the app is opened from `app/index.html`, When a `<button>` with the text "Save" is added to the page (no class, no inline style), Then its computed `background-color` is exactly `rgb(46, 125, 50)` (`#2e7d32`) and its computed text `color` is `rgb(255, 255, 255)`.
- AC2: Given the app is opened, When an `<input type="submit">`, an `<input type="button">` and an `<input type="reset">` are added to the page, Then each has computed `background-color` `rgb(46, 125, 50)` and text `color` `rgb(255, 255, 255)`.
- AC3: Given the app is opened with the colour scheme emulated as `dark` (`page.emulateMedia({ colorScheme: 'dark' })`), When a `<button>` is added to the page, Then its computed `background-color` is still `rgb(46, 125, 50)` and its text `color` is `rgb(255, 255, 255)`.
- AC4: Given the app is opened, When a `<button>` is added inside `<main>` and another directly inside `<body>`, Then both have the same computed `background-color` `rgb(46, 125, 50)`, and the contrast ratio between text colour and background colour (WCAG formula) is at least 4.5 : 1 (white on `#2e7d32` is about 5.1 : 1).
- AC5: Given the app is opened, Then no console errors occur, and `app/styles.css` contains one shared selector covering `button, input[type="button"], input[type="submit"], input[type="reset"]` that sets the green background (no `style="…"` attributes and no per-button ids/classes are used to achieve it).

## Notes
- The app has no buttons yet (walking skeleton only). Acceptance tests (and tester probes) verify the rule by
  injecting elements with `page.evaluate(() => { const b = document.createElement('button'); b.textContent = 'Save'; document.querySelector('main').appendChild(b); })`
  and reading `getComputedStyle(b).backgroundColor` / `.color`. Give injected elements a `data-testid` inside the test so they can be located.
- Implement as a shared rule in `app/styles.css`, e.g. a `--button-bg: #2e7d32; --button-ink: #fff;` pair of custom
  properties on `:root` used by the button selector. Do not override the custom properties in the dark-mode block.
- Set `border` so the browser's default grey button border does not dominate (e.g. `border: 1px solid #2e7d32` or `border: none`); not separately tested.
- No domain logic involved: no change to `app/domain.js`, no unit test needed beyond keeping `npm test` green.
- Assumption: "green" means the single concrete colour `#2e7d32` with white text (chosen for ≥ 4.5 : 1 contrast). The user can request a different shade later.
- Assumption: hover/focus/disabled states may vary slightly (e.g. a darker green on hover, reduced opacity when disabled) but are out of scope for this task's criteria; the resting state must be exactly as above.
- Out of scope: links styled as buttons (`<a>`), which are not buttons.

## Implementation log
### Round 1 — 2026-10-12
- `app/styles.css`: added `--button-bg: #2e7d32`, `--button-bg-hover: #1b5e20`, `--button-ink: #fff` on `:root`
  (not overridden in the dark-mode block) and one shared rule
  `button, input[type="button"], input[type="submit"], input[type="reset"]` setting background, white text,
  matching 1px green border, radius, padding, inherited font. Added hover (darker green), focus-visible outline
  and disabled (reduced opacity) states — outside the ACs, resting state is exactly as specified.
- No domain/UI JS changes; no unit tests needed.
- `tests/acceptance/001-green-buttons.spec.js`: injects elements with `data-testid` and reads computed styles.
  AC5 parses `styles.css` (comments stripped) for exactly one rule containing all four selectors that sets the
  background, and checks `index.html` has no `style=` attributes.
- AC1 → "AC1: a plain "Save" button is green with white text"
- AC2 → "AC2: submit, button and reset inputs are green with white text"
- AC3 → "AC3: buttons stay green with white text in dark colour scheme"
- AC4 → "AC4: buttons in main and body are the same green with at least 4.5:1 contrast"
- AC5 → "AC5: no console errors and one shared button selector in styles.css sets the green"
## Test report
### Round 1 — 2026-10-12 — PASS

VERDICT: PASS
NPM_TEST: unit 3/3 pass; acceptance 6 passed (000-skeleton AC1, 001 AC1–AC5)
CRITERIA:
| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 | PASS | probe: added <button>Save</button> (no class/style) to main → bg rgb(46, 125, 50), color rgb(255, 255, 255); test "AC1" asserts exact values |
| AC2 | PASS | probe: input submit/button/reset (plus type="SUBMIT") → bg rgb(46, 125, 50), color white; test "AC2" loops over all 3 types |
| AC3 | PASS | probe with emulateMedia dark (body bg rgb(22, 22, 20)) → every button kind still rgb(46, 125, 50)/white; dark block overrides only --bg/--ink |
| AC4 | PASS | probe: button in main and directly in body both rgb(46, 125, 50); WCAG contrast 5.13:1; test "AC4" asserts contrast >= 4.5 |
| AC5 | PASS | probe: zero console/page errors, 0 [style] elements; styles.css has one rule `button, input[type="button"], input[type="submit"], input[type="reset"]` setting background-color: var(--button-bg) (#2e7d32 on :root); no ids/classes |
OBSERVATIONS:
1. Hover (#1b5e20), focus-visible outline and disabled (opacity 0.55) states added; allowed by notes; resting state exact and restored after hover/click.
2. Rule also covers <button type="reset"> and buttons in <form>/<h1>, consistent with "every button".
3. AC5 test checks "no per-button ids/classes" only via index.html style=; probe found none. Minor test gap, not a violation.

## Ratification
2026-10-12 — ratified by /build: all 5 criteria PASS (tester round 1).
