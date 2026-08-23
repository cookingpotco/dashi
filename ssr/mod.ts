import { AsyncLocalStorage } from "node:async_hooks";
import {
  type CacheConfig,
  type CachedElement,
  isCachedElement,
} from "../caching/mod.ts";
import { type Element, jsx } from "../jsx-runtime/mod.ts";
import { error as logError } from "../logging/mod.ts";
import {
  type Ctx,
  type ErrorHandler,
  type Layout,
} from "../shared/mod.ts";

interface RenderStore {
  pageReq: Request;
  inflightFragments: Map<string, Promise<string | null>>;
  clientEntries: Set<string>;
  currentState: Partial<Record<string, unknown>>;
}

const als = new AsyncLocalStorage<RenderStore>();

export function runWithRenderStore<T>(req: Request, fn: () => T): T {
  return als.run({
    pageReq: req,
    inflightFragments: new Map(),
    clientEntries: new Set(),
    currentState: {},
  }, fn);
}

export function runWithNestedRenderStore<T>(
  currentState: Partial<Record<string, unknown>>,
  fn: () => T,
): T {
  const parent = getRenderStore();
  return als.run({
    pageReq: parent.pageReq,
    inflightFragments: parent.inflightFragments,
    clientEntries: parent.clientEntries,
    currentState,
  }, fn);
}

export function getRenderStore(): RenderStore {
  const store = als.getStore();
  if (!store) {
    throw new Error("getRenderStore() was called outside a handle() render");
  }
  return store;
}

/** Document include: the compile import map, then one module script per entry. */
export function injectModuleScripts(
  html: string,
  entries: Iterable<string>,
  importMap: Record<string, string>,
): string {
  const tags: string[] = [];
  if (Object.keys(importMap).length > 0) {
    tags.push(String(jsx("script", {
      type: "importmap",
      dangerouslySetInnerHTML: {
        __html: JSON.stringify({ imports: importMap }),
      },
    })));
  }
  for (const src of entries) {
    tags.push(String(jsx("script", { type: "module", src })));
  }
  const scripts = tags.join("");
  if (scripts === "") {
    return html;
  }
  const close = html.lastIndexOf("</html>");
  if (close === -1) {
    return `${html}${scripts}`;
  }
  return `${html.slice(0, close)}${scripts}${html.slice(close)}`;
}

/** Fragment include: `Link` names each recorded entry’s hashed URL. */
export function appendModulePreloads(
  headers: Headers,
  entries: Iterable<string>,
  importMap: Record<string, string>,
): void {
  for (const src of entries) {
    const href = importMap[src] ?? src;
    headers.append("Link", `<${href}>; rel="modulepreload"`);
  }
}

interface Boundary<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  layouts: Layout<State>[];
  error?: ErrorHandler<State>;
  parent?: Boundary<State>;
}

export const enum RenderKind {
  Page = "page",
  Recovered = "recovered",
  Response = "response",
  Exhausted = "exhausted",
}

export type RenderResult =
  | { kind: RenderKind.Page; page: Element; cache?: CacheConfig }
  | { kind: RenderKind.Recovered; page: Element; cache?: CacheConfig }
  | { kind: RenderKind.Response; response: Response }
  | { kind: RenderKind.Exhausted };

function takeCached(
  out: Element | CachedElement,
  collected: CacheConfig | undefined,
): { page: Element; cache: CacheConfig | undefined } {
  if (isCachedElement(out)) {
    return { page: out.page, cache: collected ?? out.cache };
  }
  return { page: out, cache: collected };
}

/**
 * Wraps `page` in each group's layouts (innermost first) and recovers
 * through `error` when something throws. Fragments skip layouts. A
 * group's `error` does not catch that group's own layouts; recovery
 * starts at the parent. Document recovery walks the chain and wraps
 * error JSX in remaining layouts. Fragment recovery only tries the
 * current boundary's `error`.
 *
 * Pass `{ thrown }` to recover a handler throw from `boundary` without
 * wrapping a page.
 */
export async function renderWithRecovery<
  State extends Record<string, unknown> = Record<string, unknown>,
