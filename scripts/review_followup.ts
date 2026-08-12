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
  prNodeId: string;
  reviewId: number;
  reviewState: string;
  reviewAuthor: string;
  reviewBody: string;
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
    prNodeId: event.pull_request.node_id,
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

/**
 * Puts the PR back into draft, which is only possible through GraphQL - REST
 * exposes `draft` as read-only. Draft is what tells Linear the work is back with
 * the agent, and the agent marks it ready again when it is finished.
 */
async function convertToDraft(nodeId: string, token: string): Promise<void> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      query:
        "mutation($id:ID!){convertPullRequestToDraft(input:{pullRequestId:$id}){pullRequest{isDraft}}}",
      variables: { id: nodeId },
    }),
  });
  const body = await response.json() as {
    errors?: { message: string }[];
    data?: {
      convertPullRequestToDraft?: { pullRequest?: { isDraft: boolean } };
    };
  };
  if (!response.ok || body.errors?.length) {
    const detail = body.errors?.map((e) => e.message).join("; ") ??
      `HTTP ${response.status}`;
    throw new Error(`Could not convert the PR to draft: ${detail}`);
  }
  if (body.data?.convertPullRequestToDraft?.pullRequest?.isDraft !== true) {
    throw new Error("The PR did not end up in draft.");
  }
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
  ) as { html_url: string; node_id: string };
  return {
    repo,
    prNumber,
    prUrl: pr.html_url,
    prNodeId: pr.node_id,
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
    "Pull the branch before you start. It may have moved since your last run, and",
    "a push from a workspace that is behind will be rejected.",
    "",
    "Address the review feedback. Collect it with the `pr-review-feedback` skill",
    `for PR ${context.prNumber} in ${context.repo}; if that skill is not already`,
    "available to you, read `.cursor/skills/pr-review-feedback/SKILL.md` in the",
    "repository and follow it. Work from what you find there, not from this",
    "message, so that you see every thread still open.",
    "",
    "You still have the approved plan from earlier in this conversation. If a",
    "comment conflicts with something the plan deliberately called for, say so in",
    "your reply rather than silently changing it.",
    "",
    "The review put the PR back into draft. When you are done:",
    "- Commit and push to the same branch. Do not force-push or rebase.",
    "- Post one PR comment summarising what you changed, and anything you",
    "  disagreed with and why.",
    "- Mark the PR ready for review again with `gh pr ready`.",
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

  if (context.reviewState === "approved" && !context.reviewBody.trim()) {
    console.log("Bare approval with no summary; nothing to forward.");
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

  // An approval says the PR may merge, and drafting it would take that back.
  if (context.reviewState !== "approved") {
    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) {
      console.warn("No GITHUB_TOKEN, so the PR keeps its current state.");
    } else {
      try {
        await convertToDraft(context.prNodeId, token);
        console.log("Put the PR back into draft.");
      } catch (error) {
        // Losing the draft flip is survivable; losing the feedback is not.
        console.warn(error instanceof Error ? error.message : String(error));
      }
    }
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
