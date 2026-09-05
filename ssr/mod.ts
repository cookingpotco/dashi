// Keep node:async_hooks ALS: Deno AsyncContext is not public yet.
import { AsyncLocalStorage } from "node:async_hooks";
import { type Element, jsx } from "../jsx-runtime/mod.ts";
import type { Ctx, GroupBoundary } from "../shared/mod.ts";

interface FragmentFault {
  error?: Error;
}

interface RenderStore {
  pageReq: Request;
  inflightFragments: Map<string, Promise<string | null>>;
  clientEntries: Set<string>;
  currentState: Partial<Record<string, unknown>>;
  includeChain: string[];
  includeSignal?: AbortSignal;
  fragmentFault: FragmentFault;
  fragmentDepthLimit: number;
}

const als = new AsyncLocalStorage<RenderStore>();

export function runWithRenderStore<T>(
  req: Request,
  fragmentDepthLimit: number,
  fn: () => T,
): T {
  return als.run({
    pageReq: req,
    inflightFragments: new Map(),
    clientEntries: new Set(),
    currentState: {},
    includeChain: [],
    fragmentFault: {},
    fragmentDepthLimit,
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
    includeChain: parent.includeChain,
    includeSignal: parent.includeSignal,
    fragmentFault: parent.fragmentFault,
    fragmentDepthLimit: parent.fragmentDepthLimit,
  }, fn);
}

export function getRenderStore(): RenderStore {
  const store = als.getStore();
  if (!store) {
    throw new Error("getRenderStore() was called outside a handle() render");
  }
  return store;
}

export function inRender(): boolean {
  return als.getStore() !== undefined;
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
  ctx: Ctx<Record<string, unknown>, Record<string, string>>,
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

export function getFragmentSlot(src: string) {
  return `{{fragment:${src}}}`;
}

function throwFragmentFault(store: RenderStore): void {
  if (store.fragmentFault.error) {
    const error = store.fragmentFault.error;
    store.fragmentFault.error = undefined;
    throw error;
  }
}

export async function replaceFragmentSlots(html: string): Promise<string> {
  const store = getRenderStore();
  for (;;) {
    throwFragmentFault(store);
    if (store.inflightFragments.size === 0) {
      return html;
    }
    const fragments = await Promise.all(
      store.inflightFragments.entries().map(async ([src, promise]) => ({
        src,
        content: await promise,
      })),
    );
    throwFragmentFault(store);
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
