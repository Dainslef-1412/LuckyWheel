# TEST_PLAN.md

This file is the verification source of truth for `luckyWheel`.

## Current Automated Checks

The project currently has no unit-test framework configured. The available automated gate is the Vite production build:

```bash
npm run build
```

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
- Weighted options visibly affect sector size and winner probability over repeated spins.
- Saving, duplicating, renaming, deleting, and selecting presets works through `localStorage`.
- Share link copies a URL and reloads the same wheel configuration.
- Production build can be previewed locally.

## Recommended Future Tests

- Unit tests for weighted random, sector angle calculation, URL encode/decode, and config normalization.
- DOM tests for option editing, preset operations, and share modal behavior.
- Visual/manual regression snapshots for major themes and mobile layout.

## Handoff Rule

If verification commands, supported browsers, data shape, or acceptance behavior changes, update this file in the same change.
