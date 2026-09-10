import {
  type DashiNode,
  type Element,
  type HTMLAttributes,
  jsx,
} from "../jsx-runtime/mod.ts";
import { client } from "../client/mod.ts";
import { getRenderStore } from "../ssr/mod.ts";

const RouteSlotElement = client.element(
  "route-slot",
  new URL("./route_slot_client.ts", import.meta.url),
);

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
interface ConnectSlotProps extends BaseRouteSlotProps {
  /** Fetch after the host connects. Omitted is `"connect"`. */
  fetchWhen?: "connect";
  fallback?: never;
}

/** @internal */
interface VisibleSlotProps extends BaseRouteSlotProps {
  /** Fetch on first viewport intersection. `fallback` is required. */
  fetchWhen: "visible";
  /** Shown until a successful body or a nonempty error body replaces it. */
  fallback: DashiNode;
}

/** @internal */
type RouteSlotProps = ConnectSlotProps | VisibleSlotProps;

function resolveSlotSrc(src: string, base: string): string {
  const url = new URL(src, base);
  return `${url.pathname}${url.search}`;
}

/**
 * Client-fetch an explicit route into a slot. `fetchWhen` is `"connect"`
 * (default) or `"visible"`; `fallback` is required when `"visible"`.
 *
 * @param src Path to fetch, like `/todos`.
 * @param fetchWhen `"connect"` fetches after connect. `"visible"` waits for
 * first intersection; `fallback` is required.
 * @param fallback Shown while a visible slot is loading.
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
export function RouteSlot(
  { src, fetchWhen, fallback, ...rest }: RouteSlotProps,
): Element {
  const identity = resolveSlotSrc(src, getRenderStore().pageReq.url);
  if (fetchWhen === "visible") {
    return jsx(RouteSlotElement, {
      src: identity,
      fetchWhen: "visible",
      ...rest,
      children: fallback,
    });
  }
  return jsx(RouteSlotElement, { src: identity, ...rest });
}
