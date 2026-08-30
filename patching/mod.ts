import { type Element, jsx, jsxTemplate } from "../jsx-runtime/mod.ts";

type Target = `/${string}` | `#${string}`;

const enum PatchKind {
  Replace = "replace",
  Append = "append",
  Prepend = "prepend",
  Before = "before",
  After = "after",
  Remove = "remove",
  Refresh = "refresh",
}

/** @internal */
interface ReplacePatch {
  readonly kind: PatchKind.Replace;
  readonly target: Target;
  readonly body: Element;
}

/** @internal */
interface AppendPatch {
  readonly kind: PatchKind.Append;
  readonly target: Target;
  readonly body: Element;
}

/** @internal */
interface PrependPatch {
  readonly kind: PatchKind.Prepend;
  readonly target: Target;
  readonly body: Element;
}

/** @internal */
interface BeforePatch {
  readonly kind: PatchKind.Before;
  readonly target: Target;
  readonly body: Element;
}

/** @internal */
interface AfterPatch {
  readonly kind: PatchKind.After;
  readonly target: Target;
  readonly body: Element;
}

/** @internal */
interface RemovePatch {
  readonly kind: PatchKind.Remove;
  readonly target: Target;
}

/** @internal */
interface RefreshPatch {
  readonly kind: PatchKind.Refresh;
  readonly target: `/${string}`;
}

/** One targeted update for a `/${string}` host or a `#${string}` node. */
export type Patch =
  | ReplacePatch
  | AppendPatch
  | PrependPatch
  | BeforePatch
  | AfterPatch
  | RemovePatch
  | RefreshPatch;

/**
 * Replace the target's children with `body`.
 *
 * @param target Route src (`/${string}`) or an element id (`#${string}`).
 * @param body Markup that becomes the target's children.
 *
 * @example
 * ```ts
 * return [patch.replace("/todos", <TodoList />)];
 * ```
 */
function replace(target: Target, body: Element): Patch {
  return { kind: PatchKind.Replace, target, body };
}

/**
 * Append `body` to the target's children.
 *
 * @param target Route src (`/${string}`) or an element id (`#${string}`).
 * @param body Markup to append.
 *
 * @example
 * ```ts
 * return [patch.append("#todos", <li>milk</li>)];
 * ```
 */
function append(target: Target, body: Element): Patch {
  return { kind: PatchKind.Append, target, body };
}

/**
 * Prepend `body` to the target's children.
 *
 * @param target Route src (`/${string}`) or an element id (`#${string}`).
 * @param body Markup to prepend.
 *
 * @example
 * ```ts
 * return [patch.prepend("/todos", <li>bread</li>)];
 * ```
 */
function prepend(target: Target, body: Element): Patch {
  return { kind: PatchKind.Prepend, target, body };
}

/**
 * Insert `body` as a sibling before the target.
 *
 * @param target Route src (`/${string}`) or an element id (`#${string}`).
 * @param body Markup to insert.
 *
 * @example
 * ```ts
 * return [patch.before("/slot", <p>before</p>)];
 * ```
 */
function before(target: Target, body: Element): Patch {
  return { kind: PatchKind.Before, target, body };
}

/**
 * Insert `body` as a sibling after the target.
 *
 * @param target Route src (`/${string}`) or an element id (`#${string}`).
 * @param body Markup to insert.
 *
 * @example
 * ```ts
 * return [patch.after("/slot", <p>after</p>)];
 * ```
 */
function after(target: Target, body: Element): Patch {
  return { kind: PatchKind.After, target, body };
}

/**
 * Drop the target from the document.
 *
 * @param target Route src (`/${string}`) or an element id (`#${string}`).
 *
 * @example
 * ```ts
 * return [patch.remove("#notice")];
 * ```
 */
function remove(target: Target): Patch {
  return { kind: PatchKind.Remove, target };
}

/**
 * Re-GET every host rendering `target`.
 *
 * @param target Path every matching `<RouteFragment>` renders.
 *
 * @example
 * ```ts
 * return [patch.refresh("/hits")];
 * ```
 */
function refresh(target: `/${string}`): Patch {
  return { kind: PatchKind.Refresh, target };
}

/**
 * Targeted updates from a write handler. Return them as a non-empty
 * list. GET cannot return these; a GET or lazy fetch still replaces
 * the host that asked.
 *
 * `replace`, `append`, `prepend`, `before`, `after`, `remove`, and
 * `refresh` each take a required target. `/${string}` updates every
 * `<RouteFragment>` rendering that `src`. `#${string}` updates the
 * node from `document.getElementById`. `refresh` accepts only a
 * route. `replace` / `append` / `prepend` mutate children; `before`
 * / `after` insert siblings; `remove` drops the node; `refresh`
 * re-GETs. Use `replace` when the write has the markup; use
 * `refresh` when fragments should re-fetch themselves asynchronously.
 */
export const patch = {
  replace,
  append,
  prepend,
  before,
  after,
  remove,
  refresh,
};

function serializePatch(item: Patch): Element {
  switch (item.kind) {
    case PatchKind.Replace:
    case PatchKind.Append:
    case PatchKind.Prepend:
    case PatchKind.Before:
    case PatchKind.After:
      return jsx("dashi-patch", {
        kind: item.kind,
        target: item.target,
        children: item.body,
      });
    case PatchKind.Remove:
      return jsx("dashi-patch", {
        kind: PatchKind.Remove,
        target: item.target,
      });
    case PatchKind.Refresh:
      return jsx("dashi-patch", {
        kind: PatchKind.Refresh,
        target: item.target,
      });
  }
}

/** Sibling `dashi-patch` elements for a write handler's patch list. */
export function renderPatches(patches: readonly Patch[]): Element {
  const elements = patches.map(serializePatch);
  return jsxTemplate(["", ...elements.map(() => "")], ...elements);
}
