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
 * element's children. `hardNavigation` on an `<a>` opts that link
 * out. From client TypeScript, `import { navigate } from "dashi/client"`.
 * `<head>` is not merged yet.
 *
 * Without this element, nothing changes and no navigation JS reaches
 * the browser. Without JS, links are links.
 */
export function NavigationRoot(props: HTMLAttributes): Element {
  return jsx(NavigationRootElement, { ...props });
}
