# Implementing in this repo

You implement Linear issues. The approved plan is a comment on the ticket; that
and this file are the brief. Skip `.cursor/rules/planner.mdc`.

## Start

Set the ticket to `In Progress` as your first act, once you have actually
started. Do not set `In Review` or `Done`; the GitHub integration does that.

## Done

This list applies every time you hand the PR back, including after review
follow-up. A later commit does not inherit a previous green run.

Cursor opens a draft PR on the first push, long before the work is finished. An
open PR is not readiness. These are:

- `deno fmt --check .`, `deno lint`, `deno check` and `deno test -A` all pass
  locally, and CI is green on the branch you pushed. `main` is green; a red
  check means you are not done. Naming another issue in the PR description is
  not a substitute.
- If you hit a failure that is not yours, quarantine it so CI stays green, as
  narrowly as possible and naming the issue that owns it. Do not fix unrelated
  failures you did not cause.
- The change is covered by tests, following **Tests** below.
- A PR comment accounts for the approved plan: what you did, what the plan
  scoped out, and any suggestion that would change it. Do not ship a deviation
  until it is approved on the PR. Do not edit the PR description or the Linear
  plan.
- Dead code, debug output and commented-out experiments are gone.
- Leftover references to this ticket are gone, following **Sweep** below.

Those four commands are what CI runs. Match them locally before you push.

Update from the PR base before handing over: check the base branch out, `git
pull`, check your branch back out, merge the base into it. Resolve conflicts.
Do not rebase or force-push.

Then `gh pr ready`. Check that it took: the draft state sometimes survives the
call, and a draft cannot be merged. Marking the PR ready is what starts Bugbot.
Do not comment `@cursor review`. Do not wait for Bugbot before handing over;
findings come back as a submitted review and `review-followup.yml` resumes you.
Address them. Do not ask Bugbot again.

## Tests

Every behaviour change is covered by a test: extend one that already exists, or
add one. Prefer fewer tests that cover more surface over a case per branch.

**Black-box first.** Drive the public behaviour — render some JSX, hit a route,
assert on the HTML — rather than the internals of routing or SSR. Once COO-38
lands, that is the HTTP end-to-end suite: add a case there instead of a new
harness. Until then, if the right coverage is an HTTP test, leave a
`TODO(COO-38)` on the behaviour and do not stand up a one-off server test.

**Unit tests** only for small, pure functions that are the behaviour: the JSX
runtime, escaping, anything that is a calculation. COO-6 owns exhaustive
jsx-runtime coverage; other modules do not get a parallel suite of that density.

Do not add an integration or end-to-end harness outside COO-38.

## Sweep

Before `gh pr ready`, grep the repo for the ticket id (`COO-XX`) and for the
names of what you changed. Clear `TODO`s, `it.ignore`, lint suppressions, Bugbot
known-defect rows, and README mentions that this ticket owns.

If a leftover was waiting here but is still blocked, retarget the comment to the
issue that actually owns it and say so on the Linear ticket. Do not delete the
marker and do not leave it pointing at work that has already landed.

## Simpler

Prefer the simpler version, even when it repeats a few lines. A helper, a type,
or a seam has to earn its keep; one call site is not enough. If the plan
specified machinery you then see is unnecessary, leave it out and say so in the
PR comment as a suggestion. Do not add an API the plan forbade. Do not edit the
Linear plan.

## Reviews

Code-level feedback arrives as a **submitted** GitHub review. Collect what is
still open with the `pr-review-feedback` skill. Do not `@Cursor` the Linear
ticket for fixes: that starts a new agent from `main`, which cannot see the
branch. Do not edit the PR description. When the fixes are in, complete **Done**
again — including a green CI run on the new push — before `gh pr ready`.

## Constraints

The repo has no runtime dependencies. Keep it that way. Use the Cursor Cloud
Agents **v1** REST API if you touch `scripts/review_followup.ts`; v1 rejects
`branchName`.
