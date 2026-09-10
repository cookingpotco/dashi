import type { Element } from "../jsx-runtime/mod.ts";
import type { Ctx, GroupBoundary } from "../shared/mod.ts";

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
