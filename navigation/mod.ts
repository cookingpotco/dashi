import { type Element, type HTMLAttributes, jsx } from "../jsx-runtime/mod.ts";
import { client } from "../client/mod.ts";

const NavigationRootElement = client.element(
  "navigation-root",
  new URL("./navigation_root_client.ts", import.meta.url),
);

/**
 * Wraps the region that swaps on soft navigation. Put it in the
 * root layout around the page content; persistent elements left
 * outside survive.
 *
 * Same-origin left-clicks fetch the next document and replace this
 * element's children. A GET form navigates the same way. A write
 * applies to the nearest host. A redirect swaps in place at the new
 * URL, with history so back does not re-post. `hardNavigation` on an
 * `<a>` or a form opts that control out. From client TypeScript,
 * `import { navigate } from "dashi/client"`. `<head>` is not merged yet.
 *
 * Without this element, nothing changes and no navigation JS reaches
 * the browser. Without JS, links are links.
 */
export function NavigationRoot(props: HTMLAttributes): Element {
  return jsx(NavigationRootElement, { ...props });
}
