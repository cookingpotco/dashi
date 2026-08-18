const LISTEN_RE = /Listening on https?:\/\/(?:\[[^\]]+\]|[\w.]+):(\d+)\//;
const BOOT_TIMEOUT_MS = 15_000;
const READY_POLL_MS = 25;
const KILL_WAIT_MS = 2_000;

export interface AppRequest {
  method?: string;
  path: string;
  headers?: Record<string, string>;
  body?: string | URLSearchParams | FormData;
}

async function readStream(
  stream: ReadableStream<Uint8Array>,
  onText: (text: string) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  for await (const chunk of stream) {
    onText(decoder.decode(chunk, { stream: true }));
  }
  onText(decoder.decode());
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  makeError: () => Error,
): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    id = setTimeout(() => reject(makeError()), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(id);
  }
}

/** Child process serving an app on an ephemeral port. */
export class App implements AsyncDisposable {
  readonly origin: string;
  #child: Deno.ChildProcess;
  #stdout: { text: string };
  #stderr: { text: string };
  #stdoutDone: Promise<void>;
  #stderrDone: Promise<void>;

  constructor(
    child: Deno.ChildProcess,
    port: number,
    stdout: { text: string },
    stderr: { text: string },
    stdoutDone: Promise<void>,
    stderrDone: Promise<void>,
  ) {
    this.#child = child;
    this.origin = `http://127.0.0.1:${port}`;
    this.#stdout = stdout;
    this.#stderr = stderr;
    this.#stdoutDone = stdoutDone;
    this.#stderrDone = stderrDone;
  }

  get stderr(): string {
    return this.#stderr.text;
  }

  get stdout(): string {
    return this.#stdout.text;
  }

  fetch(request: AppRequest): Promise<Response> {
    return globalThis.fetch(new URL(request.path, this.origin), {
      method: request.method ?? "GET",
      headers: request.headers,
      body: request.body,
      redirect: "manual",
    });
  }

  async [Symbol.asyncDispose](): Promise<void> {
    try {
      this.#child.kill("SIGTERM");
    } catch {
      // Process already exited.
    }
    const killTimer = setTimeout(() => {
      try {
        this.#child.kill("SIGKILL");
      } catch {
        // Process already exited.
      }
    }, KILL_WAIT_MS);
    try {
      await this.#child.status;
    } finally {
      clearTimeout(killTimer);
      await Promise.all([this.#stdoutDone, this.#stderrDone]);
    }
  }
}

async function waitUntilAccepting(app: App): Promise<void> {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  const probe = new URL("/__dashi_int_probe", app.origin);
  while (Date.now() < deadline) {
    try {
      const res = await globalThis.fetch(probe);
      await res.text();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));
    }
  }
  throw new Error(
    `app at ${app.origin} did not accept connections\nstderr:\n${app.stderr}\nstdout:\n${app.stdout}`,
  );
}

/** Spawn `mainPath` and wait until it accepts HTTP. */
export async function boot(mainPath: string | URL): Promise<App> {
  const spec = mainPath instanceof URL ? mainPath.href : mainPath;
  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", spec],
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
    env: {
      ...Deno.env.toObject(),
      DASHI_LOG: "error",
    },
  }).spawn();

  const stdout = { text: "" };
  const stderr = { text: "" };
  let found = false;
  let resolvePort: (port: number) => void = () => {};
  let rejectPort: (error: Error) => void = () => {};
  const portPromise = new Promise<number>((resolve, reject) => {
    resolvePort = resolve;
    rejectPort = reject;
  });
  portPromise.catch(() => {});

  const onText = (bag: { text: string }, chunk: string) => {
    bag.text += chunk;
    if (found) {
      return;
    }
    const match = bag.text.match(LISTEN_RE);
    if (match) {
      found = true;
      resolvePort(Number(match[1]));
    }
  };

  const stdoutDone = readStream(child.stdout, (chunk) => onText(stdout, chunk));
  const stderrDone = readStream(child.stderr, (chunk) => onText(stderr, chunk));

  child.status.then((status) => {
    if (!found) {
      rejectPort(
        new Error(
          `app exited with code ${status.code} before listening\nstderr:\n${stderr.text}\nstdout:\n${stdout.text}`,
        ),
      );
    }
  });

  try {
    const port = await withTimeout(
      portPromise,
      BOOT_TIMEOUT_MS,
      () =>
        new Error(
          `timed out waiting for listen line\nstderr:\n${stderr.text}\nstdout:\n${stdout.text}`,
        ),
    );
    const app = new App(child, port, stdout, stderr, stdoutDone, stderrDone);
    await waitUntilAccepting(app);
    return app;
  } catch (error) {
    try {
      child.kill("SIGKILL");
    } catch {
      // Process already exited.
    }
    await Promise.allSettled([child.status, stdoutDone, stderrDone]);
    throw error;
  }
}

export function formatIntegrationFailure(
  app: App,
  request: AppRequest,
  res: Response,
  body: string,
): string {
  const headers = [...res.headers.entries()]
    .map(([name, value]) => `  ${name}: ${value}`)
    .join("\n");
  return [
    `Integration case failed for ${request.method ?? "GET"} ${request.path}`,
    `status: ${res.status}`,
    `headers:\n${headers}`,
    `body:\n${body}`,
    `stderr:\n${app.stderr}`,
  ].join("\n");
}
