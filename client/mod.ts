import { type Element, jsx, jsxTemplate } from "../jsx-runtime/mod.ts";
import { error as logError } from "../logging/mod.ts";
import { type Ctx } from "../shared/mod.ts";
import { getRenderStore } from "../ssr/mod.ts";

/** Reserved group for framework-served URLs. */
export const DASHI_PREFIX = "/_dashi";

/** Reserved URL prefix for compiled client modules. */
export const CLIENT_PREFIX = `${DASHI_PREFIX}/client`;

const IMMUTABLE = "public, max-age=31536000, immutable";
const FACTORY_SCOPE =
  "call client.module / client.element at module scope, not inside a component or handler";

interface CompiledFile {
  bytes: Uint8Array<ArrayBuffer>;
  etag: string;
}

const registered = new Map<string, URL>();
const publicByHref = new Map<string, string>();
const compiledFiles = new Map<string, CompiledFile>();
let hasCompiled = false;

function assertCanRegister(): void {
  if (hasCompiled) {
    throw new Error(FACTORY_SCOPE);
  }
}

function recordEntry(href: string): void {
  const path = publicByHref.get(href);
  if (path === undefined) {
    throw new Error(`client module was not compiled: ${href}`);
  }
  getRenderStore().clientEntries.add(path);
}

/** Client script with no host element. Call at module scope. */
function module(url: URL): () => Element {
  assertCanRegister();
  registered.set(url.href, url);
  return () => {
    recordEntry(url.href);
    return jsxTemplate([""]);
  };
}

/** Custom element `tag` with a client script. Call at module scope. */
function element(
  tag: string,
  url: URL,
): (props?: Record<string, unknown>) => Element {
  assertCanRegister();
  registered.set(url.href, url);
  return (props?: Record<string, unknown>) => {
    recordEntry(url.href);
    return jsx(tag, props);
  };
}

export const client = { module, element };

function fileName(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? path : path.slice(slash + 1);
}

function jsPathname(url: URL): string {
  return url.pathname.replace(/\.tsx?$/, ".js");
}

function trailingMatchScore(left: string, right: string): number {
  const a = left.split("/").filter((part) => part.length > 0);
  const b = right.split("/").filter((part) => part.length > 0);
  let score = 0;
  while (
    score < a.length &&
    score < b.length &&
    a[a.length - 1 - score] === b[b.length - 1 - score]
  ) {
    score++;
  }
  return score;
}

// Deno.bundle names entries by source basename and keeps a directory only
// on collision. The result has no entry map, so match each factory URL to
// its output path by trailing segments.
function publicPathForEntry(url: URL, outputPaths: string[]): string {
  const want = jsPathname(url);
  let best: string | undefined;
  let bestScore = 0;
  for (const path of outputPaths) {
    const score = trailingMatchScore(want, path);
    if (score > bestScore) {
      bestScore = score;
      best = path;
    }
  }
  if (best === undefined || bestScore < 1) {
    throw new Error(`client bundle missing entry for ${url.href}`);
  }
  return best;
}

function formatBundleMessage(message: Deno.bundle.Message): string {
  if (!message.location) {
    return message.text;
  }
  return `${message.location.file}:${message.location.line}:${message.location.column}: ${message.text}`;
}

async function bundleRegistered(): Promise<void> {
  const urls = [...registered.values()];
  if (urls.length === 0) {
    return;
  }
  const result = await Deno.bundle({
    entrypoints: urls.map((url) => url.href),
    outputDir: CLIENT_PREFIX,
    platform: "browser",
    format: "esm",
    codeSplitting: true,
    write: false,
    keepNames: true,
    minify: false,
  });
  if (!result.success || result.errors.length > 0) {
    for (const message of result.errors) {
      logError(`[client] bundle: ${formatBundleMessage(message)}`);
    }
    throw new Error("client bundle failed");
  }
  const outputFiles = result.outputFiles ?? [];
  const outputPaths: string[] = [];
  for (const file of outputFiles) {
    const bytes = file.contents ?? new TextEncoder().encode(file.text());
    compiledFiles.set(file.path, {
      bytes,
      etag: `"${fileName(file.path)}"`,
    });
    outputPaths.push(file.path);
  }
  for (const url of urls) {
    publicByHref.set(url.href, publicPathForEntry(url, outputPaths));
  }
}

/** Compile every registered client URL, then mark the graph closed. */
export async function compileClient(): Promise<void> {
  try {
    await bundleRegistered();
  } catch (thrown) {
    logError(
      `[client] bundle failed: ${
        thrown instanceof Error ? thrown.message : thrown
      }`,
    );
    Deno.exit(1);
  } finally {
    hasCompiled = true;
  }
}

/** GET handler for `/_dashi/client/:file*`. Serves the in-memory bundle. */
export function getCompiledFile(
  ctx: Ctx<{ file: string }, Record<string, unknown>>,
): Response {
  const file = compiledFiles.get(`${CLIENT_PREFIX}/${ctx.params.file}`);
  if (!file) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(file.bytes, {
    status: 200,
    headers: {
      "Content-Type": "text/javascript",
      "Content-Length": String(file.bytes.byteLength),
      "Cache-Control": IMMUTABLE,
      ETag: file.etag,
    },
  });
}
