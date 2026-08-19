import { type Ctx } from "../shared/shared_types.ts";

const NOT_FOUND_BODY = "Not found";

const TYPES: Record<string, Lowercase<string>> = {
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  ico: "image/x-icon",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  map: "application/json",
  txt: "text/plain",
  html: "text/html",
  htm: "text/html",
  wasm: "application/wasm",
  xml: "application/xml",
  webmanifest: "application/manifest+json",
};

const FINGERPRINT_RE = /[0-9a-f]{8,}/i;

function basename(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? path : path.slice(slash + 1);
}

function contentType(path: string): string {
  const base = basename(path);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return "application/octet-stream";
  }
  return TYPES[base.slice(dot + 1).toLowerCase()] ??
    "application/octet-stream";
}

function isFingerprinted(path: string): boolean {
  return FINGERPRINT_RE.test(basename(path));
}

function etag(size: number, mtimeMs: number): string {
  return `W/"${size}-${mtimeMs}"`;
}

function etagMatches(header: string | null, tag: string): boolean {
  if (header === null) {
    return false;
  }
  for (const part of header.split(",")) {
    const candidate = part.trim();
    if (candidate === "*" || candidate === tag) {
      return true;
    }
  }
  return false;
}

function decodeRelative(relative: string): string | null {
  if (relative.includes("\0")) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(relative);
    if (decoded.includes("\0") || decoded === "") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function isInsideRoot(root: string, resolved: string): boolean {
  return resolved === root || resolved.startsWith(`${root}/`);
}

function notFound(method: string): Response {
  if (method === "HEAD") {
    return new Response(null, {
      status: 404,
      headers: { "Content-Length": String(NOT_FOUND_BODY.length) },
    });
  }
  return new Response(NOT_FOUND_BODY, { status: 404 });
}

async function realPath(path: string): Promise<string | null> {
  try {
    return await Deno.realPath(path);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return null;
    }
    throw error;
  }
}

/**
 * GET streams the file; HEAD returns the same headers with an empty body.
 *
 * @param ctx Method and `If-None-Match` come from `ctx.req`.
 * @param dir Directory to read from. Relative paths resolve against
 *   `Deno.cwd()`; pass `${import.meta.dirname}/static` so the folder
 *   travels with the module.
 * @param relative Path under `dir`, typically a catch-all route param.
 */
export async function staticFile(
  ctx: Ctx<Record<string, string>, Record<string, unknown>>,
  dir: string,
  relative: string,
): Promise<Response> {
  const method = ctx.req.method;
  const decoded = decodeRelative(relative);
  if (decoded === null) {
    return notFound(method);
  }

  const root = await realPath(dir);
  if (root === null) {
    return notFound(method);
  }

  const resolved = await realPath(`${root}/${decoded}`);
  if (resolved === null || !isInsideRoot(root, resolved)) {
    return notFound(method);
  }

  let info: Deno.FileInfo;
  try {
    info = await Deno.stat(resolved);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return notFound(method);
    }
    throw error;
  }
  if (!info.isFile) {
    return notFound(method);
  }

  const tag = etag(info.size, info.mtime?.getTime() ?? 0);
  const cacheControl = isFingerprinted(decoded)
    ? "public, max-age=31536000, immutable"
    : "no-cache";

  if (etagMatches(ctx.req.headers.get("if-none-match"), tag)) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: tag,
        "Cache-Control": cacheControl,
      },
    });
  }

  const headers = {
    "Content-Type": contentType(decoded),
    "Content-Length": String(info.size),
    ETag: tag,
    "Cache-Control": cacheControl,
  };

  if (method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  try {
    const file = await Deno.open(resolved, { read: true });
    return new Response(file.readable, { status: 200, headers });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return notFound(method);
    }
    throw error;
  }
}
