import { DashiNode, HTMLAttributes, jsx } from "dashi/jsx-runtime";
import { requestEagerFragment } from "../routing/mod.ts";
import { getFragmentSlot } from "../ssr/mod.ts";

// So document.querySelector("route-fragment") is HTMLElement.
declare global {
  interface HTMLElementTagNameMap {
    "route-fragment": HTMLElement;
  }
}

export type InternalSrc = `/${string}`;

export interface RouteFragmentAttributes extends HTMLAttributes {
  src: InternalSrc;
  lazy?: boolean;
}

interface BaseRouteFragmentProps extends RouteFragmentAttributes {
  /**
   * Fragment is fetched from this location, either eagerly during SSR or after
   * load when `lazy` is set.
   *
   * Actions like form submissions will also be scoped to this path by default
   */
  src: InternalSrc;
}

interface LazyFragmentProps extends BaseRouteFragmentProps {
  /**
   * Will not render the fragment during SSR; it is fetched after page load.
   * Useful for deferring rendering and separating cache control.
   *
   * Passing `fallback` adds a pending UI until the actual fragment is loaded.
   */
  lazy: true;
  /**
   * Returned during SSR when `lazy` is set, until it's replaced by actual content
   */
  fallback?: DashiNode;
}

interface EagerFragmentProps extends BaseRouteFragmentProps {
  lazy?: never;
  fallback?: never;
}

type FragmentSlotProps = LazyFragmentProps | EagerFragmentProps;

export function RouteFragment(
  { src, lazy, fallback, ...rest }: FragmentSlotProps,
) {
  if (lazy) {
    return jsx("route-fragment", {
      src,
      lazy: true,
      ...rest,
      children: fallback,
    });
  }

  requestEagerFragment(src);
  return jsx("route-fragment", {
    src,
    ...rest,
    dangerouslySetInnerHTML: { __html: getFragmentSlot(src) },
  });
}
