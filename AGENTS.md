# AGENTS.md

Before coding, read `SPEC.md`, `DATA_DESIGN.md`, `TECH_DESIGN.md`, `TEST_PLAN.md`, `PROJECT_LAYOUT.md`, and `docs/agent-development-guidelines.md`. Product truth lives in `SPEC.md`; data truth in `DATA_DESIGN.md`; technical truth in `TECH_DESIGN.md`; verification truth in `TEST_PLAN.md`.

Use `src/` for browser application code, `docs/` for confirmed project documentation, and `outputs/` only for generated or deployable artifacts. Do not commit `dist/`, `node_modules/`, or generated deployment packages.

Prefer existing npm commands before adding new tooling:

```bash
npm run dev
npm run build
npm run preview
```

If behavior, data shape, architecture, commands, deployment, or project layout changes, update the matching source document in the same change. Keep edits small and preserve user changes.
