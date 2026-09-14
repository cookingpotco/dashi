/**
 * @module
 *
 * Optional Tailwind v4 build and `className` helpers for Dashi apps.
 */

export { buildCss, type BuildCssOptions } from "./build.ts";
export { cn } from "./cn.ts";
export { stylesheetHref } from "./stylesheet_href.ts";

import { buildCss } from "./build.ts";

if (import.meta.main) {
  const extra = Deno.args.filter((arg) => arg !== "--watch");
  if (extra.length > 0) {
    console.error("Usage: dashi-css [--watch]");
    Deno.exit(1);
  }
  await buildCss({
    root: Deno.cwd(),
    watch: Deno.args.includes("--watch"),
  });
}
