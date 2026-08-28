import { type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function ErrorPage(
  _ctx: WrapperCtx,
  thrown: unknown,
): Element {
  const message = thrown instanceof Error ? thrown.message : "Unknown error";
  return <p id="error">{message}</p>;
}

export const fatal = (
  <html>
    <body>Something went wrong</body>
  </html>
);
