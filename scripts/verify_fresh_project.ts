#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-net --allow-env
/**
 * Boots the README consumer in a temp directory and asserts a lazy fragment
 * host rendered.
 *
 * `--linked` resolves `jsr:@cookingpot/dashi@<version>` to this checkout
 * through `links`. `--registry` installs that version from JSR.
 *
 *   deno run -A scripts/verify_fresh_project.ts --linked
 *   deno run -A scripts/verify_fresh_project.ts --registry
 */

const LISTEN_RE = /Listening on https?:\/\/(?:\[[^\]]+\]|[\w.]+):(\d+)\//;
const BOOT_TIMEOUT_MS = 30_000;
const REGISTRY_ATTEMPTS = 6;
const REGISTRY_RETRY_MS = 5_000;

const MAIN_TSX =
  `import { type Ctx, fragment, RouteFragment, serve } from "dashi";

const todos: string[] = [];

function Home() {
  return (
    <html>
      <h1>Todos</h1>
      <RouteFragment
        src="/todos"
        lazy
        fallback={<p>Loading…</p>}
      />
    </html>
  );
}

function TodoList({ error }: { error?: string }) {
  return (
    <div>
      <ul>
        {todos.map((todo) => <li>{todo}</li>)}
      </ul>
      {error ? <p>{error}</p> : null}
      <form method="POST" action="/todos">
        <input name="title" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

function list() {
  return <TodoList />;
}

async function create(ctx: Ctx) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return [
      fragment.replace("/todos", <TodoList error="title is required" />),
    ];
  }
  todos.push(title);
  return [fragment.replace("/todos", <TodoList />)];
}

serve(({ route }) => ({
  routes: [
    route("/", { GET: Home }),
    route("/todos", { GET: list, POST: create }),
  ],
}), { port: 0 });
`;

const enum Mode {
  Linked = "linked",
  Registry = "registry",
}

interface ConsumerConfig {
  compilerOptions: {
    jsx: string;
    jsxImportSource: string;
  };
  unstable: string[];
  imports: Record<string, string>;
  links?: string[];
}

function parseMode(args: string[]): Mode {
  const linked = args.includes("--linked");
  const registry = args.includes("--registry");
  if (linked === registry) {
    throw new Error("pass exactly one of --linked or --registry");
  }
  return linked ? Mode.Linked : Mode.Registry;
}

function readNameAndVersion(root: string): { name: string; version: string } {
  const parsed: unknown = JSON.parse(
    Deno.readTextFileSync(`${root}/deno.json`),
  );
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("name" in parsed) ||
    !("version" in parsed) ||
    typeof parsed.name !== "string" ||
    typeof parsed.version !== "string"
  ) {
    throw new Error(`${root}/deno.json is missing name or version`);
  }
  return { name: parsed.name, version: parsed.version };
}

function consumerConfig(
  name: string,
  version: string,
  checkout: string | undefined,
): ConsumerConfig {
  const config: ConsumerConfig = {
    compilerOptions: {
      jsx: "precompile",
      jsxImportSource: "dashi",
    },
    unstable: ["bundle"],
    imports: {
      dashi: `jsr:${name}@${version}`,
    },
  };
  if (checkout !== undefined) {
    config.links = [checkout];
  }
  return config;
}

