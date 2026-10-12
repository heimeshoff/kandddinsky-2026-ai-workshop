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
## Test report
## Ratification
