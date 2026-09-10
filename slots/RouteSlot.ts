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

const SLOT_SRC_BASE = "http://local";

/** @internal */
interface BaseRouteSlotProps extends HTMLAttributes {
  /**
   * Slot content is fetched from this route with `X-Slot` on GET.
   *
   * A write handler returns `patch.update`, `patch.replace`, `patch.append`,
   * `patch.prepend`, `patch.before`, `patch.after`, `patch.remove`, or
   * `patch.refresh` to update `#id` holes or re-GET every matching slot.
   */
  src: `/${string}`;
}

/** @internal */
interface ConnectedSlotProps extends BaseRouteSlotProps {
  /** Fetch after the host connects. Omitted is `"connected"`. */
  fetchWhen?: "connected";
  /** Shown until a successful body or a nonempty error body replaces it. */
  fallback?: DashiNode;
}

/** @internal */
interface VisibleSlotProps extends BaseRouteSlotProps {
  /** Fetch on first viewport intersection. `fallback` is required. */
  fetchWhen: "visible";
  /** Shown until a successful body or a nonempty error body replaces it. */
  fallback: DashiNode;
}

/** @internal */
type RouteSlotProps = ConnectedSlotProps | VisibleSlotProps;

function resolveSlotSrc(src: string): string {
  const url = new URL(src, SLOT_SRC_BASE);
  return `${url.pathname}${url.search}`;
}

/**
 * Client-fetch an explicit route into a slot. `fetchWhen` is `"connected"`
 * (default) or `"visible"`; `fallback` is required when `"visible"`.
 *
 * @param src Path to fetch, like `/todos`.
 * @param fetchWhen `"connected"` fetches after connect. `"visible"` waits for
 * first intersection; `fallback` is required.
 * @param fallback Shown while the slot is loading.
 *
 * @example
 * ```tsx
 * <RouteSlot src="/todos" fallback={<p>Loading…</p>} />
 * <RouteSlot
 *   src="/demo"
 *   fetchWhen="visible"
 *   fallback={<p>Loading…</p>}
 * />
 * ```
 */
export function RouteSlot(
  { src, fetchWhen, fallback, ...rest }: RouteSlotProps,
): Element {
  const identity = resolveSlotSrc(src);
  if (fetchWhen === "visible") {
    return jsx(RouteSlotElement, {
      src: identity,
      fetchWhen: "visible",
      ...rest,
      children: fallback,
    });
  }
  return jsx(RouteSlotElement, {
    src: identity,
    ...rest,
    children: fallback,
  });
}
