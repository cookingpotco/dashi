import {
  DashiNode,
  InternalSrc,
  RouteFragmentAttributes,
} from "dashi/jsx-runtime";

interface BaseRouteFragmentProps extends RouteFragmentAttributes {
  /**
   * Fragment will be fetched from this location either inline during SSR
   * or after load depending on the `lazy` flag
   *
   * Actions like form submissions will also be scoped to this path by default
   */
  src: InternalSrc;
}

interface LazyFragmentProps extends BaseRouteFragmentProps {
  /**
   * Will not render the component during SSR, it will be fetched after page load
   * Useful for deferring rendering and separating cache control
   *
   * Passing `children` will add a pending UI appearing until the
   * actual fragment is loaded.
   */
  lazy: true;
  /**
   * Returned during SSR when `lazy` is set to true, until it's replaced by actual content
   */
  fallback?: DashiNode;
}

interface InlineFragmentProps extends BaseRouteFragmentProps {
  lazy?: never;
  fallback?: never;
}

type FragmentSlotProps = LazyFragmentProps | InlineFragmentProps;

export function RouteFragment(
  { src, lazy, fallback, ...rest }: FragmentSlotProps,
) {
  if (lazy) {
    return (
      <route-fragment src={src} lazy {...rest}>
        {fallback}
      </route-fragment>
    );
  }

  return <route-fragment src={src} {...rest}></route-fragment>;
}
