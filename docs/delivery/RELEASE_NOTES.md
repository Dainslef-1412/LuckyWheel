# RELEASE_NOTES.md

Release notes for `luckyWheel` (`zhuanpan`). Newest release first.

Each entry records what shipped, what it affects, and the evidence the
release candidate was verified with. Deployment itself is a separate,
human-approved step — see `docs/tech/deployment.md`.

## v1.0.0 — 2026-09-03

- **Release candidate**: `28f16c5` (`main`)
- **Previous packaged build**: `4222944`
- **Artifact**: `outputs/packages/LuckyWheel-netlify-28f16c5.zip`
  (sha256 `2a58e6b349fab2dc58ffe193f89e4b9d5f6575258479a97e932f0cd0cf2965cc`)
- **Scope**: 14 commits, 30 files, +1871 / −566

### Highlights

**Spin correctness (user-visible bug fix).**
Every spin after the first used to stop on a different sector than the one
announced as the winner, because the alignment angle was computed from zero
instead of from the rotation the wheel already carried. `calculateSpinRotation`
now measures the alignment step from the current offset, so the pointer lands
on the announced winner on every consecutive spin. This is the single most
significant behavior change in the release.

**Center and sector label rendering.**
Center text is now scaled to fit the hub instead of using a fixed 16px size,
with CJK glyphs measured at roughly one em and latin glyphs at roughly 0.6em,
clamped to 9–16px and truncated past 10 characters. The center text element
carries a stable `#center-text` / `data-role="center-text"` hook, so updates no
longer depend on matching on `dominant-baseline`.

**Share URL hardening and a versioned payload.**
Shared configurations are now wrapped in a `{ version: 1, config }` envelope
and normalized on both encode and decode: title and labels are trimmed and
capped at 80 characters, weights are coerced into 1–999, items are capped at 20
and require at least 2, and the theme must be one of the five known presets.
Decoding additionally rejects a `config` parameter longer than 12000 characters
or containing anything outside the Base64 alphabet, and returns `null` rather
than throwing on malformed input. `decodeConfigFromSearch(search)` was split out
so decoding is testable without a browser `window`.

**Accessibility and modal behavior.**
Buttons, theme choices, and preset controls carry `aria-pressed`,
`aria-label`, `aria-labelledby`, and `aria-describedby`; the result area is a
`role="status"` live region; dialogs are `role="dialog"` with `aria-modal` and
focus trapping, restoration, and Escape-to-close.

**Mobile quick decision flow.**
A mobile quick bar reports spin status and disables spin controls while the
wheel is turning, so a second tap cannot interrupt an in-flight spin.

**Documentation set.**
Root source-of-truth files were established — `SPEC.md` (replacing `prd.md`),
`DATA_DESIGN.md`, `TECH_DESIGN.md`, `TEST_PLAN.md`, `PROJECT_LAYOUT.md`,
`AGENTS.md` — plus `docs/README.md`, `docs/agent-development-guidelines.md`,
`docs/tech/deployment.md`, and `docs/delivery/ITERATION_PLAN.md`.

**Test suite and toolchain.**
`npm test` now runs every `tests/*.test.js` under `node:test`: 26 tests
covering spin rotation across consecutive spins, sector angle coverage, weighted
selection ratios, center text sizing, URL round-tripping, and shared-config
safety. Vite moved from `^5.0.0` to `^6.4.3`, PostCSS was updated for its
advisory, and `.npmrc` pins the public npm registry so the Netlify build
resolves packages.

### Impact and compatibility

- **Shared URLs**: old links still decode. The legacy shape (a bare config
  object) is accepted by `normalizeSharedConfig`, and links that fail
  validation now fall back to a default wheel instead of throwing. Newly
  generated links carry the `version: 1` envelope and are not readable by
  builds older than `314df69`.
- **Saved presets**: `localStorage` preset format is unchanged; no migration.
- **Runtime dependencies**: none. The build has zero production dependencies
  and the bundle is fully self-contained — the only external URL in the output
  is the SVG XML namespace, which is an identifier, not a network fetch.
- **Hosting**: unchanged. Any static host serving `dist/` works.

### Verification

Run against `28f16c5` on Node v22.23.2 / npm 10.9.8:

| Check | Command | Result |
|---|---|---|
| Dependency install | `npm ci` | 14 packages, clean |
| Unit tests | `npm test` | 26 passed, 0 failed |
| Production build | `npm run build` | built in 408ms |
| Preview smoke | `npm run preview` | HTTP 200 on `/` and on the hashed JS asset |
| Self-containment | grep for external hosts in `dist/` | none |

Bundle size: `dist/index.html` 28.02 kB (gzip 5.56 kB),
`dist/assets/index-BoUrun-g.js` 28.92 kB (gzip 9.78 kB).

The `TEST_PLAN.md` manual acceptance checklist was **not** executed for this
release — it requires a human at a real browser on desktop and mobile
breakpoints, which the automated checks above do not substitute for.

### Known issues

- **`nanoid` high-severity advisory (GHSA-2v37-7h3g-55p8)** remains open in the
  lockfile via `vite@6.4.3 → postcss@8.5.24 → nanoid@3.3.16`. It is
  **build-toolchain only**: the project has zero production dependencies and
  `nanoid` is not present in the shipped bundle, so the deployed artifact is not
  affected. `npm audit fix` resolves it and should be picked up in the next
  dependency pass.
