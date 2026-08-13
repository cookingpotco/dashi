#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read
/**
 * Tells the agent that opened a PR to go and read the review it just received.
 *
 * Resuming that same agent keeps the conversation and workspace from its
 * original run, so it still holds the plan it was given.
 *
 * Run from `.github/workflows/review-followup.yml`, which supplies the event
 * payload. For local testing:
 *
 *   deno run -A scripts/review_followup.ts \
 *     --repo cookingpotstudio/dashi --pr 19 --review-id 123456 --wait
 */

import { apiKeyFromEnv, CursorApiError, CursorClient } from "./lib/cursor.ts";

interface ReviewContext {
  repo: string;
  prNumber: number;
  prUrl: string;
  reviewId: number;
  reviewState: string;
  reviewAuthor: string;
  reviewBody: string;
}

interface ReviewComment {
  in_reply_to_id?: number | null;
}

/**
 * GitHub records a thread reply as a submitted review with an empty body
 * whose comments all set `in_reply_to_id`. Forwarding those re-queues the
 * agent on its own answers. A review with a body, or with a top-level inline
 * comment, is still forwarded — including Bugbot.
 */
export function shouldForwardReview(
  state: string,
  body: string,
  comments: ReviewComment[],
): boolean {
  const trimmed = body.trim();
  if (state === "approved" && trimmed === "") return false;
  if (
    trimmed === "" &&
    comments.every((comment) => comment.in_reply_to_id != null)
  ) {
    return false;
  }
  return true;
}

function parseFlags(args: string[]): Map<string, string> {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) continue;
    const name = args[i].slice(2);
    const next = args[i + 1];
    if (next === undefined || next.startsWith("--")) {
      flags.set(name, "true");
    } else {
      flags.set(name, next);
      i++;
    }
  }
  return flags;
}

async function contextFromEvent(path: string): Promise<ReviewContext> {
  const event = JSON.parse(await Deno.readTextFile(path));
  if (!event.review || !event.pull_request) {
    throw new Error("Event payload is not a pull_request_review event.");
  }
  return {
    repo: event.repository.full_name,
    prNumber: event.pull_request.number,
    prUrl: event.pull_request.html_url,
    reviewId: event.review.id,
    reviewState: String(event.review.state).toLowerCase(),
    reviewAuthor: event.review.user?.login ?? "unknown",
    reviewBody: event.review.body ?? "",
  };
}

