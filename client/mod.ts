import { type Element, jsx, jsxTemplate } from "../jsx-runtime/mod.ts";
import { Logger } from "../logging/mod.ts";
import { cacheControl, CacheStrategy } from "../caching/mod.ts";
import { DASHI_PREFIX, type ReadArgs } from "../shared/mod.ts";
import { getRenderStore, inRender } from "../ssr/mod.ts";

/** Reserved URL prefix for compiled client modules. */
const CLIENT_PREFIX = `${DASHI_PREFIX}/client`;

const FACTORY_SCOPE =
  "call client.module / client.element at module scope, not inside a component or handler";

interface CompiledFile {
  bytes: Uint8Array<ArrayBuffer>;
  etag: string;
}

interface NamedOutput {
  path: string;
  publicPath: string;
  text: string;
}

const registered = new Map<string, URL>();
const publicByHref = new Map<string, string>();
const compiledFiles = new Map<string, CompiledFile>();
const importMap: Record<string, string> = {};

function assertCanRegister(): void {
  if (inRender()) {
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
 * Register a client module. Renders nothing. Call at module scope.
 *
 * @param url Absolute source URL, typically `new URL("./x_client.ts", import.meta.url)`.
 *
 * @example
 * ```ts
 * const Clock = client.module(new URL("./clock_client.ts", import.meta.url));
 * ```
 */
function module(url: URL): () => Element {
  assertCanRegister();
  registered.set(url.href, url);
  return () => {
    recordEntry(url.href);
    return jsxTemplate([""]);
  };
}

/**
 * Register a custom element `tag` with a client module. Call at module scope.
 *
 * @param tag Custom element tag (kebab-case).
 * @param url Absolute source URL, typically `new URL("./x_client.ts", import.meta.url)`.
 *
 * @example
 * ```ts
 * const Panel = client.element(
 *   "x-panel",
 *   new URL("./panel_client.ts", import.meta.url),
 * );
 * ```
 */
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

/** Client module factory. Call `module` / `element` at module scope. */
export const client = { module, element };

// Deno.bundle names each output from the source specifier and has no
// entry map. Same-scheme graphs emit a short suffix of the path
// (`/_dashi/client/fragments/foo.js`). Mixed schemes encode the
// specifier (`/_dashi/client/https_/jsr.io/…/foo.js`,
// `/_dashi/client/file_/…/foo.js`). Match the longest short suffix of
// the source path, or the scheme-encoded name for that URL.
function outputPathForEntry(url: URL, outputPaths: string[]): string {
  const sourceJs = url.pathname.replace(/\.tsx?$/, ".js");
  const scheme = url.protocol.slice(0, -1);
  const encoded = url.host !== ""
    ? `/${scheme}_/${url.host}${sourceJs}`
    : `/${scheme}_${sourceJs}`;
  let best: string | undefined;
  let bestLen = 0;
  for (const path of outputPaths) {
    const rel = path.startsWith(`${CLIENT_PREFIX}/`)
      ? path.slice(CLIENT_PREFIX.length)
      : path;
    if ((sourceJs.endsWith(rel) || rel === encoded) && rel.length > bestLen) {
      best = path;
      bestLen = rel.length;
    }
  }
  if (best === undefined) {
    throw new Error(`client bundle missing entry for ${url.href}`);
  }
  return best;
}

function publicPathFor(bundlerPath: string, hash: string): string {
  const base = bundlerPath.split("/").pop() ?? bundlerPath;
  const stem = base.endsWith(".js") ? base.slice(0, -3) : base;
  const safe = hash.replaceAll("+", "-").replaceAll("/", "_").replaceAll(
    "=",
    "",
  );
  return `${CLIENT_PREFIX}/${stem}-${safe}.js`;
}

function resolveSpecifier(fromPath: string, spec: string): string {
  if (spec.startsWith("/")) {
    return spec;
  }
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

function rewriteRelativeImports(
  text: string,
  fromPath: string,
  outputPaths: Set<string>,
): string {
  return text.replace(
    /((?:from|import)\s*\(?\s*)(["'])(\.\.?\/[^"']+)\2/g,
    (full, prefix: string, quote: string, spec: string) => {
      const resolved = resolveSpecifier(fromPath, spec);
      if (!outputPaths.has(resolved)) {
        return full;
      }
      return `${prefix}${quote}${resolved}${quote}`;
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
      Logger.error(["client"], `bundle: ${formatBundleMessage(message)}`);
    }
    throw new Error("client bundle failed");
  }
  const outputFiles = result.outputFiles ?? [];
  const named: NamedOutput[] = [];
  for (const file of outputFiles) {
    if (!file.hash) {
      throw new Error(`client bundle missing hash for ${file.path}`);
    }
    named.push({
      path: file.path,
      publicPath: publicPathFor(file.path, file.hash),
      text: file.text(),
    });
  }
  const outputPaths = new Set(named.map((file) => file.path));
  const encoder = new TextEncoder();
  for (const file of named) {
    importMap[file.path] = file.publicPath;
    compiledFiles.set(file.publicPath, {
      bytes: encoder.encode(
        rewriteRelativeImports(file.text, file.path, outputPaths),
      ),
      etag: `"${file.publicPath.split("/").pop()}"`,
    });
  }
  for (const url of urls) {
    const original = outputPathForEntry(url, [...outputPaths]);
    const publicPath = importMap[original];
    if (publicPath === undefined) {
      throw new Error(`client bundle missing entry for ${url.href}`);
    }
    publicByHref.set(url.href, publicPath);
  }
}

/** Bundler path → flat hashed public path. Empty until compile. */
export function clientImportMap(): Record<string, string> {
  return importMap;
}

/** Compile every registered client URL. */
export async function compileClient(): Promise<void> {
  try {
    await bundleRegistered();
  } catch (thrown) {
    Logger.error(["client"], "bundle failed", thrown);
    throw thrown instanceof Error ? thrown : new Error("client bundle failed");
  }
}

/** GET handler for `/_dashi/client/:file*`. Serves the in-memory bundle. */
export function getCompiledFile(
  { ctx }: ReadArgs<{ file: string }, Record<string, unknown>>,
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
      "Cache-Control": cacheControl({ strategy: CacheStrategy.Immutable }),
      ETag: file.etag,
    },
  });
}
