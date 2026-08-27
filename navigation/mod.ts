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
 * Same-origin left-clicks, GET forms, and form redirects fetch the
 * next document and replace this element's children. The incoming
 * `<head>` is merged: matching stylesheets and scripts stay, the rest
 * of the live head is replaced, and new stylesheets load before the
 * swap. History, back/forward, and scroll restoration are included.
 * `hardNavigation` on an `<a>` or a form opts that control out. From
 * client TypeScript, `import { navigate } from "dashi/client"`.
 *
 * Without this element, GET navigation is a real load. Writes still
 * apply fragment actions when that runtime loaded.
 */
export function NavigationRoot(props: HTMLAttributes): Element {
  return jsx(NavigationRootElement, { ...props });
}
