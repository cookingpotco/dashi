/**
 * Minimal client for the Cursor Cloud Agents v1 REST API, covering what is
 * needed to find the agent that opened a PR and send it a follow-up.
 *
 * Response envelopes differ between endpoints - POST wraps its result in `run`,
 * the GET variants return the object directly - so each method unwraps its own.
 */

const API_BASE = "https://api.cursor.com";

export const enum RunStatus {
  Creating = "CREATING",
  Running = "RUNNING",
  Finished = "FINISHED",
  Error = "ERROR",
  Cancelled = "CANCELLED",
  Expired = "EXPIRED",
}

export const TERMINAL_RUN_STATUSES: readonly RunStatus[] = [
  RunStatus.Finished,
  RunStatus.Error,
  RunStatus.Cancelled,
  RunStatus.Expired,
];

export interface Agent {
  id: string;
  name: string;
  status: string;
  repos: { url: string; startingRef?: string; prUrl?: string }[];
  url: string;
  latestRunId?: string;
}

export interface Run {
  id: string;
  agentId: string;
  status: RunStatus;
  durationMs?: number;
  result?: string;
}

/** Thrown for any non-2xx response, carrying the API's own error code. */
export class CursorApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(`${code} (HTTP ${status}): ${message}`);
    this.name = "CursorApiError";
  }
}

export class CursorClient {
  #apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("A Cursor API key is required.");
    }
    this.#apiKey = apiKey;
  }

  async #request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Record<string, unknown>> {
    const headers: Record<string, string> = {
      // The key is the Basic username with an empty password.
      Authorization: `Basic ${btoa(`${this.#apiKey}:`)}`,
    };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    let payload: Record<string, unknown> = {};
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        throw new CursorApiError(
          response.status,
          "invalid_json",
          text.slice(0, 200),
        );
      }
    }

    if (!response.ok) {
      // Auth failures are flat; everything else nests under `error`.
      const error = payload.error as
        | { code?: string; message?: string }
        | undefined;
      throw new CursorApiError(
        response.status,
        error?.code ?? (payload.code as string) ?? "unknown_error",
        error?.message ?? (payload.message as string) ?? response.statusText,
      );
    }

    return payload;
  }

  /** Newest first, so the first hit is the agent that most recently touched the PR. */
  async findAgentsByPrUrl(prUrl: string): Promise<Agent[]> {
    const query = new URLSearchParams({ prUrl });
    const payload = await this.#request("GET", `/v1/agents?${query}`);
    return (payload.items as Agent[]) ?? [];
  }

  async getAgent(agentId: string): Promise<Agent> {
    return await this.#request(
      "GET",
      `/v1/agents/${agentId}`,
    ) as unknown as Agent;
  }

  /** Sends a follow-up on the agent's existing conversation and workspace. */
  async createRun(agentId: string, prompt: string): Promise<Run> {
    const payload = await this.#request("POST", `/v1/agents/${agentId}/runs`, {
      prompt: { text: prompt },
    });
    return payload.run as Run;
  }

  async getRun(agentId: string, runId: string): Promise<Run> {
    return await this.#request(
      "GET",
      `/v1/agents/${agentId}/runs/${runId}`,
    ) as unknown as Run;
  }

  async waitForRun(
    agentId: string,
    runId: string,
    { pollMs = 10_000, timeoutMs = 45 * 60_000 } = {},
  ): Promise<Run> {
    const deadline = Date.now() + timeoutMs;
    while (true) {
      const run = await this.getRun(agentId, runId);
      if (TERMINAL_RUN_STATUSES.includes(run.status)) {
        return run;
      }
      if (Date.now() > deadline) {
        throw new Error(
          `Run ${runId} still ${run.status} after ${timeoutMs}ms.`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
  }

  /** Blocks while the agent has a run in flight; only one can be active at a time. */
  async waitUntilIdle(
    agentId: string,
    { pollMs = 15_000, timeoutMs = 45 * 60_000 } = {},
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (true) {
      const agent = await this.getAgent(agentId);
      if (!agent.latestRunId) {
        return;
      }
      const run = await this.getRun(agentId, agent.latestRunId);
      if (TERMINAL_RUN_STATUSES.includes(run.status)) {
        return;
      }
      if (Date.now() > deadline) {
        throw new Error(`Agent ${agentId} still busy after ${timeoutMs}ms.`);
      }
      console.log(`Agent busy (run ${run.id} is ${run.status}); waiting.`);
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
  }
}

export function apiKeyFromEnv(): string {
  const key = Deno.env.get("CURSOR_API_KEY");
  if (!key) {
    throw new Error(
      "CURSOR_API_KEY is not set. Create a key at https://cursor.com/dashboard/api",
    );
  }
  return key.trim();
}
