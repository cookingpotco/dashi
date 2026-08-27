import { type Element, jsx, jsxTemplate } from "../jsx-runtime/mod.ts";

/** Path identity shared by `<RouteFragment src>` and fragment actions. */
export type InternalSrc = `/${string}`;

const enum ActionKind {
  Replace = "replace",
  Append = "append",
  Remove = "remove",
  Refresh = "refresh",
}

interface ReplaceAction {
  readonly kind: ActionKind.Replace;
  readonly src: InternalSrc;
  readonly body: Element;
}

interface AppendAction {
  readonly kind: ActionKind.Append;
  readonly src: InternalSrc;
  readonly body: Element;
}

interface RemoveAction {
  readonly kind: ActionKind.Remove;
  readonly src: InternalSrc;
}

interface RefreshAction {
  readonly kind: ActionKind.Refresh;
  readonly src: InternalSrc;
}

/** One targeted update for every `<RouteFragment>` rendering `src`. */
export type FragmentAction =
  | ReplaceAction
  | AppendAction
  | RemoveAction
  | RefreshAction;

function replace(src: InternalSrc, body: Element): FragmentAction {
  return { kind: ActionKind.Replace, src, body };
}

function append(src: InternalSrc, body: Element): FragmentAction {
  return { kind: ActionKind.Append, src, body };
}

function remove(src: InternalSrc): FragmentAction {
  return { kind: ActionKind.Remove, src };
}

function refresh(src: InternalSrc): FragmentAction {
  return { kind: ActionKind.Refresh, src };
}

/**
 * Targeted fragment updates from a write handler. Return them as a
 * non-empty list. GET cannot return these; a GET or lazy fetch still
 * replaces the host that asked.
 *
 * `replace`, `append`, `remove`, and `refresh` each target every
 * `<RouteFragment>` rendering that `src`. Use `replace` when the write
 * has the markup; use `refresh` when fragments should re-fetch
 * themselves asynchronously.
 */
export const fragment = { replace, append, remove, refresh };

function serializeAction(action: FragmentAction): Element {
  switch (action.kind) {
    case ActionKind.Replace:
      return jsx("route-action", {
        action: ActionKind.Replace,
        src: action.src,
        children: action.body,
      });
    case ActionKind.Append:
      return jsx("route-action", {
        action: ActionKind.Append,
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
