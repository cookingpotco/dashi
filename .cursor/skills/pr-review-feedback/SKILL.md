---
name: pr-review-feedback
description: Collects the current review feedback on a GitHub pull request - every unresolved review thread plus the top-level discussion - using the GraphQL API so resolved threads can be told apart from open ones. Use when addressing review feedback or review comments on a pull request, when a review has been submitted or changes requested, or when asked what is still outstanding on a PR.
---

# PR review feedback

Collects everything still outstanding on a pull request, given a repository as
`OWNER/NAME` and a pull request number.

## 1. Unresolved review threads

These are the things to act on. Resolved state exists **only** in the GraphQL
API - the REST endpoints return every comment with no way to tell which are
settled:

```
gh api graphql -f owner=OWNER -f name=NAME -F number=PR -f query='
  query($owner:String!,$name:String!,$number:Int!){
    repository(owner:$owner,name:$name){ pullRequest(number:$number){
      reviewThreads(first:100){ nodes {
        isResolved isOutdated path line
        comments(first:50){ nodes { author{login} body } }
      } }
    } }
  }'
```

## 2. Top-level discussion and review summaries

```
gh pr view PR --repo OWNER/NAME --comments
```

Inline threads carry the specifics; the review summary usually carries the
intent behind them. Read both before changing anything.

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
- If a review asks for something that contradicts a deliberate decision, say so
  in a reply rather than silently changing it.

## If the result looks truncated

The query caps at 100 threads and 50 comments per thread. On a PR large enough
to hit either, page with `after:` and the relevant `pageInfo.endCursor` rather
than working from a partial list.
