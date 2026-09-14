import { stylesheetHref } from "../../../css/mod.ts";
import { type LayoutArgs } from "dashi";
import type { Element } from "dashi/jsx-runtime";

if (import.meta.dirname === undefined) {
  throw new Error("import.meta.dirname is required");
}
const appRoot = import.meta.dirname;

export function RootLayout({ children }: LayoutArgs): Element {
  return (
    <html lang="en">
      <head>
        <title>Tailwind e2e</title>
        <link rel="stylesheet" href={stylesheetHref(appRoot)} />
      </head>
      <body>{children}</body>
    </html>
  );
}
