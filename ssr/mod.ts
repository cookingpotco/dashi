import { AsyncLocalStorage } from "node:async_hooks";
import { type Element } from "../jsx-runtime/jsx_types.ts";
import { error as logError } from "../logging/mod.ts";
import { type Ctx, type ErrorHandler, type Layout } from "../shared/mod.ts";

interface RenderStore {
  pageReq: Request;
  inflightFragments: Map<string, Promise<string | null>>;
  currentState: Partial<Record<string, unknown>>;
}

const als = new AsyncLocalStorage<RenderStore>();

export function runWithRenderStore<T>(req: Request, fn: () => T): T {
  return als.run({
    pageReq: req,
    inflightFragments: new Map(),
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

interface Boundary<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  layouts: Layout<State>[];
  error?: ErrorHandler<State>;
  parent?: Boundary<State>;
}

export type RenderResult =
  | { kind: "page"; page: Element }
  | { kind: "recovered"; page: Element }
  | { kind: "response"; response: Response }
  | { kind: "exhausted" };

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
  page: Element | { thrown: unknown },
  options: {
    ctx: Ctx<Record<string, string>, State>;
    boundary?: Boundary<State>;
  },
): Promise<RenderResult> {
  // Element is a String object at runtime, so `typeof` is `"object"`.
  if (typeof page === "object" && "thrown" in page) {
    return await recover(page.thrown, options.boundary, options.ctx);
  }
  const wrapped = await wrapBoundaries(page, options.ctx, options.boundary);
  if (wrapped.ok) {
    return { kind: "page", page: wrapped.page };
  }
  return await recover(wrapped.thrown, wrapped.parent, options.ctx);
}

async function wrapBoundaries<
  State extends Record<string, unknown>,
>(
  page: Element,
  ctx: Ctx<Record<string, string>, State>,
  boundary: Boundary<State> | undefined,
): Promise<
  | { ok: true; page: Element }
  | { ok: false; thrown: unknown; parent?: Boundary<State> }
> {
  if (ctx.isFragment) {
    return { ok: true, page };
  }
  for (let current = boundary; current; current = current.parent) {
    try {
      let wrapped = page;
      for (let i = current.layouts.length - 1; i >= 0; i--) {
        wrapped = await current.layouts[i]!(ctx, wrapped);
      }
      page = wrapped;
    } catch (thrown) {
      return { ok: false, thrown, parent: current.parent };
    }
  }
  return { ok: true, page };
}

async function recover<
  State extends Record<string, unknown>,
>(
  thrown: unknown,
  boundary: Boundary<State> | undefined,
  ctx: Ctx<Record<string, string>, State>,
): Promise<RenderResult> {
  logError(thrown);

  if (ctx.isFragment) {
    try {
      if (!boundary?.error) {
        return { kind: "exhausted" };
      }
      const errorResult = await boundary.error(ctx, thrown);
      if (errorResult instanceof Response) {
        return { kind: "response", response: errorResult };
      }
      return { kind: "recovered", page: errorResult };
    } catch (nextThrown) {
      logError(nextThrown);
      return { kind: "exhausted" };
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
    let errorResult: Element | Response;
    try {
      errorResult = await current.error(ctx, thrown);
    } catch (nextThrown) {
      thrown = nextThrown;
      logError(thrown);
      continue;
    }
    if (errorResult instanceof Response) {
      return { kind: "response", response: errorResult };
    }

    const wrapped = await wrapBoundaries(errorResult, ctx, current);
    if (wrapped.ok) {
      return { kind: "recovered", page: wrapped.page };
    }
    return await recover(wrapped.thrown, wrapped.parent, ctx);
  }

  return { kind: "exhausted" };
}

export function getFragmentSlot(src: string) {
  return `{{fragment:${src}}}`;
}

export async function replaceFragmentSlots(html: string): Promise<string> {
  const store = getRenderStore();
  let seen = 0;

  while (store.inflightFragments.size > seen) {
    seen = store.inflightFragments.size;
    const fragments = await Promise.all(
      store.inflightFragments.entries().map(async ([src, promise]) => ({
        src,
        content: await promise,
      })),
    );

    for (const fragment of fragments) {
      html = html.replaceAll(
        getFragmentSlot(fragment.src),
        fragment.content || "",
      );
    }
  }

  return html;
}
