import { AsyncLocalStorage } from "node:async_hooks";
import { type Element } from "../jsx-runtime/jsx_types.ts";
import { type Ctx, type Handler, type Layout } from "../shared/mod.ts";

type AnyState = Record<string, unknown>;

interface RenderStore {
  pageReq: Request;
  inflightFragments: Map<string, Promise<string | null>>;
  currentState: AnyState;
}

const als = new AsyncLocalStorage<RenderStore>();

export function runWithRenderStore<T>(req: Request, fn: () => T): T {
  return als.run({
    pageReq: req,
    inflightFragments: new Map(),
    currentState: {},
  }, fn);
}

export function getRenderStore(): RenderStore {
  const store = als.getStore();
  if (!store) {
    throw new Error("getRenderStore() was called outside a handle() render");
  }
  return store;
}

interface RenderRouteOptions {
  ctx: Ctx<Record<string, string>, AnyState>;
  layouts: Layout<AnyState>[];
}

export async function renderRoute(
  handler: Handler<Record<string, string>, AnyState>,
  options: RenderRouteOptions,
): Promise<Element> {
  const [layout, ...rest] = options.layouts;

  if (!layout || options.ctx.isFragment) {
    return handler(options.ctx);
  }

  return layout(
    options.ctx,
    await renderRoute(handler, { ...options, layouts: rest }),
  );
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
