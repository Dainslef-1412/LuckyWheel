# HOSTINGER_DELIVERY_VERIFY.md

Verification of the Hostinger `github-agent` delivery path for this repository:
can a `codex/*` branch be published and opened as a Draft PR from this host?

This exists because `CLOSEOUT_v1.0.0.md` handoff 3 recorded that path as
blocked, with the cause stated as a hypothesis rather than a confirmed fact.
Everything below is a command that was actually run, on the date given.

## Scope

Delivery-path verification only. No source, contract, dependency, or ADR file
is touched. This file does not restate the v1.0.0 release notes.

## Environment, 2026-09-04

| Check | Command | Result |
|---|---|---|
| Broker reachable | `github-agent doctor` | `status: ok`, exit 0 |
| Repository allowlisted | `github-agent doctor` | `Dainslef-1412/LuckyWheel` present in `broker_repositories` |
| Issue read granted | `github-agent doctor` | `issue_read_granted: true` |
| Local `main` current | `github-agent fetch` | `status: current` at `1c8f18a` |
| Draft subcommand exists | `github-agent pr-create-draft --help` | `--title`, `--body`, `--body-file` |
| Tree releasable | `npm test` | 26 passed, 0 failed |
| Tree releasable | `npm run build` | passed, `dist/index.html` + one hashed asset |

## The `codex/*` naming constraint

The broker client requires the branch prefix `codex/`. A remote branch named
exactly `codex` would make every such name unpublishable: Git cannot hold
`refs/heads/codex` and `refs/heads/codex/<anything>` at the same time, because
the first is a file where the second needs a directory. That is why the branch
used here is `codex/hostinger-delivery-verify` and never bare `codex`.

The last three merged branches on this repository — `codex-release-prep-v1-0-0`,
`codex-fix-postcss-advisory`, `codex-spin-landing-and-center-text` — all use a
dash instead of a slash, which is what a blocked `codex/` prefix looks like from
the outside.

A stale `refs/remotes/origin/codex` is not evidence either way: `github-agent
fetch` tracks `main` alone and never prunes other remote-tracking refs, and no
command on this host can list remote branches. So the question can only be
settled by attempting the push. The result is recorded below.

## Result

Filled in by the commit that follows this one, after `github-agent push` and
`github-agent pr-create-draft` were run against this branch.

## Out of scope for this seat

Merge, marking the PR ready, and deployment are Product Owner and human
decisions. Deleting a remote branch, if that turns out to be needed, is
outside this host's tooling as well as this seat's authority.
