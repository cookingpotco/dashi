---
name: plan-ticket
description: >-
  Picks, researches, plans, and starts the implementor on a Linear issue from
  Dashi F&F Launch. Use when planning a ticket, planning the next ticket, or
  when given a COO- id to plan. Not for implementing a ticket.
---

# Plan ticket

You plan and start the implementor. You do not implement the ticket. If you were
delegated a Linear issue to implement, ignore this skill and follow `AGENTS.md`.

The shared flow, statuses, and feedback routing live in
`.cursor/rules/issue-workflow.mdc`.

## Ticket

If the user named an issue (`COO-12`, a Linear URL, or a title that resolves to
one), plan that one. Otherwise pick the next issue:

1. List issues in `Dashi F&F Launch` whose status is not `Ready`, `In Progress`,
   `In Review`, `Done`, or canceled.
2. List that project's milestones and keep their order.
3. Load relations on the candidates. Drop any issue still blocked by an
   unfinished issue.
4. Take the earliest remaining milestone. If several issues sit there, suggest
   multiple options to the human, sorted by value, impact, and effort.

A named ticket that is still blocked, or that already has an approved plan, is a
stop: tell the human rather than silently substituting another issue.

## The loop

1. **Discuss and research** before planning. Verify the ticket's claims against
   the code; tickets are written from memory and go stale.
2. **Plan** in plan mode, iterating until the human approves. Skip this for
   S-pointed issues whose ticket already reads like a plan.
3. **Start the implementor.** After approval, post the plan as a Linear comment
   that begins with `@Cursor`, then the full approved plan. That mention is the
   handoff: Linear puts this comment in the agent's prompt. Leave the status at
   `Ready`. The GitHub integration sets `In Progress` when the agent opens its
   draft PR.

## While planning

- **Do not start an implementor on spikes.** Design issues produce a written
  decision and stay with the human.
- **Name the test layer.** Unit tests for pure functions (JSX runtime exports,
  calculations). Black-box tests for behaviour, at the outer layer that runs:
  compiled JSX over a twin `jsx()` call, HTTP once COO-38 lands. One test per
  flow; cover as much of that flow as will hold. Unrelated flows stay separate.
  HTTP coverage waits on COO-38 — plan a `TODO(COO-38)`, not a new harness.
- **Prefer the simpler design**, even when it repeats. Do not introduce a
  helper, a type, or a seam for a single call site. If a bit extra work could
  simplify this or additional areas, consider it as well.
- **One way to do a thing.** Do not plan a parallel API, an alias, or a second
  pattern for a job that already has one. If the ticket would leave both in
  place, decide which survives before the plan is approved. Equivalent twins
  (`class` / `className`) collapse to one. Overlapping concepts must either
  merge or come out with a distinction no caller can miss; leaving both "for
  now" is the failure mode.
- **Suggest splitting when scope grows.** If planning uncovers work with unknown
  fallout, file a separate issue and land it first rather than letting an S
  ticket quietly become an L.
- **Check for file collisions** before starting implementors in parallel. Two
  issues touching the same directory will conflict.
