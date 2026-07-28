# TEST_PLAN.md

This file is the verification source of truth for `luckyWheel`.

## Current Automated Checks

Unit tests run on the Node built-in test runner, so they add no dependency beyond Vite:

```bash
npm install
npm test         # unit tests
npm run build    # production build gate
```

Tests live in `tests/` as `*.test.js` and cover the pure logic: weighted random
selection, sector angles, spin target rotation, center text sizing, and share URL
encode/decode. Rendering and DOM wiring are not covered and stay in the manual
checklist below.

Use local preview for manual acceptance:

```bash
npm run preview
```

Use the dev server while implementing:

```bash
npm run dev
```

## Manual Acceptance Checklist

- App opens on desktop and mobile viewport sizes.
- Default wheel renders with three options.
- Editing title, option label, option weight, and theme updates the preview.
- Adding and deleting options preserves a valid spin state.
- Spin requires at least two options and displays the winning label.
- Spinning several times in a row without reloading: the pointer stops on the same sector
  the result text names, every time. Checking only the first spin hides this regression.
- The center circle shows the wheel title at rest and the winning label after a spin, and
  sector labels are unchanged by spinning.
- Long center labels shrink to stay inside the center circle.
- A shared URL whose option label contains HTML (for example `<img src=x onerror=alert(1)>`)
  renders as literal text in the result line, with no script execution.
- Weighted options visibly affect sector size and winner probability over repeated spins.
- Saving, duplicating, renaming, deleting, and selecting presets works through `localStorage`.
- Share link copies a URL and reloads the same wheel configuration.
- Production build can be previewed locally.

## Recommended Future Tests

- DOM tests for option editing, preset operations, share modal behavior, and the
  center circle text, which currently need a DOM implementation the project does not depend on.
- Unit tests for preset persistence, which needs a `localStorage` stand-in.
- Visual/manual regression snapshots for major themes and mobile layout.

## Handoff Rule

If verification commands, supported browsers, data shape, or acceptance behavior changes, update this file in the same change.
