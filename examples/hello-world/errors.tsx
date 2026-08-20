import { type Element, type WrapperCtx } from "dashi";

export function NotFound(): Element {
  return (
    <p id="not-found">
      Page not found
    </p>
  );
}

export function ErrorPage(
  _ctx: WrapperCtx,
  thrown: unknown,
): Element {
  const message = thrown instanceof Error ? thrown.message : "Unknown error";
  return (
    <p id="error">
      {message}
    </p>
  );
}

export const errorFallback = (
  <html>
    <body>Something went wrong</body>
  </html>
);
