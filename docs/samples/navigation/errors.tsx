import type { WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function notFound(): Element {
  return <p>Page not found</p>;
}

export function error(
  _ctx: WrapperCtx,
  thrown: unknown,
): Element {
  const message = thrown instanceof Error ? thrown.message : "Unknown error";
  return <p>{message}</p>;
}

export const fatal = (
  <html>
    <body>Something went wrong</body>
  </html>
);
