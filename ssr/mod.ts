import { AsyncLocalStorage } from "node:async_hooks";
import { type Element } from "../jsx-runtime/jsx_types.ts";
import { type Ctx, type Layout } from "../shared/mod.ts";
import { type GroupBoundary } from "../routing/path.ts";

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

interface RenderRouteOptions<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
> {
  ctx: Ctx<Record<string, string>, State>;
  layouts: Layout<State>[];
}

export async function renderRoute<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  page: Element,
  options: RenderRouteOptions<State>,
): Promise<Element> {
  const [layout, ...rest] = options.layouts;
  if (!layout) {
    return page;
  }
  return layout(
    options.ctx,
    await renderRoute(page, { ...options, layouts: rest }),
  );
}

/**
 * Wraps `page` in each group's layouts, innermost group first. If a
 * group's layouts throw, `parent` is the next group out — that group's
 * `error` does not catch its own layouts.
 */
export async function renderBoundaries<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  page: Element,
  options: {
    ctx: Ctx<Record<string, string>, State>;
    boundary?: GroupBoundary<State>;
  },
): Promise<
  | { page: Element }
  | { thrown: unknown; parent?: GroupBoundary<State> }
> {
  let wrapped = page;
  for (
    let boundary = options.boundary;
    boundary;
    boundary = boundary.parent
  ) {
    try {
      wrapped = await renderRoute(wrapped, {
        ctx: options.ctx,
        layouts: boundary.layouts,
      });
    } catch (thrown) {
      return { thrown, parent: boundary.parent };
    }
  }
  return { page: wrapped };
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
