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

1. **Discuss and research** before planning. Stay in the current mode; do not
   switch to plan mode yet. Verify the ticket's claims against the code; tickets
   are written from memory and go stale.

   Surface every major decision, consideration, and fork — anywhere there are
   multiple possible directions — as a question to the human. Do not pick a
   direction yourself. Batch the questions into one pass, wait for answers, then
   move on. If a question has discrete options, use `AskQuestion`. Skip this
   only when the code and ticket leave no real choice.

2. **Plan** in plan mode, iterating until the human approves. Skip this for
   S-pointed issues whose ticket already reads like a plan. Present the full
   plan in the chat. After every alteration, show the full plan again — do not
   describe the delta and leave the plan implied.
3. **Start the implementor.** After approval:

   **Figma.** If this ticket must read or write Figma (design brainstorm, edits,
   or pixel-matching a design in code), do **not** post `@Cursor`. Cloud Agents
   cannot use Figma MCP. Post the approved plan as a Linear comment **without**
   that mention. Tell the human to run it in a **local** `agent` session with
   Figma MCP connected. Leave the status at `Ready`.

   While planning those tickets, use Figma MCP in this session. Put file URLs
   and node IDs in the plan; screenshots are for the human reviewing the plan,
   not a stand-in spec for a cloud agent.

   **Otherwise** post the plan as a Linear comment that begins with `@Cursor`,
   then the full approved plan. That mention is the only cloud handoff: Linear
   puts this comment in the agent's prompt and starts one cloud agent. Leave
   the status at `Ready`. The GitHub integration sets `In Progress` when the
   agent opens its draft PR.

   The comment is the plan only. Do not add Done or handoff instructions there —
   the implementor follows `AGENTS.md` either way, including when a human posts
   the `@Cursor` mention themselves.

   Do not also set Linear `delegate` or assignee to Cursor. Delegating the issue
   and mentioning `@Cursor` are two independent starts; using both launches two
   agents, two PRs, and two bills. Linear fills in `delegate` itself once the
   mention agent is running. If an agent-session thread already exists on the
   issue, stop — do not post another `@Cursor`.

## While planning

- **Do not start an implementor on spikes.** Design issues produce a written
  decision and stay with the human.
- **Figma is local.** Cloud Agents cannot use Figma MCP. Design tickets and
  tickets that must match a Figma file run in a local session. Do not `@Cursor`
  them.
- **Name the test layer.** Follow the Tests section in `AGENTS.md`. Unit tests
  for pure functions. Behaviour at the path that actually runs — compiled JSX
  for markup, HTTP cases in `int-tests/`, live DOM after JS in `e2e/`. No stubs,
  mocks, or a narrower harness to stand in for a flow that only happens further
  out. If the right coverage is HTTP, plan an `int-tests/` case (declarative
  when it is one request, or a `t.step` on the same harness helpers when it is
  not). If the right coverage is the live document after JS, plan an `e2e/` case
  — a `t.step` inside that fixture's `withBrowser`, or a new fixture folder when
  the case cannot live on the existing app. Do not invent a substitute harness.
- **Prefer the simpler design**, even when it repeats. If a bit extra work could
  simplify this or additional areas, consider it as well.
- **Conventions.** Agents already follow `.cursor/rules/conventions.mdc`.
  Consider whether this work requires updating that rule — a new pattern, a
  conflicting use case, or existing code that should align.
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
