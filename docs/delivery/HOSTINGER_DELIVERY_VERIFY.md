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

**The path works. The earlier hypothesis was wrong — the blocker was local.**

`github-agent push` from `codex/hostinger-delivery-verify` first failed twice
with `{"reason": "local-git-command-failed"}`. That reason names the *local*
side, unlike the `git-remote-rejected` the earlier attempt recorded. It
reproduces directly:

```
$ git update-ref refs/remotes/origin/codex/dftest HEAD
fatal: ... 'refs/remotes/origin/codex' exists;
cannot create 'refs/remotes/origin/codex/dftest'
```

`refs/remotes/origin/codex` was a stale remote-tracking ref at `d5162ac`,
already an ancestor of `main`. Because `github-agent fetch` tracks `main` alone
and never prunes, it had outlived the branch it mirrored. Writing the tracking
ref for any `codex/*` branch therefore failed on this host before the push
reached GitHub at all.

One local, reversible deletion cleared it:

```sh
git update-ref -d refs/remotes/origin/codex
# restore if ever needed:
# git update-ref refs/remotes/origin/codex d5162acf7170a81ada561cdd4c127ade58d4e888
```

Nothing on GitHub was changed. The next `github-agent push` succeeded on the
first try:

| Step | Command | Result |
|---|---|---|
| Publish branch | `github-agent push` | `status: pushed`, `codex/hostinger-delivery-verify` at `da11901` |
| Open Draft PR | `github-agent pr-create-draft --title ... --body-file ./pr-body.md` | `status: draft-created`, PR #16, `draft: true`, base `main` |

So `refs/heads/codex` is not blocking anything on the remote — whether it was
deleted in the meantime or never was the cause, a `codex/*` branch publishes
cleanly today. `CLOSEOUT_v1.0.0.md` handoff 3 is resolved and needs no Ops
action.

Two smaller facts worth keeping:

- `--body-file` must point **inside the repository**. A path under `/tmp` is
  refused with `{"reason": "pr-body-path-forbidden"}`.
- Retrying a broker failure once before attributing it is still right, but
  `local-git-command-failed` repeated identically twice, which is what pointed
  at a local cause rather than a transient token problem.

## Out of scope for this seat

Merge, marking the PR ready, and deployment are Product Owner and human
decisions. Deleting a remote branch, if that turns out to be needed, is
outside this host's tooling as well as this seat's authority.
