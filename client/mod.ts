import { type Element, jsx, jsxTemplate } from "../jsx-runtime/mod.ts";
import { error as logError } from "../logging/mod.ts";
import { getRenderStore, hasRenderStore } from "../ssr/mod.ts";

/** Reserved URL prefix for compiled client modules. */
export const CLIENT_PREFIX = "/_dashi/client";

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
let compiled = false;

function assertCanRegister(): void {
  if (compiled || hasRenderStore()) {
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

/**
 * Registers `url` for compile and returns a component that emits no host.
 * Call at module scope.
 */
export function module(url: URL): () => Element {
  assertCanRegister();
  registered.set(url.href, url);
  return function ClientModule() {
    recordEntry(url.href);
    return jsxTemplate([""]);
  };
}

/**
 * Registers `url` for compile and returns a component that emits `tag`.
 * Call at module scope.
 */
export function element(
  tag: string,
  url: URL,
): (props?: Record<string, unknown>) => Element {
  assertCanRegister();
  registered.set(url.href, url);
  return function ClientElement(props?: Record<string, unknown>) {
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
  if (registered.size === 0) {
    return;
  }
  const entrypoints = [...registered.values()].map((url) => url.href);
  const result = await Deno.bundle({
    entrypoints,
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
  for (const url of registered.values()) {
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
    compiled = true;
  }
}

/**
 * Serves `/_dashi/client/…` from the in-memory bundle. `null` if the
 * request is not under that prefix.
 */
export function handleCompiledClient(req: Request): Response | null {
  const path = new URL(req.url).pathname;
  if (path !== CLIENT_PREFIX && !path.startsWith(`${CLIENT_PREFIX}/`)) {
    return null;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }
  const file = compiledFiles.get(path);
  if (!file) {
    return new Response("Not found", { status: 404 });
  }
  const headers = {
    "Content-Type": "text/javascript",
    "Content-Length": String(file.bytes.byteLength),
    "Cache-Control": IMMUTABLE,
    ETag: file.etag,
  };
  if (req.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(file.bytes, { status: 200, headers });
}

/** Document include: one module script per recorded entry. */
export function injectModuleScripts(
  html: string,
  entries: Iterable<string>,
): string {
  const scripts = [...entries].map((src) =>
    String(jsx("script", { type: "module", src }))
  ).join("");
  if (scripts === "") {
    return html;
  }
  const close = html.lastIndexOf("</html>");
  if (close === -1) {
    return `${html}${scripts}`;
  }
  return `${html.slice(0, close)}${scripts}${html.slice(close)}`;
}

/** Fragment include: `Link` names each recorded entry. */
export function appendModulePreloads(
  headers: Headers,
  entries: Iterable<string>,
): void {
  for (const src of entries) {
    headers.append("Link", `<${src}>; rel="modulepreload"`);
  }
}
