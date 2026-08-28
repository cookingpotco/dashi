const BOOT_TIMEOUT_MS = 15_000;
const READY_POLL_MS = 25;

Deno.env.set("DASHI_LOG", "error");
Deno.env.set("DASHI_MINIFY_CLIENT", "0");

export interface AppRequest {
  method?: string;
  path: string;
  headers?: Record<string, string>;
  body?: string | URLSearchParams | FormData;
}

const consoleMethods = ["debug", "info", "warn", "error"] as const;
type ConsoleMethod = typeof consoleMethods[number];

const originalConsole: Record<
  ConsoleMethod,
  (...args: unknown[]) => void
> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

const stderrBuffers = new Set<{ text: string }>();
let consolePatched = false;

function formatConsoleArgs(args: unknown[]): string {
  return args.map((arg) => typeof arg === "string" ? arg : Deno.inspect(arg))
    .join(" ");
}

function patchConsole(): void {
  if (consolePatched) {
    return;
  }
  consolePatched = true;
  for (const method of consoleMethods) {
    console[method] = (...args: unknown[]) => {
      const line = `${formatConsoleArgs(args)}\n`;
      for (const buffer of stderrBuffers) {
        buffer.text += line;
      }
      originalConsole[method](...args);
    };
  }
}

function unpatchConsole(): void {
  if (stderrBuffers.size > 0 || !consolePatched) {
    return;
  }
  consolePatched = false;
  for (const method of consoleMethods) {
    console[method] = originalConsole[method];
  }
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

function originOf(server: Deno.HttpServer): string {
  const addr = server.addr;
  if (addr.transport !== "tcp") {
    throw new Error(`expected TCP server, got ${addr.transport}`);
  }
  return `http://127.0.0.1:${addr.port}`;
}

/** In-process app from `serve()`, listening on an ephemeral port. */
export class App implements AsyncDisposable {
  readonly origin: string;
  #server: Deno.HttpServer;
  #stderr: { text: string };

  constructor(server: Deno.HttpServer, stderr: { text: string }) {
    this.#server = server;
    this.origin = originOf(server);
    this.#stderr = stderr;
  }

  get stderr(): string {
    return this.#stderr.text;
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
      await this.#server.shutdown();
    } finally {
      stderrBuffers.delete(this.#stderr);
      unpatchConsole();
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
    `app at ${app.origin} did not accept connections\nstderr:\n${app.stderr}`,
  );
}

/** Call fixture `start()`, attach stderr capture, wait until it accepts HTTP. */
export async function boot(
  start: () => Promise<Deno.HttpServer> | Deno.HttpServer,
): Promise<App> {
  const stderr = { text: "" };
  patchConsole();
  stderrBuffers.add(stderr);
  try {
    const server = await withTimeout(
      Promise.resolve(start()),
      BOOT_TIMEOUT_MS,
      () =>
        new Error(
          `timed out waiting for serve()\nstderr:\n${stderr.text}`,
        ),
    );
    const app = new App(server, stderr);
    await waitUntilAccepting(app);
    return app;
  } catch (error) {
    stderrBuffers.delete(stderr);
    unpatchConsole();
    throw error;
  }
}
