# TECH_DESIGN.md

This file is the technical source of truth for `luckyWheel`.

## Architecture

`luckyWheel` is a static single-page web app built with Vite and browser-native JavaScript. It has no backend, no external runtime service, and no required CDN.

```text
index.html
└── src/main.js
    ├── src/wheel.js
    ├── src/themes.js
    ├── src/preset-manager.js
    ├── src/presets.js
    ├── src/url-handler.js
    └── src/utils.js
```

## Runtime Modules

| Module | Responsibility |
| --- | --- |
| `src/main.js` | UI state, DOM wiring, editor interactions, preset actions, share modal, spin sequencing. |
| `src/wheel.js` | SVG sector geometry, spin target rotation, labels, center circle and its text, pointer, wheel rendering. |
| `src/themes.js` | Theme definitions and per-item color assignment. |
| `src/preset-manager.js` | Built-in/user preset persistence through `localStorage`. |
| `src/presets.js` | Built-in wheel presets. |
| `src/url-handler.js` | Encode/decode shareable URL configuration. |
| `src/utils.js` | Shared math, angle normalization, ids, debounce, text, and random helpers. |

## Key Decisions

- Use Vanilla JavaScript to keep the app small and deployable as static assets.
- Use SVG for precise wheel sectors and labels.
- Use CSS transitions for spin deceleration.
- Keep spin sequencing in `src/main.js`; it owns `state.currentRotation`. The rotation
  math itself lives in `calculateSpinRotation` so it stays pure and unit-testable. A
  separate spin module previously duplicated this logic against its own state and was removed.
- Address the center circle text through its `center-text` id. Sector labels share the
  same `dominant-baseline` attribute, so attribute selectors match a sector first.
- Use `localStorage` for user presets.
- Use URL-encoded config for sharing.
- Keep Vite as the only build dependency.

## Build And Deployment

Standard commands:

```bash
npm run dev
npm test
npm run build
npm run preview
```

Unit tests use the Node built-in test runner (`node --test`), which keeps Vite the only
dependency. Build output goes to `dist/`. Deployment guidance lives in [docs/tech/deployment.md](./docs/tech/deployment.md). Generated deploy packages belong under `outputs/` and should not be treated as source.

## Constraints

- Preserve static-site deployability.
- Avoid framework migrations unless the product scope changes materially.
- Keep shared URL decoding compatible with existing links.
- Keep all browser-facing data validation client-side and deterministic.
