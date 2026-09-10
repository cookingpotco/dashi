import {
  applyVaryHeaders,
  type CacheConfig,
  cacheControl,
  CacheStrategy,
  mergeVary,
} from "../caching/mod.ts";
import {
  appendModulePreloads,
  clientImportMap,
  getClientCompileContext,
  getCompiledFile,
  injectModuleScripts,
  runWithClientCompileContext,
} from "../client/mod.ts";
import { renderPatches } from "../patching/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";
import { Logger } from "../logging/mod.ts";
import {
  type Ctx,
  DASHI_PREFIX,
  type Fatal,
  type GroupBoundary,
  type Method,
  METHODS,
  REQUEST_HEADERS,
  type SealHtml,
  type SealOptions,
  type SealPatches,
} from "../shared/mod.ts";
import {
  compile,
  type CompiledTable,
  group,
  type GroupCallback,
  type GroupFields,
  match,
  type MatchedRoute,
  matchMiss,
} from "./table.ts";
import { LayoutWalkError, walkLayouts } from "../ssr/mod.ts";

const DEFAULT_NOT_FOUND_BODY = "Not found";
const DEFAULT_FATAL_BODY = "Something Went Wrong";
const RESERVED_PATH =
  `${DASHI_PREFIX}/* is used by the framework for internal purposes, please use a different path.`;

function reservedNotFound(): Response {
  return new Response(DEFAULT_NOT_FOUND_BODY, { status: 404 });
}

let compiled: CompiledTable<Record<string, unknown>> = {
  staticByPath: new Map(),
  dynamic: [],
  rootBoundary: { layouts: [] },
  rootMiddleware: [],
  prefixCaptures: [],
};

type RequestCtx = Ctx<Record<string, unknown>, Record<string, string>>;

function advertisedMethods(
  handlers: { readonly [M in Exclude<Method, "HEAD" | "OPTIONS">]?: unknown },
): string[] {
  const listed: string[] = [];
  for (const method of METHODS) {
    if (method === "HEAD") {
      if (handlers.GET) {
        listed.push(method);
      }
      continue;
    }
    if (method === "OPTIONS") {
      listed.push(method);
      continue;
    }
    if (handlers[method]) {
      listed.push(method);
    }
  }
  return listed;
}

