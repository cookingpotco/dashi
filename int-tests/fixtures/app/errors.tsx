import {
  type ErrorArgs,
  type FatalArgs,
  type LayoutArgs,
  type MiddlewareArgs,
  type NotFoundArgs,
  type ReadArgs,
  RouteSlot,
} from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "./state.ts";

export function NotFound({ ctx, html }: NotFoundArgs<AppState>) {
  if (ctx.url.pathname === "/not-found-throws") {
    throw new Error("not-found-throws");
  }
  if (ctx.url.pathname === "/not-found-gone") {
    return html(<p id="gone">gone</p>, { status: 410 });
  }
  return html(<p id="not-found">custom-404</p>);
}

export function ApiNotFound({ html }: NotFoundArgs<AppState>) {
  return html(<p id="api-not-found">api-404</p>);
}

export function ApiV2NotFound({ html }: NotFoundArgs<AppState>) {
  return html(<p id="api-v2-not-found">api-v2-404</p>);
}

export function RootError({ thrown, html }: ErrorArgs<AppState>) {
  if (thrown instanceof Error && thrown.message === "error-handler-boom") {
    throw thrown;
  }
  if (thrown instanceof Error && thrown.message === "service-unavailable") {
    return html(<p id="error-503">unavailable</p>, { status: 503 });
  }
  return html(<p id="root-error">root-error</p>);
}

export function fatal({ html }: FatalArgs) {
  return html(
    <html>
      <body>
        <p id="fallback">crash-fallback</p>
      </body>
    </html>,
  );
}

export function throwHandler(): never {
  throw new Error("handler-boom");
}

export function throwErrorHandlerBoom(): never {
  throw new Error("error-handler-boom");
}

export function throwServiceUnavailable(): never {
  throw new Error("service-unavailable");
}

export function okPage({ html }: ReadArgs<{ state: AppState }>) {
  return html(<p id="ok-page">ok</p>);
}

export function nestedError({ html }: ErrorArgs<AppState>) {
  return html(<p id="nested-error">nested-error</p>);
}

export function nestedErrorLayout({ children }: LayoutArgs<AppState>): Element {
  return (
    <div id="nested-error-wrap">
      <h2>NestedError</h2>
      {children}
    </div>
  );
}

export function noErrorLayout({ children }: LayoutArgs<AppState>): Element {
  return <div id="no-error-wrap">{children}</div>;
}

export function throwingLayout(): never {
  throw new Error("nested-layout");
}

export function throwingError(): never {
  throw new Error("error-fn-boom");
}

export function jsonError(): Response {
  return Response.json({ error: "json-500" }, { status: 500 });
}

export function compactError({ html }: ErrorArgs<AppState>) {
  return html(<p id="slot-error">slot-error-ui</p>);
}

export function responseError(): Response {
  return new Response("no-splice", { status: 500 });
}

export function nestedMw(
  { next }: MiddlewareArgs<AppState>,
): Promise<Response> {
  return next().then((res) => {
    res.headers.set("x-nested-mw", "1");
    return res;
  });
}

export function throwingMw(): Response {
  throw new Error("middleware-boom");
}

export function embedSlotCases(
  { html }: ReadArgs<{ state: AppState }>,
) {
  return html(
    <div id="embed-slot-cases">
      <section id="embed-miss">
        <RouteSlot src="/no-such-slot" />
      </section>
      <section id="embed-throw">
        <RouteSlot src="/slot-throw" />
      </section>
      <section id="embed-error-res">
        <RouteSlot src="/slot-error-response" />
      </section>
      <section id="embed-error-throws">
        <RouteSlot src="/slot-error-throws" />
      </section>
    </div>,
  );
}
