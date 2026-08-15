import { AsyncLocalStorage } from "node:async_hooks";
import { type Element } from "../jsx-runtime/jsx_types.ts";
import { Handler, Layout, REQUEST_HEADERS } from "../shared/mod.ts";

interface RenderStore {
  req: Request;
  inflightFragments: Map<string, Promise<string | null>>;
}

const als = new AsyncLocalStorage<RenderStore>();

export function runWithRenderStore<T>(req: Request, fn: () => T): T {
  return als.run({
    req,
    inflightFragments: new Map(),
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
  req: Request;
  layouts: Layout[];
}

export async function renderRoute(
  handler: Handler,
  options: RenderRouteOptions,
): Promise<Element> {
  const [layout, ...rest] = options.layouts;

  if (!layout || options.req.headers.has(REQUEST_HEADERS.FRAGMENT)) {
    return handler(options.req);
  }

  return layout(
    options.req,
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
