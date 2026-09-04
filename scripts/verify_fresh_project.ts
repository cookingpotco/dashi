#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-net
/**
 * Boots the README consumer in a temp directory until it listens.
 *
 * `--linked` resolves `jsr:@cookingpot/dashi@<version>` to this checkout
 * through `links`. `--registry` installs that version from JSR.
 *
 *   deno run -A scripts/verify_fresh_project.ts --linked
 *   deno run -A scripts/verify_fresh_project.ts --registry
 */

import denoJson from "../deno.json" with { type: "json" };

const LISTEN_RE = /Listening on https?:\/\/(?:\[[^\]]+\]|[\w.]+):(\d+)/;
const UNUSED_LINK_RE = /Linked package '[^']+' was not used[^\n]*/;
const BOOT_TIMEOUT_MS = 30_000;

const MAIN_TSX =
  `import { patch, RouteFragment, serve, type ReadArgs, type WriteArgs } from "dashi";

const todos: string[] = [];

function Home({ html }: ReadArgs) {
  return html(
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

function list({ html }: ReadArgs) {
  return html(<TodoList />);
}

async function create({ ctx, patches }: WriteArgs) {
  const title = (await ctx.req.formData()).get("title");
  if (typeof title !== "string" || title.trim() === "") {
    return patches([
      patch.replace("/todos", <TodoList error="title is required" />),
    ], { status: 422 });
  }
  todos.push(title);
  return patches([patch.replace("/todos", <TodoList />)]);
}

serve(({ route }) => ({
  routes: [
    route("/", { GET: Home }),
    route("/todos", { GET: list, POST: create }),
  ],
}));
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
    unstable: ["bundle", "no-legacy-abort"],
    imports: {
      dashi: `jsr:${name}@${version}`,
    },
  };
  if (checkout !== undefined) {
    config.links = [checkout];
  }
  return config;
}

function unusedLinkWarning(output: string): string | undefined {
  return output.match(UNUSED_LINK_RE)?.[0];
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

async function bootUntilListening(cwd: string): Promise<void> {
  const child = new Deno.Command(Deno.execPath(), {
    // --min-dep-age=0 because `--registry` runs against a version published
    // moments earlier, which the default 24h policy would refuse to resolve.
    args: ["run", "-A", "--min-dep-age=0", "main.tsx"],
    cwd,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  const stdout = { text: "" };
  const stderr = { text: "" };
  let settled = false;
  let resolveListen: () => void = () => {};
  let rejectListen: (error: Error) => void = () => {};
  const listenPromise = new Promise<void>((resolve, reject) => {
    resolveListen = resolve;
    rejectListen = reject;
  });
  listenPromise.catch(() => {});

  const onText = (bag: { text: string }, chunk: string) => {
    bag.text += chunk;
    if (!settled && LISTEN_RE.test(bag.text)) {
      settled = true;
      resolveListen();
    }
  };

  const stdoutDone = readStream(child.stdout, (chunk) => onText(stdout, chunk));
  const stderrDone = readStream(child.stderr, (chunk) => onText(stderr, chunk));

  child.status.then((status) => {
    if (!settled) {
      settled = true;
      const output = `stderr:\n${stderr.text}\nstdout:\n${stdout.text}`;
      const unused = unusedLinkWarning(`${stderr.text}\n${stdout.text}`);
      rejectListen(
        new Error(
          unused ??
            `consumer exited with code ${status.code} before listening\n${output}`,
        ),
      );
    }
  });

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      listenPromise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          settled = true;
          reject(
            new Error(
              `timed out waiting for listen line\nstderr:\n${stderr.text}\nstdout:\n${stdout.text}`,
            ),
          );
        }, BOOT_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
    try {
      child.kill("SIGTERM");
    } catch {
      // Process already exited.
    }
    await child.status;
    await Promise.all([stdoutDone, stderrDone]);
  }

  const unused = unusedLinkWarning(`${stderr.text}\n${stdout.text}`);
  if (unused !== undefined) {
    throw new Error(unused);
  }
}

async function main(): Promise<void> {
  const mode = parseMode(Deno.args);
  const root = Deno.realPathSync(`${import.meta.dirname}/..`);
  const { name, version } = denoJson;
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
    await bootUntilListening(dir);
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
