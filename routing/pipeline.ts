import {
  type CacheConfig,
  cacheControl,
  type CachedElement,
  CacheStrategy,
  mergeVary,
} from "../caching/mod.ts";
import { clientImportMap, getCompiledFile } from "../client/mod.ts";
import { type Element } from "../jsx-runtime/mod.ts";
import { error as logError, info } from "../logging/mod.ts";
import {
  type Ctx,
  DASHI_PREFIX,
  type Method,
  METHODS,
  REQUEST_HEADERS,
} from "../shared/mod.ts";
import {
  compile,
  type CompiledTable,
  group,
  type GroupBoundary,
  type GroupCallback,
  type GroupFields,
  match,
  type MatchedRoute,
  matchMiss,
} from "./table.ts";
import {
  appendModulePreloads,
  getRenderStore,
  injectModuleScripts,
  RenderKind,
  type RenderResult,
  renderWithRecovery,
  replaceFragmentSlots,
  runWithNestedRenderStore,
  runWithRenderStore,
} from "../ssr/mod.ts";

const DEFAULT_NOT_FOUND_BODY = "Not found";
const DEFAULT_ERROR_FALLBACK_BODY = "Something Went Wrong";
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

interface Executed {
  response: Response;
  html: string | null;
}

type RequestCtx = Ctx<Record<string, string>, Record<string, unknown>>;

function isMethod(method: string): method is Method {
  return (METHODS as readonly string[]).includes(method);
}

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

function lastResort(options: {
  isFragment: boolean;
  errorFallback: Element | Response | undefined;
}): Element | Response {
  if (options.isFragment) {
    return new Response("", { status: 500 });
  }
  if (options.errorFallback === undefined) {
    return new Response(DEFAULT_ERROR_FALLBACK_BODY, { status: 500 });
  }
  return options.errorFallback;
}

async function htmlResponse(
  out: Element | Response,
  options: {
    status: number;
    isFragment: boolean;
    req: Request;
    cache?: CacheConfig;
  },
): Promise<Executed> {
  if (out instanceof Response) {
    return { response: out, html: null };
  }
  const unspliced = String(out);
  let html = unspliced;
  const store = getRenderStore();
  // Nested eager SSR uses a synthetic request; splicing here would await
  // this fragment's own inflight promise.
  if (store.pageReq === options.req) {
    html = await replaceFragmentSlots(unspliced);
    if (!options.isFragment) {
      html = injectModuleScripts(html, store.clientEntries, clientImportMap());
    }
  }
  const body = options.isFragment ? html : `<!DOCTYPE html>${html}`;
  const bytes = new TextEncoder().encode(body);
  const res = new Response(bytes, { status: options.status });
  res.headers.set("Content-Type", "text/html");
  res.headers.set("Content-Length", String(bytes.byteLength));
  const cache = options.cache ?? { strategy: CacheStrategy.Private };
  res.headers.set("Cache-Control", cacheControl(cache));
  if (cache.vary) {
    mergeVary(res.headers, cache.vary);
  }
  if (options.isFragment && store.pageReq === options.req) {
    appendModulePreloads(res.headers, store.clientEntries, clientImportMap());
  }
  return { response: res, html: unspliced };
}

async function respond(
  result: RenderResult,
  options: { pageStatus: number; ctx: RequestCtx },
): Promise<Executed> {
  const { ctx } = options;
  switch (result.kind) {
    case RenderKind.Page:
      return await htmlResponse(result.page, {
        status: options.pageStatus,
        isFragment: ctx.isFragment,
        req: ctx.req,
        cache: result.cache,
      });
    case RenderKind.Recovered:
      return await htmlResponse(result.page, {
        status: 500,
        isFragment: ctx.isFragment,
        req: ctx.req,
        cache: result.cache,
      });
    case RenderKind.Response:
      return { response: result.response, html: null };
    case RenderKind.Exhausted:
      return await htmlResponse(
        lastResort({
          isFragment: ctx.isFragment,
          errorFallback: compiled.errorFallback,
        }),
        { status: 500, isFragment: ctx.isFragment, req: ctx.req },
      );
  }
}

async function runHandler(
  ctx: RequestCtx,
  matched: MatchedRoute<Record<string, unknown>>,
): Promise<Element | CachedElement | Response> {
  const method = ctx.req.method;
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { Allow: advertisedMethods(matched.handlers).join(", ") },
    });
  }
  let handler;
  if (method === "HEAD") {
    handler = matched.handlers.GET;
  } else if (isMethod(method) && method !== "HEAD" && method !== "OPTIONS") {
    handler = matched.handlers[method];
  }
  if (!handler) {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: advertisedMethods(matched.handlers).join(", ") },
    });
  }
  return await handler(ctx);
}