>(
  page: Element | CachedElement | { thrown: unknown },
  options: {
    ctx: Ctx<Record<string, string>, State>;
    boundary?: Boundary<State>;
  },
): Promise<RenderResult> {
  // Element is a String object at runtime, so `typeof` is `"object"`.
  if (typeof page === "object" && "thrown" in page && !isCachedElement(page)) {
    return await recover(page.thrown, options.boundary, options.ctx);
  }
  const wrapped = await wrapBoundaries(page, options.ctx, options.boundary);
  if (wrapped.ok) {
    return {
      kind: RenderKind.Page,
      page: wrapped.page,
      cache: wrapped.cache,
    };
  }
  return await recover(wrapped.thrown, wrapped.parent, options.ctx);
}

async function wrapBoundaries<
  State extends Record<string, unknown>,
>(
  page: Element | CachedElement,
  ctx: Ctx<Record<string, string>, State>,
  boundary: Boundary<State> | undefined,
): Promise<
  | { ok: true; page: Element; cache?: CacheConfig }
  | { ok: false; thrown: unknown; parent?: Boundary<State> }
> {
  const first = takeCached(page, undefined);
  let rendered = first.page;
  let cache = first.cache;
  if (ctx.isFragment) {
    return { ok: true, page: rendered, cache };
  }
  for (let current = boundary; current; current = current.parent) {
    try {
      let wrapped = rendered;
      for (let i = current.layouts.length - 1; i >= 0; i--) {
        const out = await current.layouts[i]!(ctx, wrapped);
        const taken = takeCached(out, cache);
        wrapped = taken.page;
        cache = taken.cache;
      }
      rendered = wrapped;
    } catch (thrown) {
      return { ok: false, thrown, parent: current.parent };
    }
  }
  return { ok: true, page: rendered, cache };
}

async function recover<
  State extends Record<string, unknown>,
>(
  thrown: unknown,
  boundary: Boundary<State> | undefined,
  ctx: Ctx<Record<string, string>, State>,
): Promise<RenderResult> {
  logError(
    `[ssr] render recovering from: ${
      thrown instanceof Error ? thrown.message : thrown
    }`,
  );

  if (ctx.isFragment) {
    try {
      if (!boundary?.error) {
        return { kind: RenderKind.Exhausted };
      }
      const errorResult = await boundary.error(ctx, thrown);
      if (errorResult instanceof Response) {
        return { kind: RenderKind.Response, response: errorResult };
      }
      const taken = takeCached(errorResult, undefined);
      return {
        kind: RenderKind.Recovered,
        page: taken.page,
        cache: taken.cache,
      };
    } catch (nextThrown) {
      logError(
        `[ssr] render recovering from: ${
          nextThrown instanceof Error ? nextThrown.message : nextThrown
        }`,
      );
      return { kind: RenderKind.Exhausted };
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
    let errorResult: Element | CachedElement | Response;
    try {
      errorResult = await current.error(ctx, thrown);
    } catch (nextThrown) {
      thrown = nextThrown;
      logError(
        `[ssr] render recovering from: ${
          thrown instanceof Error ? thrown.message : thrown
        }`,
      );
      continue;
    }
    if (errorResult instanceof Response) {
      return { kind: RenderKind.Response, response: errorResult };
    }

    const wrapped = await wrapBoundaries(errorResult, ctx, current);
    if (wrapped.ok) {
      return {
        kind: RenderKind.Recovered,
        page: wrapped.page,
        cache: wrapped.cache,
      };
    }
    return await recover(wrapped.thrown, wrapped.parent, ctx);
  }

  return { kind: RenderKind.Exhausted };
}

export function getFragmentSlot(src: string) {
  return `{{fragment:${src}}}`;
}

export async function replaceFragmentSlots(html: string): Promise<string> {
  const store = getRenderStore();
  for (;;) {
    if (store.inflightFragments.size === 0) {
      return html;
    }
    const fragments = await Promise.all(
      store.inflightFragments.entries().map(async ([src, promise]) => ({
        src,
        content: await promise,
      })),
    );
    let next = html;
    for (const fragment of fragments) {
      next = next.replaceAll(
        getFragmentSlot(fragment.src),
        fragment.content || "",
      );
    }
    if (next === html) {
      return html;
    }
    html = next;
  }
}
