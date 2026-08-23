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
const RESERVED_PATH =
  `${DASHI_PREFIX}/* is used by the framework for internal purposes, please use a different path.`;

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

/** Register a client module. Renders nothing. Call at module scope. */
function module(url: URL): () => Element {
  assertCanRegister();
  registered.set(url.href, url);
  return () => {
    recordEntry(url.href);
    return jsxTemplate([""]);
  };
}

/** Register a custom element `tag` with a client module. Call at module scope. */
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

// Deno.bundle names entries from the source path (basename, or more
// directories on collision) and has no entry map. The factory URL is the
// absolute source path; the output path is a suffix of that path with .js.
function outputPathForEntry(url: URL, outputPaths: string[]): string {
  const sourceJs = url.pathname.replace(/\.tsx?$/, ".js");
  let best: string | undefined;
  let bestLen = 0;
  for (const path of outputPaths) {
    const rel = path.startsWith(`${CLIENT_PREFIX}/`)
      ? path.slice(CLIENT_PREFIX.length)
      : path;
    if (sourceJs.endsWith(rel) && rel.length > bestLen) {
      best = path;
      bestLen = rel.length;
    }
  }
  if (best === undefined) {
    throw new Error(`client bundle missing entry for ${url.href}`);
  }
  return best;
}

function publicFileName(path: string, hash: string): string {
  const base = path.split("/").filter((part) => part.length > 0).pop() ??
    "chunk.js";
  const stem = base.replace(/\.js$/, "");
  const safe = hash.replaceAll("+", "-").replaceAll("/", "_").replaceAll(
    "=",
    "",
  );
  return `${stem}-${safe}.js`;
}

function resolveSpecifier(fromPath: string, spec: string): string {
  const parts = fromPath.split("/").slice(0, -1);
  for (const part of spec.split("/")) {
    if (part === "." || part === "") {
      continue;
    }
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

function rewriteLocalImports(
  text: string,
  fromPath: string,
  publicByPath: Map<string, string>,
): string {
  return text.replace(
    /((?:from|import)\s*\(?\s*)(["'])(\.\.?\/[^"']+)\2/g,
    (full, prefix, quote, spec) => {
      const publicName = publicByPath.get(resolveSpecifier(fromPath, spec));
      if (publicName === undefined) {
        return full;
      }
      return `${prefix}${quote}./${publicName}${quote}`;
    },
  );
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
  const minifyEnv = Deno.env.get("DASHI_MINIFY_CLIENT");
  const minify = minifyEnv === "1" || minifyEnv === "true";
  const result = await Deno.bundle({
    entrypoints: urls.map((url) => url.href),
    outputDir: CLIENT_PREFIX,
    platform: "browser",
    format: "esm",
    codeSplitting: true,
    write: false,
    keepNames: !minify,
    minify,
  });
  if (!result.success || result.errors.length > 0) {
    for (const message of result.errors) {
      logError(`[client] bundle: ${formatBundleMessage(message)}`);
    }
    throw new Error("client bundle failed");
  }
  const outputFiles = result.outputFiles ?? [];
  const named = outputFiles.map((file) => {
    if (!file.hash) {
      throw new Error(`client bundle missing hash for ${file.path}`);
    }
    return {
      path: file.path,
      publicName: publicFileName(file.path, file.hash),
      text: file.text(),
    };
  });
  const outputPaths = named.map((file) => file.path);
  const publicByPath = new Map(
    named.map((file) => [file.path, file.publicName]),
  );
  const originalToPublic = new Map<string, string>();
  for (const file of named) {
    const publicPath = `${CLIENT_PREFIX}/${file.publicName}`;
    originalToPublic.set(file.path, publicPath);
    const bytes = new TextEncoder().encode(
      rewriteLocalImports(file.text, file.path, publicByPath),
    );
    compiledFiles.set(publicPath, {
      bytes,
      etag: `"${file.publicName}"`,
    });
  }
  for (const url of urls) {
    const original = outputPathForEntry(url, outputPaths);
    const publicPath = originalToPublic.get(original);
    if (publicPath === undefined) {
      throw new Error(`client bundle missing entry for ${url.href}`);
    }
    publicByHref.set(url.href, publicPath);
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

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

/** GET handler for `/_dashi/client/:file*`. Serves the in-memory bundle. */
export function getCompiledFile(
  ctx: Ctx<{ file: string }, Record<string, unknown>>,
): Response {
  const file = compiledFiles.get(`${CLIENT_PREFIX}/${ctx.params.file}`);
  if (!file) {
    return notFound();
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

/** GET handler for other `/_dashi/:rest*` paths. */
export function reservedNotFound(): Response {
  return notFound();
}

export function isReservedPath(path: string): boolean {
  return path === DASHI_PREFIX || path.startsWith(`${DASHI_PREFIX}/`);
}

export function reservedPathError(): Error {
  return new Error(RESERVED_PATH);
}