async function withoutContent(res: Response): Promise<Response> {
  const headers = new Headers(res.headers);
  if (res.body !== null) {
    if (headers.has("content-length")) {
      await res.body.cancel();
    } else {
      // Response.json and similar omit Content-Length; files and HTML
      // already set it.
      headers.set(
        "content-length",
        String((await res.arrayBuffer()).byteLength),
      );
    }
  }
  return new Response(null, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

function seal(
  page: Element,
  options: {
    status: number;
    isPartial: boolean;
    cache?: CacheConfig;
  },
): Response {
  const html = String(page);
  const { clientEntries } = getClientCompileContext();
  let body = html;
  if (!options.isPartial) {
    body = injectModuleScripts(html, clientEntries, clientImportMap());
  }
  const bytes = new TextEncoder().encode(
    options.isPartial ? body : `<!DOCTYPE html>${body}`,
  );
  const res = new Response(bytes, { status: options.status });
  res.headers.set("Content-Type", "text/html; charset=utf-8");
  res.headers.set("Content-Length", String(bytes.byteLength));
  const cache = options.cache ?? { strategy: CacheStrategy.NoStore };
  res.headers.set("Cache-Control", cacheControl(cache));
  mergeVary(res.headers, [REQUEST_HEADERS.SLOT]);
  applyVaryHeaders(res.headers, cache);
  if (options.isPartial) {
    appendModulePreloads(res.headers, clientEntries, clientImportMap());
  }
  return res;
}

function bindHtml(
  ctx: RequestCtx,
  boundary: GroupBoundary<Record<string, unknown>> | undefined,
  defaultStatus: number,
  isPartial: boolean,
): SealHtml {
  return async (page, opts?: SealOptions) => {
    const walked = isPartial ? page : await walkLayouts(page, ctx, boundary);
    return seal(walked, {
      status: opts?.status ?? defaultStatus,
      cache: opts?.cache,
      isPartial,
    });
  };
}

function bindPatches(): SealPatches {
  return (list, opts?: SealOptions) =>
    seal(renderPatches(list), {
      status: opts?.status ?? 200,
      cache: opts?.cache,
      isPartial: true,
    });
}

function bindFatalHtml(): SealHtml {
  return (page, opts?: SealOptions) =>
    seal(page, {
      status: opts?.status ?? 500,
      cache: opts?.cache,
      isPartial: false,
    });
}

async function lastResort(isPartial: boolean): Promise<Response> {
  if (isPartial) {
    return new Response("", { status: 500 });
  }
  if (compiled.fatal === undefined) {
    return new Response(DEFAULT_FATAL_BODY, { status: 500 });
  }
  try {
    return await compiled.fatal({ html: bindFatalHtml() });
  } catch (thrown) {
    Logger.error(["routing"], "fatal recovering from", thrown);
    return new Response(DEFAULT_FATAL_BODY, { status: 500 });
  }
}

async function recover(
  thrown: unknown,
  boundary: GroupBoundary<Record<string, unknown>> | undefined,
  ctx: RequestCtx,
  isPartial: boolean,
): Promise<Response> {
  if (thrown instanceof LayoutWalkError) {
    return await recover(thrown.cause, thrown.parent, ctx, isPartial);
  }
  Logger.error(["ssr"], "render recovering from", thrown);

  if (isPartial) {
    try {
      if (!boundary?.error) {
        return await lastResort(true);
      }
      return await boundary.error({
        ctx,
        thrown,
        html: bindHtml(ctx, boundary, 500, true),
      });
    } catch (nextThrown) {
      Logger.error(["ssr"], "render recovering from", nextThrown);
      return await lastResort(true);
    }
  }

  for (
    let current = boundary;
    current;
    current = current.parent
  ) {
    if (!current.error) {
      continue;
    }
    try {
      return await current.error({
        ctx,
        thrown,
        html: bindHtml(ctx, current, 500, false),
      });
    } catch (nextThrown) {
      if (nextThrown instanceof LayoutWalkError) {
        return await recover(nextThrown.cause, nextThrown.parent, ctx, false);
      }
      thrown = nextThrown;
      Logger.error(["ssr"], "render recovering from", thrown);
    }
  }

  return await lastResort(isPartial);
}

async function runHandler(
  ctx: RequestCtx,
  matched: MatchedRoute<Record<string, unknown>>,
  isPartial: boolean,
): Promise<Response> {
  const method = ctx.req.method;
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { Allow: advertisedMethods(matched.handlers).join(", ") },
    });
  }
  if (method === "GET" || method === "HEAD") {
    const handler = matched.handlers.GET;
    if (!handler) {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: advertisedMethods(matched.handlers).join(", ") },
      });
    }
    return await handler({
      ctx,
      html: bindHtml(ctx, matched.boundary, 200, isPartial),
    });
  }
  if (
    method === "POST" || method === "PUT" || method === "PATCH" ||
    method === "DELETE"
  ) {
    const handler = matched.handlers[method];
    if (!handler) {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: advertisedMethods(matched.handlers).join(", ") },
      });
    }
    return await handler({ ctx, patches: bindPatches() });
  }
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: advertisedMethods(matched.handlers).join(", ") },
  });
}

async function executeMatched(
  ctx: RequestCtx,
  matched: MatchedRoute<Record<string, unknown>>,
  isPartial: boolean,
): Promise<Response> {
  try {
    return await runHandler(ctx, matched, isPartial);
  } catch (thrown) {
    return await recover(thrown, matched.boundary, ctx, isPartial);
  }
}

async function executeNotFound(
  ctx: RequestCtx,
  boundary: GroupBoundary<Record<string, unknown>>,
  isPartial: boolean,
): Promise<Response> {
  if (isPartial) {
    return new Response("", { status: 404 });
  }
  let notFound;
  for (
    let current: GroupBoundary<Record<string, unknown>> | undefined = boundary;
    current;
    current = current.parent
  ) {
    if (current.notFound) {
      notFound = current.notFound;
      break;
    }
  }
  if (!notFound) {
    return new Response(DEFAULT_NOT_FOUND_BODY, { status: 404 });
  }
  try {
    return await notFound({
      ctx,
      html: bindHtml(ctx, boundary, 404, false),
    });
  } catch (thrown) {
    return await recover(thrown, boundary, ctx, false);
  }
}

