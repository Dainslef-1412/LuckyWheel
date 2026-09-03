# CLOSEOUT_v1.0.0.md

Release closeout for `luckyWheel` v1.0.0, candidate `28f16c5`.
Release notes: `docs/delivery/RELEASE_NOTES.md`.

## What this release preparation covers

Packaging and documentation only. No source, contract, or dependency file was
changed as part of it. The release candidate is `main` exactly as it already
stands at `28f16c5`; this closeout does not move code toward `main`.

## Gate status

| Gate | Item | State |
|---|---|---|
| G5 | Release notes recorded | Done — `docs/delivery/RELEASE_NOTES.md` |
| G5 | Closeout recorded | Done — this file |
| G5 | Deployment artifact packaged | Done — `outputs/packages/LuckyWheel-netlify-28f16c5.zip` |
| — | `npm test` | 26 passed, 0 failed |
| — | `npm run build` | Passed |
| — | `npm run preview` smoke | HTTP 200 on entry and hashed asset |
| — | `TEST_PLAN.md` manual acceptance | **Not run** — needs a human on real desktop and mobile browsers |
| G5 | Draft PR opened | **Blocked** — broker refuses to publish the branch, see handoff 3 |
| — | Merge to `main` | Out of scope — Product Owner decision |
| — | Deployment | Out of scope — requires a human approval record |

## Handoff items

Two items are outside the release seat's authority and are handed to the
seats that own them.

### 1. `claude` branch does not merge into `main` — Developer

The branch `origin/claude` carries two commits that are not on `main`:

- `598c7eb` — first-run friction: default preset on first visit, 快速开始
  chip row, session restore from `localStorage`, lower-half label flipping,
  built-in presets trimmed 6 → 4
- `497e9ef` — visual polish: same-family theme palettes, `getContrastText`
  luminance-based label contrast, adjacent/seam color separation, bezel and
  hub treatment, sticky preview panel

It branched from `d5162ac` (2026-07-07) and has not been updated since
2026-07-24, while `main` advanced through `c803ea3`, `e8f674e`, `c97a211`, and
`dc8c591`. An in-memory merge test
(`git merge-tree --write-tree main origin/claude`) reports content conflicts in:

- `package.json`
- `src/wheel.js`

`src/preset-manager.js` and `src/themes.js` auto-merge, but both branches
rewrote overlapping regions of the wheel rendering and theme code, so the
auto-merged result still needs review rather than trust.

Resolving this means editing `src/**`, which the release seat cannot do. It
needs a Developer to rebase the branch onto `28f16c5`, reconcile the two
independent label-rendering changes (this branch's 180° flip for lower-half
labels versus main's centered-label work in `e8f674e`), and re-run the suite
before it can be packaged.

One caveat on the evidence: `github-agent fetch` tracks `main` alone, so
`refs/remotes/origin/claude` is a local snapshot from an earlier fetch. It is
not proof that the branch still exists on GitHub. Confirm the branch is live
before planning work against it.

### 2. `nanoid` advisory in the lockfile — Developer

`npm audit` reports one high-severity advisory, GHSA-2v37-7h3g-55p8, reached
through `vite@6.4.3 → postcss@8.5.24 → nanoid@3.3.16`.

It does not affect the shipped artifact: the project declares zero production
dependencies and `nanoid` is absent from the bundle, so this is build-toolchain
exposure only. It is not a release blocker for v1.0.0, and it should be closed
in the next dependency pass — `npm audit fix` resolves it, and it touches
`package-lock.json`, which is not a release-seat writable path.

### 3. Broker cannot publish a `codex/*` branch for this repo — Ops

Release preparation is committed locally on `codex/release-prep-v1-0-0` but
could not be delivered to GitHub. Both broker commands refuse:

- `github-agent push` → `{"reason": "git-remote-rejected", "status": "rejected"}`
- `github-agent pr-create-draft` → `{"reason": "github-api-failed", "status": "rejected"}`

`github-agent doctor` is green (`status: ok`, exit 0), the repository is
allowlisted, and the branch satisfies the client's
`codex/[A-Za-z0-9][A-Za-z0-9._/-]{0,119}` requirement and descends from remote
`main` at `28f16c5`, so this is not an access, naming, or ancestry failure. Two
names were tried (`codex/release-prep-v1.0.0` and `codex/release-prep-v1-0-0`)
with the identical result.

Most likely cause: the remote already has a branch named exactly `codex`
(`refs/heads/codex`, at `d5162ac`, already merged into `main`). Git cannot hold
`refs/heads/codex` and `refs/heads/codex/<anything>` at the same time — a
directory/file ref conflict — and `git-remote-rejected` is what a server returns
for it. Reproduced locally against the mirrored ref:

```
$ git update-ref refs/remotes/origin/codex/dftest HEAD
fatal: ... 'refs/remotes/origin/codex' exists; cannot create
'refs/remotes/origin/codex/dftest'
```

That would block *every* allowed branch name, since the client requires the
`codex/` prefix. It is consistent with the two most recent merged branches being
named `codex-fix-postcss-advisory` and `codex-spin-landing-and-center-text`
with a dash rather than a slash.

This is a hypothesis, not a confirmed fact: no command on this host can list
remote branches, and `github-agent fetch` tracks `main` alone, so
`refs/remotes/origin/codex` is a stale local snapshot and is not proof the
branch is still live on GitHub.

Resolution needs someone who can inspect and delete `refs/heads/codex` on
GitHub after confirming it is fully merged, or a broker-side change. Deleting a
remote branch is outside both this seat's authority and this host's tooling.
Once unblocked, the delivery is two commands from the existing branch:

```sh
github-agent push
github-agent pr-create-draft --title "docs: v1.0.0 release notes and closeout" \
  --body-file ./pr-body.md
```

The prepared PR body is left at the repository root as the untracked file
`pr-body.md`.

## Next steps

1. Product Owner reviews the Draft PR and decides on merge.
2. Developer picks up the two handoff items above.
3. A human runs the `TEST_PLAN.md` acceptance checklist before any production
   deployment.
4. Deployment, when approved, follows `docs/tech/deployment.md`; the packaged
   artifact under `outputs/packages/` is ready to upload.
5. Add `delivery/RELEASE_NOTES.md` and `delivery/CLOSEOUT_v1.0.0.md` to the
   supporting-docs list in `docs/README.md`. That file sits outside the release
   seat's writable paths, so the two entries are left for whoever owns the docs
   index.
