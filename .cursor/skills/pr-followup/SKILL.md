---
name: pr-followup
description: >-
  Starts a pull-request review follow-up: put the PR back in draft, update
  from base, collect every unresolved review thread, reply in those threads,
  and address the feedback. Use when a review has been submitted, when
  addressing review comments, or when asked what is still outstanding on a PR.
---

# PR follow-up

A submitted review resumed you. You still have the approved plan from earlier in
this conversation. Given a repository as `OWNER/NAME` and a pull request number:

1. `gh pr ready --undo`, so the PR sits in draft while the work is with you.
2. Pull your branch. It may have moved since your last run, and a push from a
   workspace that is behind will be rejected.
3. Update from the PR base before you change anything:
   `gh pr view --json
   baseRefName -q .baseRefName`, check that branch out,
   `git pull`, check your branch back out, merge the base into it. Resolve
   conflicts. Do not rebase or force-push.
4. Collect what is still open (below). Work from that list, so you see every
   thread still open.
5. Address the feedback. Follow the plan where you can. If a comment conflicts
   with it, say so in a thread reply; a change that cannot match the plan still
   ships, listed under **Plan deviations** at handoff.

When the work is in, follow the `pr-handoff` skill. If it is not already
available, read `.cursor/skills/pr-handoff/SKILL.md` and follow it.

## Unresolved review threads

These are the things to act on. Resolved state exists **only** in the GraphQL
API - the REST endpoints return every comment with no way to tell which are
settled:

```
gh api graphql -f owner=OWNER -f name=NAME -F number=PR -f query='
  query($owner:String!,$name:String!,$number:Int!){
    repository(owner:$owner,name:$name){ pullRequest(number:$number){
      reviewThreads(first:100){ nodes {
        isResolved isOutdated path line
        comments(first:50){ nodes { databaseId author{login} body } }
      } }
    } }
  }'
```

## Top-level discussion and review summaries

```
gh pr view PR --repo OWNER/NAME --comments
```

Inline threads carry the specifics; the review summary usually carries the
intent behind them. Read both before changing anything.

## Replying in a thread

Answer a question where it was asked. Reply on that thread with the pull-request
tool.

A reply belongs in the thread whenever the point is specific to that comment: a
question about why something was done, a disagreement, or a note that the fix
took a different shape than suggested. The conversation comment is for the
overall scope of the change; `pr-handoff` covers how to post it.

## Interpreting the result

- **Act on every thread where `isResolved` is false.** Leave resolved threads
  alone; someone decided they were settled.
- **Never resolve a thread yourself.** Resolving is how the reviewer tracks what
  they have checked, and it is what the query above filters on. Leave every
  thread open, however sure you are that it is dealt with.
- **`isOutdated` true means the code under the comment has since changed.** The
  point may still stand, so check the current code rather than assuming either
  way.
- **Do not redo work from an earlier round.** A thread stays open until someone
  resolves it, so an open thread is not proof that nothing was done about it.
  Check the history of the thread and the current state of the code.

## If the result looks truncated

The query caps at 100 threads and 50 comments per thread. On a PR large enough
to hit either, page with `after:` and the relevant `pageInfo.endCursor` rather
than working from a partial list.
