---
name: pr-handoff
description: >-
  Hands a pull request back for review: merge from base, local checks, CI,
  leftover sweep, the summary comment, and marking the PR ready. Use when
  finishing a ticket, after review follow-up, before `gh pr ready`, or when
  completing the definition of done.
---

# PR handoff

Every time the PR goes back to the human, including after review follow-up. A
later commit does not inherit a previous green run.

## Update from base

`gh pr view --json baseRefName -q .baseRefName`, check that branch out,
`git pull`, check your branch back out, merge the base into it. Resolve
conflicts. Do not rebase or force-push.

## Checks

`deno fmt --check .`, `deno lint`, `deno check` and `deno test -A` all pass
locally. Those are what CI runs. Match them before you push.

CI is green on the push you are handing over. `main` is green; a red check
means you are not done. Naming another issue in the PR description is not a
substitute.

If you hit a failure that is not yours, quarantine it so CI stays green, as
narrowly as possible and naming the issue that owns it. Do not fix unrelated
failures you did not cause.

The change is covered by tests, following **Tests** in `AGENTS.md`. Dead code,
debug output and commented-out experiments are gone.

## Sweep

Grep the repo for the ticket id (`COO-XX`) and for the names of what you
changed. Clear `TODO`s, `it.ignore`, lint suppressions, Bugbot known-defect
rows, and README mentions that this ticket owns.

If a leftover was waiting here but is still blocked, retarget the comment to
the issue that actually owns it and say so on the Linear ticket. Do not delete
the marker and do not leave it pointing at work that has already landed.

## Push

Commit and push to the same branch. Do not force-push or rebase. Wait until CI
is green on that push. A red check means you are not done.

## Comment

Leave the Linear plan and the PR description as they are.

Leave **one conversation comment** with the pull-request tool.

Follow the plan where you can. If a working change cannot match it, ship that
change and list it under a **Plan deviations** heading in the comment, so it
cannot be missed.

- First handoff: what you did, what the plan scoped out, then **Plan
  deviations** if any.
- After follow-up: what you changed and to what end. Not a point-by-point
  response. Specific answers belong in the threads; `pr-followup` covers those.
  **Plan deviations** again if this round added any.

## Ready

`gh pr ready`. Check that it took: the draft state sometimes survives the
call, and a draft cannot be merged. Marking the PR ready is what starts Bugbot.
Do not comment `@cursor review`. Do not wait for Bugbot before handing over;
findings come back as a submitted review and `review-followup.yml` resumes you.
Address them. Do not ask Bugbot again.
