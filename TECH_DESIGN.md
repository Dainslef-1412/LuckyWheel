# TECH_DESIGN.md

This file is the technical source of truth for `luckyWheel`.

## Architecture

`luckyWheel` is a static single-page web app built with Vite and browser-native JavaScript. It has no backend, no external runtime service, and no required CDN.

```text
index.html
└── src/main.js
    ├── src/wheel.js
    ├── src/spin.js
    ├── src/themes.js
    ├── src/preset-manager.js
    ├── src/presets.js
    ├── src/url-handler.js
    └── src/utils.js
```

## Runtime Modules

| Module | Responsibility |
| --- | --- |
| `src/main.js` | UI state, DOM wiring, editor interactions, preset actions, share modal. |
| `src/wheel.js` | SVG sector geometry, labels, center circle, pointer, wheel rendering. |
| `src/spin.js` | Weighted winner selection, target rotation, spin animation, result display. |
| `src/themes.js` | Theme definitions, color assignment, CSS variable application. |
| `src/preset-manager.js` | Built-in/user preset persistence through `localStorage`. |
| `src/presets.js` | Built-in wheel presets. |
| `src/url-handler.js` | Encode/decode shareable URL configuration. |
| `src/utils.js` | Shared math, ids, debounce, text, and random helpers. |

## Key Decisions

- Use Vanilla JavaScript to keep the app small and deployable as static assets.
- Use SVG for precise wheel sectors and labels.
- Use CSS transitions for spin deceleration.
- Use `localStorage` for user presets.
- Use URL-encoded config for sharing.
- Keep Vite as the only build dependency.

## Build And Deployment

Standard commands:

```bash
npm run dev
npm run build
npm run preview
```

Build output goes to `dist/`. Deployment guidance lives in [docs/tech/deployment.md](./docs/tech/deployment.md). Generated deploy packages belong under `outputs/` and should not be treated as source.

## Constraints

- Preserve static-site deployability.
- Avoid framework migrations unless the product scope changes materially.
- Keep shared URL decoding compatible with existing links.
- Keep all browser-facing data validation client-side and deterministic.
