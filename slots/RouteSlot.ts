import {
  type DashiNode,
  type Element,
  type HTMLAttributes,
  jsx,
} from "../jsx-runtime/mod.ts";
import { client } from "../client/mod.ts";

const RouteSlotElement = client.element(
  "route-slot",
  new URL("./route_slot_client.ts", import.meta.url),
);

/** @internal */
interface BaseRouteSlotProps extends Omit<HTMLAttributes, "children"> {
  /**
   * Slot content is fetched from this route with `X-Slot` on GET.
   *
   * A write handler returns `patch.update`, `patch.replace`, `patch.append`,
   * `patch.prepend`, `patch.before`, `patch.after`, `patch.remove`, or
   * `patch.refresh` to update `#id` holes or re-GET every matching slot.
   */
  src: `/${string}`;
  /** Shown until a successful body or a nonempty error body replaces it. */
  fallback?: DashiNode;
}

/** @internal */
interface VisibleSlotProps extends Omit<HTMLAttributes, "children"> {
  src: `/${string}`;
  /** Fetch on first viewport intersection. `fallback` is required. */
  fetchWhen: "visible";
  /** Shown until a successful body or a nonempty error body replaces it. */
  fallback: DashiNode;
}

/** @internal */
type RouteSlotProps = BaseRouteSlotProps | VisibleSlotProps;

export function RouteSlot(props: BaseRouteSlotProps): Element;
export function RouteSlot(props: VisibleSlotProps): Element;

/**
 * Client-fetch an explicit route into a slot. Omit `fetchWhen` to fetch after
 * connect; `fetchWhen="visible"` waits for first intersection and requires
 * `fallback`.
 *
 * A `patch.refresh` on the same route may fire before a visible slot
 * intersects; the slot still fetches on connect when `fetchWhen` is omitted.
 *
 * @param src Path to fetch, like `/todos`.
 * @param fetchWhen `"visible"` waits for first intersection; `fallback` is
 * required.
 * @param fallback Shown while the slot is loading.
 *
 * @example
 * ```tsx
 * <RouteSlot src="/todos" />
 * <RouteSlot
 *   src="/demo"
 *   fetchWhen="visible"
 *   fallback={<p>Loading…</p>}
 * />
 * ```
 */
export function RouteSlot(props: RouteSlotProps): Element {
  if ("fetchWhen" in props && props.fetchWhen === "visible") {
    const { src, fetchWhen, fallback, ...rest } = props;
    return jsx(RouteSlotElement, {
      src,
      fetchWhen,
      ...rest,
      children: fallback,
    });
  }
  const { src, fallback, ...rest } = props;
  return jsx(RouteSlotElement, {
    src,
    ...rest,
    children: fallback,
  });
}