async function runDeno(args: string[], cwd: string): Promise<number> {
  const output = await new Deno.Command(Deno.execPath(), {
    args,
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  return output.code;
}

async function checkConsumer(cwd: string, mode: Mode): Promise<void> {
  const attempts = mode === Mode.Registry ? REGISTRY_ATTEMPTS : 1;
  let lastCode = 1;
  for (let i = 0; i < attempts; i++) {
    if (i > 0) {
      console.error(
        `deno check failed; retrying in ${REGISTRY_RETRY_MS}ms ` +
          `(${i + 1}/${attempts})`,
      );
      await new Promise((resolve) => setTimeout(resolve, REGISTRY_RETRY_MS));
    }
    lastCode = await runDeno(["check", "main.tsx"], cwd);
    if (lastCode === 0) {
      return;
    }
  }
  throw new Error(`deno check failed with code ${lastCode}`);
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

async function serveAndAssert(cwd: string): Promise<void> {
  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "main.tsx"],
    cwd,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
    env: {
      ...Deno.env.toObject(),
      DASHI_LOG: "error",
      DASHI_MINIFY_CLIENT: "0",
    },
  }).spawn();

  const output = { text: "" };
  let found = false;
  let resolvePort: (port: number) => void = () => {};
  let rejectPort: (error: Error) => void = () => {};
  const portPromise = new Promise<number>((resolve, reject) => {
    resolvePort = resolve;
    rejectPort = reject;
  });
  portPromise.catch(() => {});

  const onText = (chunk: string) => {
    output.text += chunk;
    if (found) {
      return;
    }
    const match = output.text.match(LISTEN_RE);
    if (match) {
      found = true;
      resolvePort(Number(match[1]));
    }
  };

  const stdoutDone = readStream(child.stdout, onText);
  const stderrDone = readStream(child.stderr, onText);

  child.status.then((status) => {
    if (!found) {
      rejectPort(
        new Error(
          `app exited with code ${status.code} before listening\n${output.text}`,
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
          `timed out waiting for listen line\n${output.text}`,
        ),
    );
    await assertFreshPage(`http://127.0.0.1:${port}`);
  } catch (error) {
    console.error(output.text);
    throw error;
  } finally {
    try {
      child.kill("SIGTERM");
    } catch {
      // Process already exited.
    }
    await Promise.allSettled([child.status, stdoutDone, stderrDone]);
  }
}

function assertContains(haystack: string, needle: string, label: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(`${label} missing ${JSON.stringify(needle)}\n${haystack}`);
  }
}

async function assertFreshPage(origin: string): Promise<void> {
  const res = await fetch(origin);
  const html = await res.text();
  if (res.status !== 200) {
    throw new Error(`GET / returned ${res.status}\n${html}`);
  }
  assertContains(html, "<h1>Todos</h1>", "page");
  assertContains(html, "route-fragment", "page");
  assertContains(html, 'src="/todos"', "page");
  assertContains(html, "lazy", "page");
  assertContains(html, "Loading…", "page");
  assertContains(html, 'type="importmap"', "page");
  assertContains(html, "/_dashi/client/", "page");
  const src = html.match(
    /<script type="module" src="([^"]+)"><\/script>/,
  )?.[1];
  if (src === undefined) {
    throw new Error(`page missing module script\n${html}`);
  }
  const js = await fetch(new URL(src, origin));
  const body = await js.text();
  if (js.status !== 200) {
    throw new Error(`GET ${src} returned ${js.status}\n${body}`);
  }
  assertContains(body, "customElements.define", "compiled client");
  assertContains(body, "route-fragment", "compiled client");
}

async function main(): Promise<void> {
  const mode = parseMode(Deno.args);
  const root = Deno.realPathSync(`${import.meta.dirname}/..`);
  const { name, version } = readNameAndVersion(root);
  const dir = await Deno.makeTempDir({ prefix: "dashi-fresh-" });
  if (dir === root || dir.startsWith(`${root}/`)) {
    throw new Error(`temp dir ${dir} is inside the checkout`);
  }

  let passed = false;
  try {
    const config = consumerConfig(
      name,
      version,
      mode === Mode.Linked ? root : undefined,
    );
    await Deno.writeTextFile(
      `${dir}/deno.json`,
      `${JSON.stringify(config, null, 2)}\n`,
    );
    await Deno.writeTextFile(`${dir}/main.tsx`, MAIN_TSX);
    console.log(`${mode} consumer at ${dir} using ${name}@${version}`);
    await checkConsumer(dir, mode);
    await serveAndAssert(dir);
    passed = true;
  } finally {
    if (passed) {
      await Deno.remove(dir, { recursive: true });
    } else {
      console.error(`consumer left at ${dir}`);
    }
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}