async function runPipeline(
  ctx: RequestCtx,
  middleware: MatchedRoute<Record<string, unknown>>["middleware"],
  runTerminal: () => Promise<Response>,
): Promise<Response> {
  let index = -1;
  const dispatch = async (i: number): Promise<Response> => {
    if (i <= index) {
      throw new Error("next() called multiple times");
    }
    index = i;
    const mw = middleware[i];
    if (mw) {
      const res = await mw({ ctx, next: () => dispatch(i + 1) });
      return new Response(res.body, res);
    }
    const res = await runTerminal();
    return new Response(res.body, res);
  };
  return await dispatch(0);
}

function isFrameworkHandler(handler: unknown): boolean {
  return handler === getCompiledFile || handler === reservedNotFound;
}

function assertReservedClient(
  table: CompiledTable<Record<string, unknown>>,
): void {
  for (
    const route of [
      ...table.staticByPath.values(),
      ...table.dynamic,
    ]
  ) {
    if (
      !isFrameworkHandler(route.handlers.GET) &&
      (route.path === DASHI_PREFIX ||
        route.path.startsWith(`${DASHI_PREFIX}/`))
    ) {
      throw new Error(RESERVED_PATH);
    }
  }
  if (match(table, `${DASHI_PREFIX}/x`)?.handlers.GET !== reservedNotFound) {
    throw new Error(RESERVED_PATH);
  }
  if (
    match(table, `${DASHI_PREFIX}/client/x.js`)?.handlers.GET !==
      getCompiledFile
  ) {
    throw new Error(RESERVED_PATH);
  }
}

export function init<
  State extends Record<string, unknown> = Record<string, unknown>,
>(
  build: (cb: GroupCallback<"", State>) => GroupFields<State>,
  fatal?: Fatal,
) {
  // handle() has no State parameter. The table is only invoked with a ctx
  // whose state bag is the object the request created.
  compiled = compile(
    group((cb: GroupCallback<"", State>) => {
      const fields = build(cb);
      return {
        ...fields,
        routes: [
          group<State>(DASHI_PREFIX, ({ route }) => ({
            routes: [
              route("/client/:file*", { GET: getCompiledFile }),
              route("/:rest*", { GET: reservedNotFound }),
            ],
          })),
          ...fields.routes,
        ],
      };
    }),
    fatal,
  ) as CompiledTable<
    Record<string, unknown>
  >;
  assertReservedClient(compiled);
  const declared = [
    ...compiled.staticByPath.values(),
    ...compiled.dynamic,
  ].sort((a, b) => a.declarationIndex - b.declarationIndex);
  let prev = -1;
  for (const r of declared) {
    if (r.declarationIndex === prev) {
      continue;
    }
    prev = r.declarationIndex;
    const methods = advertisedMethods(r.handlers).join(",");
    Logger.info(["route"], `${methods} ${r.path}`);
  }
}

export async function handle(
  req: Request,
) {
  const isPartial = req.headers.has(REQUEST_HEADERS.SLOT);
  const res = await runWithClientCompileContext(async () => {
    try {
      const url = new URL(req.url);
      const matched = match(compiled, url.pathname);
      if (!matched) {
        const miss = matchMiss(compiled, url.pathname);
        const ctx: RequestCtx = {
          req,
          url,
          params: miss.params,
          state: {},
        };
        return await runPipeline(
          ctx,
          miss.middleware,
          () => executeNotFound(ctx, miss.boundary, isPartial),
        );
      }
      const ctx: RequestCtx = {
        req,
        url,
        params: matched.params,
        state: {},
      };
      return await runPipeline(
        ctx,
        matched.middleware,
        () => executeMatched(ctx, matched, isPartial),
      );
    } catch (thrown) {
      Logger.error(["routing"], "handle recovering from", thrown);
      return await lastResort(isPartial);
    }
  });
  if (req.method === "HEAD") {
    return await withoutContent(res);
  }
  return res;
}