async function executeMatched(
  ctx: RequestCtx,
  matched: MatchedRoute<Record<string, unknown>>,
): Promise<Executed> {
  try {
    const out = await runHandler(ctx, matched);
    if (out instanceof Response) {
      return { response: out, html: null };
    }
    return await respond(
      await renderWithRecovery(out, { ctx, boundary: matched.boundary }),
      { pageStatus: 200, ctx },
    );
  } catch (thrown) {
    return await respond(
      await renderWithRecovery({ thrown }, { ctx, boundary: matched.boundary }),
      { pageStatus: 200, ctx },
    );
  }
}

async function executeNotFound(
  ctx: RequestCtx,
  boundary: GroupBoundary<Record<string, unknown>>,
): Promise<Executed> {
  if (ctx.isFragment) {
    return { response: new Response("", { status: 404 }), html: null };
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
    return {
      response: new Response(DEFAULT_NOT_FOUND_BODY, { status: 404 }),
      html: null,
    };
  }
  try {
    const out = await notFound(ctx);
    if (out instanceof Response) {
      return { response: out, html: null };
    }
    return await respond(
      await renderWithRecovery(out, { ctx, boundary }),
      { pageStatus: 404, ctx },
    );
  } catch (thrown) {
    return await respond(
      await renderWithRecovery({ thrown }, { ctx, boundary }),
      { pageStatus: 404, ctx },
    );
  }
}

async function runPipeline(
  ctx: RequestCtx,
  middleware: MatchedRoute<Record<string, unknown>>["middleware"],
  runTerminal: () => Promise<Executed>,
): Promise<Executed> {
  return await runWithNestedRenderStore(ctx.state, async () => {
    let html: string | null = null;
    let index = -1;
    const dispatch = async (i: number): Promise<Response> => {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      const mw = middleware[i];
      if (mw) {
        const res = await mw(ctx, () => dispatch(i + 1));
        return new Response(res.body, res);
      }
      const executed = await runTerminal();
      html = executed.html;
      return new Response(executed.response.body, executed.response);
    };
    const response = await dispatch(0);
    return { response, html };
  });
}

export async function runRoute(
  req: Request,
  options: {
    isFragment: boolean;
    state: Partial<Record<string, unknown>>;
    recoverMiss: boolean;
  },
): Promise<Executed | null> {
  const url = new URL(req.url);
  const matched = match(compiled, url.pathname);
  if (!matched) {
    if (!options.recoverMiss) {
      return null;
    }
    const miss = matchMiss(compiled, url.pathname);
    const ctx: RequestCtx = {
      req,
      url,
      params: miss.params,
      isFragment: options.isFragment,
      state: options.state,
    };
    return await runPipeline(
      ctx,
      miss.middleware,
      () => executeNotFound(ctx, miss.boundary),
    );
  }

  const ctx: RequestCtx = {
    req,
    url,
    params: matched.params,
    isFragment: options.isFragment,
    state: options.state,
  };
  return await runPipeline(
    ctx,
    matched.middleware,
    () => executeMatched(ctx, matched),
  );
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

function withCompiledClient<
  State extends Record<string, unknown>,
>(
  cb: GroupCallback<"", State>,
  fields: GroupFields<State>,
): GroupFields<State> {
  return {
    ...fields,
    routes: [
      cb.group(DASHI_PREFIX, ({ route }) => ({
        routes: [
          route("/client/:file*", { GET: getCompiledFile }),
          route("/:rest*", { GET: reservedNotFound }),
        ],
      })),
      ...fields.routes,
    ],
  };
}

export function init<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  build: (cb: GroupCallback<"", State>) => GroupFields<State>,
  errorFallback?: Element | Response,
) {
  // handle() has no State parameter. The table is only invoked with a ctx
  // whose state bag is the object the request created.
  compiled = compile(
    group((cb: GroupCallback<"", State>) => withCompiledClient(cb, build(cb))),
    errorFallback,
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
    info(`[ROUTE]      ${methods} ${r.path}`);
  }
}

export async function handle(
  req: Request,
) {
  const res = await runWithRenderStore(req, async () => {
    const isFragment = req.headers.has(REQUEST_HEADERS.FRAGMENT);
    try {
      const out = await runRoute(req, {
        isFragment,
        state: {},
        recoverMiss: true,
      });
      return out!.response;
    } catch (thrown) {
      logError(
        `[routing] handle recovering from: ${
          thrown instanceof Error ? thrown.message : thrown
        }`,
      );
      return (await htmlResponse(
        lastResort({
          isFragment,
          errorFallback: compiled.errorFallback,
        }),
        { status: 500, isFragment, req },
      )).response;
    }
  });
  if (req.method === "HEAD") {
    return await withoutContent(res);
  }
  return res;
}
