import { type Element, jsx, jsxTemplate } from "../jsx-runtime/mod.ts";
import { error as logError } from "../logging/mod.ts";
import { type Ctx, DASHI_PREFIX } from "../shared/mod.ts";
import { getRenderStore } from "../ssr/mod.ts";

/** Reserved URL prefix for compiled client modules. */
const CLIENT_PREFIX = `${DASHI_PREFIX}/client`;

const IMMUTABLE = "public, max-age=31536000, immutable";
const FACTORY_SCOPE =
  "call client.module / client.element at module scope, not inside a component or handler";

interface CompiledFile {
  bytes: Uint8Array<ArrayBuffer>;
  etag: string;
}

interface BundleOutput {
  bundlerPath: string;
  publicPath: string;
}

const registered = new Map<string, URL>();
const publicByHref = new Map<string, string>();
const compiledFiles = new Map<string, CompiledFile>();
const importMap: Record<string, string> = {};
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

function publicPathFor(bundlerPath: string, hash: string): string {
  const base = bundlerPath.split("/").pop() ?? bundlerPath;
  const stem = base.endsWith(".js") ? base.slice(0, -3) : base;
  const safe = hash.replaceAll("+", "-").replaceAll("/", "_").replaceAll(
    "=",
    "",
  );
  return `${CLIENT_PREFIX}/${stem}-${safe}.js`;
}

function relativeSpecifier(fromPath: string, toPath: string): string {
  const fromDir = fromPath.slice(0, fromPath.lastIndexOf("/") + 1);
  const fromSegs = fromDir.split("/").filter((s) => s !== "");
  const toSegs = toPath.split("/").filter((s) => s !== "");
  let i = 0;
  while (
    i < fromSegs.length && i < toSegs.length && fromSegs[i] === toSegs[i]
  ) {
    i += 1;
  }
  const downs = toSegs.slice(i);
  return [...Array.from({ length: fromSegs.length - i }, () => ".."), ...downs]
    .join("/");
}

function resolveSpecifier(fromPath: string, specifier: string): string {
  if (specifier.startsWith("/")) {
    return specifier;
  }
  const fromDir = fromPath.slice(0, fromPath.lastIndexOf("/") + 1);
  const out: string[] = [];
  for (const part of [...fromDir.split("/"), ...specifier.split("/")]) {
    if (part === "" || part === ".") {
      continue;
    }
    if (part === "..") {
      out.pop();
      continue;
    }
    out.push(part);
  }
  return `/${out.join("/")}`;
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
  const files: BundleOutput[] = [];
  const encoder = new TextEncoder();
  for (const file of outputFiles) {
    if (!file.hash) {
      throw new Error(`client bundle missing hash for ${file.path}`);
    }
    const publicPath = publicPathFor(file.path, file.hash);
    files.push({ bundlerPath: file.path, publicPath });
    importMap[file.path] = publicPath;
    compiledFiles.set(publicPath, {
      bytes: encoder.encode(file.text()),
      etag: `"${publicPath.split("/").pop()}"`,
    });
  }
  for (const from of files) {
    for (const to of files) {
      if (from === to) {
        continue;
      }
      const resolved = resolveSpecifier(
        from.publicPath,
        relativeSpecifier(from.bundlerPath, to.bundlerPath),
      );
      importMap[resolved] = to.publicPath;
    }
  }
  const outputPaths = files.map((file) => file.bundlerPath);
  for (const url of urls) {
    const original = outputPathForEntry(url, outputPaths);
    const publicPath = importMap[original];
    if (publicPath === undefined) {
      throw new Error(`client bundle missing entry for ${url.href}`);
    }
    publicByHref.set(url.href, publicPath);
  }
}

/** Specifier → flat hashed public path. Empty until compile. */
export function clientImportMap(): Record<string, string> {
  return importMap;
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
