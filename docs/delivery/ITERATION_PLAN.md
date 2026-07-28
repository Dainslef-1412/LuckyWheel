# ITERATION_PLAN.md

This file is the delivery entry for `luckyWheel`.

## Current Checkpoint

- Static Vite app is implemented with browser-native JavaScript.
- Core wheel editing, SVG rendering, weighted spin, themes, local presets, and share URLs are present.
- Deployment package artifacts are stored under `outputs/packages/`.
- The current automated verification gate is `npm run build`.

## Next Delivery Slices

1. Add focused tests for weight calculation, sector angle generation, URL encode/decode, and preset persistence.
2. Add a small manual visual regression checklist for desktop and mobile breakpoints.
3. Review share URL compatibility before changing config shape.
4. Keep deployment documentation aligned with the active hosting target.

## Definition Of Done

- `npm run build` passes.
- Manual acceptance checklist in `TEST_PLAN.md` is completed or skipped with reason.
- Any changed product behavior, data shape, technical decision, or folder role is reflected in the matching root source-of-truth file.
