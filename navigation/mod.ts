import { type Element, type HTMLAttributes, jsx } from "../jsx-runtime/mod.ts";
import { client } from "../client/mod.ts";

const RouteNavigationElement = client.element(
  "route-navigation",
  new URL("./navigation_client.ts", import.meta.url),
);

/**
 * Wraps the region that swaps on in-place navigation. Put it in the
 * root layout around the page content; chrome left outside survives.
 *
 * Same-origin left-clicks fetch the next document and replace this
 * element's children. `data-dashi-navigate="false"` on a link or a
 * container opts that subtree out. `<head>` is not merged yet.
 *
 * Without this element, nothing changes and no navigation JS reaches
 * the browser. Without JS, links are links.
 */
export function RouteNavigation(props: HTMLAttributes): Element {
  return jsx(RouteNavigationElement, { ...props });
}
