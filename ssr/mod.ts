// Keep node:async_hooks ALS: Deno AsyncContext is not public yet.
import { AsyncLocalStorage } from "node:async_hooks";
import { type Element, jsx } from "../jsx-runtime/mod.ts";
import type { Ctx, GroupBoundary } from "../shared/mod.ts";

interface ClientCompileContext {
  clientEntries: Set<string>;
}

const als = new AsyncLocalStorage<ClientCompileContext>();

export function runWithClientCompileContext<T>(fn: () => T): T {
  return als.run({ clientEntries: new Set() }, fn);
}

export function getClientCompileContext(): ClientCompileContext {
  const store = als.getStore();
  if (!store) {
    throw new Error(
      "getClientCompileContext() was called outside a handle() render",
    );
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

/** Slot include: `Link` names each recorded entry’s hashed URL. */
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
