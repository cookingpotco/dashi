import { type Element, jsx, jsxTemplate } from "../jsx-runtime/mod.ts";

/** @internal */
export type InternalSrc = `/${string}`;

const enum ActionKind {
  Replace = "replace",
  Append = "append",
  Prepend = "prepend",
  Before = "before",
  After = "after",
  Remove = "remove",
  Refresh = "refresh",
}

/** @internal */
interface ReplaceAction {
  readonly kind: ActionKind.Replace;
  readonly src: InternalSrc;
  readonly body: Element;
}

/** @internal */
interface AppendAction {
  readonly kind: ActionKind.Append;
  readonly src: InternalSrc;
  readonly body: Element;
}

/** @internal */
interface PrependAction {
  readonly kind: ActionKind.Prepend;
  readonly src: InternalSrc;
  readonly body: Element;
}

/** @internal */
interface BeforeAction {
  readonly kind: ActionKind.Before;
  readonly src: InternalSrc;
  readonly body: Element;
}

/** @internal */
interface AfterAction {
  readonly kind: ActionKind.After;
  readonly src: InternalSrc;
  readonly body: Element;
}

/** @internal */
interface RemoveAction {
  readonly kind: ActionKind.Remove;
  readonly src: InternalSrc;
}

/** @internal */
interface RefreshAction {
  readonly kind: ActionKind.Refresh;
  readonly src: InternalSrc;
}

/** One targeted update for every `<RouteFragment>` rendering `src`. */
export type FragmentAction =
  | ReplaceAction
  | AppendAction
  | PrependAction
  | BeforeAction
  | AfterAction
  | RemoveAction
  | RefreshAction;

/**
 * Replace the host's children with `body`.
 *
 * @param src Path every matching `<RouteFragment>` renders.
 * @param body Markup that becomes the host's children.
 *
 * @example
 * ```ts
 * return [fragment.replace("/todos", <TodoList />)];
 * ```
 */
function replace(src: InternalSrc, body: Element): FragmentAction {
  return { kind: ActionKind.Replace, src, body };
}

/** Append `body` to the host's children. */
function append(src: InternalSrc, body: Element): FragmentAction {
  return { kind: ActionKind.Append, src, body };
}

/** Prepend `body` to the host's children. */
function prepend(src: InternalSrc, body: Element): FragmentAction {
  return { kind: ActionKind.Prepend, src, body };
}

/** Insert `body` as a sibling before the host. */
function before(src: InternalSrc, body: Element): FragmentAction {
  return { kind: ActionKind.Before, src, body };
}

/** Insert `body` as a sibling after the host. */
function after(src: InternalSrc, body: Element): FragmentAction {
  return { kind: ActionKind.After, src, body };
}

/** Drop the host from the document. */
function remove(src: InternalSrc): FragmentAction {
  return { kind: ActionKind.Remove, src };
}

/** Re-GET every host rendering `src`. */
function refresh(src: InternalSrc): FragmentAction {
  return { kind: ActionKind.Refresh, src };
}

/**
 * Targeted fragment updates from a write handler. Return them as a
 * non-empty list. GET cannot return these; a GET or lazy fetch still
 * replaces the host that asked.
 *
 * `replace`, `append`, `prepend`, `before`, `after`, `remove`, and
 * `refresh` each target every `<RouteFragment>` rendering that `src`.
 * `replace` / `append` / `prepend` mutate the host's children; `before`
 * / `after` insert siblings of the host; `remove` drops the host;
 * `refresh` re-GETs. Use `replace` when the write has the markup; use
 * `refresh` when fragments should re-fetch themselves asynchronously.
 */
export const fragment = {
  replace,
  append,
  prepend,
  before,
  after,
  remove,
  refresh,
};

function serializeAction(action: FragmentAction): Element {
  switch (action.kind) {
    case ActionKind.Replace:
    case ActionKind.Append:
    case ActionKind.Prepend:
    case ActionKind.Before:
    case ActionKind.After:
      return jsx("route-action", {
        action: action.kind,
        src: action.src,
        children: action.body,
      });
    case ActionKind.Remove:
      return jsx("route-action", {
        action: ActionKind.Remove,
        src: action.src,
      });
    case ActionKind.Refresh:
      return jsx("route-action", {
        action: ActionKind.Refresh,
        src: action.src,
      });
  }
}

/** Sibling `route-action` elements for a write handler's action list. */
export function renderFragmentActions(
  actions: readonly FragmentAction[],
): Element {
  const elements = actions.map(serializeAction);
  return jsxTemplate(["", ...elements.map(() => "")], ...elements);
}
