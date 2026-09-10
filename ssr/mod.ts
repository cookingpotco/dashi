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
  injectModuleScripts,
} from "../client/mod.ts";
import { renderPatches } from "../patching/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";
import { Logger } from "../logging/mod.ts";
import {
  type Ctx,
  type Fatal,
  type GroupBoundary,
  REQUEST_HEADERS,
  type SealHtml,
  type SealOptions,
  type SealPatches,
  type SealPatchesOptions,
} from "../shared/mod.ts";

const DEFAULT_NOT_FOUND_BODY = "Not found";
const DEFAULT_FATAL_BODY = "Something Went Wrong";

type RequestCtx = Ctx<Record<string, unknown>, Record<string, string>>;

/**
 * Layout walk failed. `cause` is the thrown value. `parent` is the
 * enclosing group: a group's `error` does not catch that group's own
 * layouts.
 */
/** @internal */
export class LayoutWalkError extends Error {
  readonly parent?: GroupBoundary<Record<string, unknown>>;
  constructor(
    thrown: unknown,
    parent?: GroupBoundary<Record<string, unknown>>,
  ) {
    super("layout walk failed", { cause: thrown });
    this.parent = parent;
  }
}

/**
 * Wraps `page` in each group's layouts, innermost first. A group's
 * `error` does not catch that group's own layouts; the throw carries
 * the parent boundary.
 */
export async function walkLayouts(
  page: Element,
  ctx: RequestCtx,
  boundary: GroupBoundary<Record<string, unknown>> | undefined,
): Promise<Element> {
  let rendered = page;
  for (let current = boundary; current; current = current.parent) {
    try {
      let wrapped = rendered;
      for (let i = current.layouts.length - 1; i >= 0; i--) {
        wrapped = await current.layouts[i]!({ ctx, children: wrapped });
      }
      rendered = wrapped;
    } catch (thrown) {
      throw new LayoutWalkError(thrown, current.parent);
    }
  }
  return rendered;
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

export function bindHtml(
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

export function bindPatches(): SealPatches {
  return (list, opts?: SealPatchesOptions) =>
    seal(renderPatches(list), {
      status: opts?.status ?? 200,
      isPartial: true,
    });
}

export function bindFatalHtml(): SealHtml {
  return (page, opts?: SealOptions) =>
    seal(page, {
      status: opts?.status ?? 500,
      cache: opts?.cache,
      isPartial: false,
    });
}

export async function lastResort(
  fatal: Fatal | undefined,
  isPartial: boolean,
): Promise<Response> {
  if (isPartial) {
    return new Response("", { status: 500 });
  }
  if (fatal === undefined) {
    return new Response(DEFAULT_FATAL_BODY, { status: 500 });
  }
  try {
    return await fatal({ html: bindFatalHtml() });
  } catch (thrown) {
    Logger.error(["routing"], "fatal recovering from", thrown);
    return new Response(DEFAULT_FATAL_BODY, { status: 500 });
  }
}

export async function recover(
  thrown: unknown,
  boundary: GroupBoundary<Record<string, unknown>> | undefined,
  ctx: RequestCtx,
  isPartial: boolean,
  fatal: Fatal | undefined,
): Promise<Response> {
  if (thrown instanceof LayoutWalkError) {
    return await recover(thrown.cause, thrown.parent, ctx, isPartial, fatal);
  }
  Logger.error(["ssr"], "render recovering from", thrown);

  if (isPartial) {
    try {
      if (!boundary?.error) {
        return await lastResort(fatal, true);
      }
      return await boundary.error({
        ctx,
        thrown,
        html: bindHtml(ctx, boundary, 500, true),
      });
    } catch (nextThrown) {
      Logger.error(["ssr"], "render recovering from", nextThrown);
      return await lastResort(fatal, true);
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
        return await recover(
          nextThrown.cause,
          nextThrown.parent,
          ctx,
          false,
          fatal,
        );
      }
      thrown = nextThrown;
      Logger.error(["ssr"], "render recovering from", thrown);
    }
  }

  return await lastResort(fatal, isPartial);
}

export async function executeNotFound(
  ctx: RequestCtx,
  boundary: GroupBoundary<Record<string, unknown>>,
  isPartial: boolean,
  fatal: Fatal | undefined,
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
    return await recover(thrown, boundary, ctx, false, fatal);
  }
}
