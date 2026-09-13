import { type Element, type HTMLAttributes, jsx } from "../jsx-runtime/mod.ts";
import { client } from "../client/mod.ts";

const NavigationRootElement = client.element(
  "navigation-root",
  new URL("./navigation_root_client.ts", import.meta.url),
);

/**
 * Wraps the region that swaps on soft navigation.
 *
 * @param props Standard HTML attributes; put page content in `children`.
 *
 * @example
 * ```tsx
 * <NavigationRoot>{children}</NavigationRoot>
 * ```
 *
 * @see https://dashi.run/docs/soft-navigation#navigationroot
 */
export function NavigationRoot(props: HTMLAttributes): Element {
  return jsx(NavigationRootElement, { ...props });
}