async function githubFetch(path: string, token: string): Promise<unknown> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${path} returned HTTP ${response.status}.`);
  }
  return await response.json();
}

async function contextFromApi(
  repo: string,
  prNumber: number,
  reviewId: number,
  token: string,
): Promise<ReviewContext> {
  const review = await githubFetch(
    `/repos/${repo}/pulls/${prNumber}/reviews/${reviewId}`,
    token,
  ) as { state?: string; body?: string; user?: { login?: string } };
  const pr = await githubFetch(
    `/repos/${repo}/pulls/${prNumber}`,
    token,
  ) as { html_url: string };
  return {
    repo,
    prNumber,
    prUrl: pr.html_url,
    reviewId,
    reviewState: String(review.state).toLowerCase(),
    reviewAuthor: review.user?.login ?? "unknown",
    reviewBody: review.body ?? "",
  };
}

/**
 * The skill's path is spelled out as well as its name: Cursor only documents
 * skill invocation from chat, so an agent resumed through the API may not pick
 * it up from the name alone.
 */
function buildPrompt(context: ReviewContext): string {
  const stateLabel = context.reviewState === "changes_requested"
    ? "requested changes"
    : context.reviewState === "approved"
    ? "approved with comments"
    : "left comments";

  return [
    `${context.reviewAuthor} ${stateLabel} on your pull request ${context.prUrl}.`,
    "",
    "Before anything else:",
    "- `gh pr ready --undo`, so the PR sits in draft while the work is with you.",
    "- Pull your branch. It may have moved since your last run, and a push from a",
    "  workspace that is behind will be rejected.",
    "- Update from the PR base: `gh pr view --json baseRefName -q .baseRefName`,",
    "  check that branch out, `git pull`, check your branch back out, merge the",
    "  base into it. Resolve conflicts. Do not rebase or force-push.",
    "",
    "Address the review feedback. Collect it with the `pr-review-feedback` skill",
    `for PR ${context.prNumber} in ${context.repo}; if that skill is not already`,
    "available to you, read `.cursor/skills/pr-review-feedback/SKILL.md` in the",
    "repository and follow it. Work from what you find there, not from this",
    "message, so that you see every thread still open.",
    "",
    "You still have the approved plan from earlier in this conversation. If a",
    "comment conflicts with something the plan deliberately called for, say so in",
    "your reply rather than silently changing it. If you want to change the plan,",
    "put that in the summary comment as a suggestion. Do not edit the Linear plan",
    "or the PR description, and do not ship the deviation until it is approved",
    "on the PR.",
    "",
    "When you are done, complete the definition of done in AGENTS.md again. A",
    "later commit does not inherit a previous green run:",
    "- `deno fmt --check .`, `deno lint`, `deno check` and `deno test -A` all",
    "  pass locally. Fix anything that fails.",
    "- Commit and push to the same branch. Do not force-push or rebase.",
    "- Wait until CI is green on that push. A red check means you are not done.",
    "- Answer anything asked of you as a reply in that comment's thread, so each",
    "  conversation stays where it started. The skill shows how.",
    "- Post one PR comment summarising the follow-up: what you changed and to",
    "  what end. Not a point-by-point response. Do not edit the PR description.",
    "- `gh pr ready` to hand it back, and check that it took.",
  ].join("\n");
}

async function main(): Promise<number> {
  const flags = parseFlags(Deno.args);
  const eventPath = Deno.env.get("GITHUB_EVENT_PATH");

  let context: ReviewContext;
  if (eventPath && !flags.has("review-id")) {
    context = await contextFromEvent(eventPath);
  } else {
    const token = Deno.env.get("GITHUB_TOKEN");
    const repo = flags.get("repo");
    const prNumber = Number(flags.get("pr"));
    const reviewId = Number(flags.get("review-id"));
    if (!repo || !prNumber || !reviewId || !token) {
      throw new Error(
        "Pass --repo, --pr and --review-id (and set GITHUB_TOKEN) when running outside Actions.",
      );
    }
    context = await contextFromApi(repo, prNumber, reviewId, token);
  }

  console.log(
    `Review ${context.reviewId} by ${context.reviewAuthor} ` +
      `(${context.reviewState}) on ${context.prUrl}`,
  );

  const token = Deno.env.get("GITHUB_TOKEN");
  let comments: ReviewComment[] = [];
  if (!context.reviewBody.trim()) {
    if (!token) {
      throw new Error(
        "GITHUB_TOKEN is required to inspect an empty review before forwarding.",
      );
    }
    comments = await githubFetch(
      `/repos/${context.repo}/pulls/${context.prNumber}/reviews/${context.reviewId}/comments`,
      token,
    ) as ReviewComment[];
  }

  if (!shouldForwardReview(context.reviewState, context.reviewBody, comments)) {
    console.log("Thread replies or a bare approval; nothing to forward.");
    return 0;
  }

  const client = new CursorClient(apiKeyFromEnv());
  const agents = await client.findAgentsByPrUrl(context.prUrl);
  if (agents.length === 0) {
    console.log(
      `No Cursor agent is associated with ${context.prUrl}; nothing to do. ` +
        "(Expected for human-authored PRs.)",
    );
    return 0;
  }

  const agent = agents[0];
  console.log(`Resuming agent ${agent.id} (${agent.name}) at ${agent.url}`);

  if (flags.has("dry-run")) {
    console.log("\n--- prompt (not sent) ---\n" + buildPrompt(context));
    return 0;
  }

  try {
    await client.waitUntilIdle(agent.id);
    const run = await client.createRun(agent.id, buildPrompt(context));
    console.log(`Started run ${run.id} on agent ${agent.id}.`);

    if (flags.has("wait")) {
      const result = await client.waitForRun(agent.id, run.id);
      console.log(`Run ${result.id} ended as ${result.status}.`);
      if (result.result) console.log(result.result);
      return result.status === "FINISHED" ? 0 : 2;
    }
    return 0;
  } catch (error) {
    if (error instanceof CursorApiError) {
      console.error(`Could not send follow-up: ${error.message}`);
      return 1;
    }
    throw error;
  }
}

if (import.meta.main) {
  try {
    Deno.exit(await main());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}
