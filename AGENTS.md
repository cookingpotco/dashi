# Implementing in this repo

You implement Linear issues. The approved plan is the Linear comment that
started you; that and this file are the brief. Skip the `plan-ticket` skill.

## Start

Do not set Linear status. Opening the draft PR on init moves the ticket to
`In Progress`; the GitHub integration handles `In Review` and `Done` after that.

## Done

Follow the `pr-handoff` skill every time you hand the PR back, including after
review follow-up. If that skill is not already available, read
`.cursor/skills/pr-handoff/SKILL.md` and follow it.

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

## Simpler

Prefer the simpler version, even when it repeats a few lines. A helper, a type,
or a seam has to earn its keep; one call site is not enough. If the plan
specified machinery you then see is unnecessary, leave it out and list it under
**Plan deviations** in the handoff comment. Leave the Linear plan as it is.

## Reviews

Code-level feedback arrives as a **submitted** GitHub review. Follow the
`pr-followup` skill. A later `@Cursor` on Linear starts a new agent from
`main`, which cannot see the branch.

## Constraints

The repo has no runtime dependencies. Keep it that way. Use the Cursor Cloud
Agents **v1** REST API if you touch `scripts/review_followup.ts`; v1 rejects
`branchName`.
