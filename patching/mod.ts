import { type Element, jsx, jsxTemplate } from "../jsx-runtime/mod.ts";

type IdTarget = `#${string}`;

const enum PatchKind {
  Update = "update",
  Replace = "replace",
  Append = "append",
  Prepend = "prepend",
  Before = "before",
  After = "after",
  Remove = "remove",
  Refresh = "refresh",
}

/** @internal */
interface UpdatePatch {
  readonly kind: PatchKind.Update;
  readonly target: IdTarget;
  readonly body: Element;
}

/** @internal */
interface ReplacePatch {
  readonly kind: PatchKind.Replace;
  readonly target: IdTarget;
  readonly body: Element;
}

/** @internal */
interface AppendPatch {
  readonly kind: PatchKind.Append;
  readonly target: IdTarget;
  readonly body: Element;
}

/** @internal */
interface PrependPatch {
  readonly kind: PatchKind.Prepend;
  readonly target: IdTarget;
  readonly body: Element;
}

/** @internal */
interface BeforePatch {
  readonly kind: PatchKind.Before;
  readonly target: IdTarget;
  readonly body: Element;
}

/** @internal */
interface AfterPatch {
  readonly kind: PatchKind.After;
  readonly target: IdTarget;
  readonly body: Element;
}

/** @internal */
interface RemovePatch {
  readonly kind: PatchKind.Remove;
  readonly target: IdTarget;
}

/** @internal */
interface RefreshPatch {
  readonly kind: PatchKind.Refresh;
  readonly target: `/${string}`;
}

/** One targeted update for a `#${string}` hole or a route refresh. */
export type Patch =
  | UpdatePatch
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
 * @param target Element id (`#${string}`).
 * @param body Markup that becomes the target's children.
 *
 * @example
 * ```ts
 * return patches([patch.update("#todos", <TodoList />)]);
 * ```
 */
function update(target: IdTarget, body: Element): Patch {
  return { kind: PatchKind.Update, target, body };
}

/**
 * Replace the target element with `body`.
 *
 * @param target Element id (`#${string}`).
 * @param body Markup that replaces the target node.
 *
 * @example
 * ```ts
 * return patches([patch.replace("#status", <p id="status">Saved</p>)]);
 * ```
 */
function replace(target: IdTarget, body: Element): Patch {
  return { kind: PatchKind.Replace, target, body };
}

/**
 * Append `body` to the target's children.
 *
 * @param target Element id (`#${string}`).
 * @param body Markup to append.
 *
 * @example
 * ```ts
 * return patches([patch.append("#todos", <li>milk</li>)]);
 * ```
 */
function append(target: IdTarget, body: Element): Patch {
  return { kind: PatchKind.Append, target, body };
}

/**
 * Prepend `body` to the target's children.
 *
 * @param target Element id (`#${string}`).
 * @param body Markup to prepend.
 *
 * @example
 * ```ts
 * return patches([patch.prepend("#todos", <li>bread</li>)]);
 * ```
 */
function prepend(target: IdTarget, body: Element): Patch {
  return { kind: PatchKind.Prepend, target, body };
}

/**
 * Insert `body` as a sibling before the target.
 *
 * @param target Element id (`#${string}`).
 * @param body Markup to insert.
 *
 * @example
 * ```ts
 * return patches([patch.before("#slot", <p>before</p>)]);
 * ```
 */
function before(target: IdTarget, body: Element): Patch {
  return { kind: PatchKind.Before, target, body };
}

/**
 * Insert `body` as a sibling after the target.
 *
 * @param target Element id (`#${string}`).
 * @param body Markup to insert.
 *
 * @example
 * ```ts
 * return patches([patch.after("#slot", <p>after</p>)]);
 * ```
 */
function after(target: IdTarget, body: Element): Patch {
  return { kind: PatchKind.After, target, body };
}

/**
 * Drop the target from the document.
 *
 * @param target Element id (`#${string}`).
 *
 * @example
 * ```ts
 * return patches([patch.remove("#notice")]);
 * ```
 */
function remove(target: IdTarget): Patch {
  return { kind: PatchKind.Remove, target };
}

/**
 * Re-GET every `<route-slot>` rendering `target`.
 *
 * @param target Path every matching slot fetches.
 *
 * @example
 * ```ts
 * return patches([patch.refresh("/hits")]);
 * ```
 */
function refresh(target: `/${string}`): Patch {
  return { kind: PatchKind.Refresh, target };
}

/**
 * Targeted updates from a write handler. Seal them with `patches()`.
 * GET cannot return these; a slot GET still replaces the host that asked.
 *
 * `update`, `replace`, `append`, `prepend`, `before`, `after`, and
 * `remove` each take a `#${string}` id. `refresh` accepts only a route.
 * `update` / `append` / `prepend` mutate children; `replace` swaps the
 * node; `before` / `after` insert siblings; `remove` drops the node;
 * `refresh` re-GETs every matching slot. Use `update` or `replace` when
 * the write has the markup; use `refresh` when slots should re-fetch
 * themselves asynchronously.
 */
export const patch = {
  update,
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
    case PatchKind.Update:
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
