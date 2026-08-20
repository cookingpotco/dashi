import { type Ctx, type Element, RouteFragment, type WrapperCtx } from "dashi";
import type { AppState } from "./state.ts";

export function NotFound(
  ctx: Ctx<Record<string, string>, AppState>,
) {
  if (ctx.url.pathname === "/not-found-throws") {
    throw new Error("not-found-throws");
  }
  return <p id="not-found">custom-404</p>;
}

export function ApiNotFound(): Element {
  return <p id="api-not-found">api-404</p>;
}

export function RootError(
  _ctx: WrapperCtx<AppState>,
  thrown: unknown,
) {
  if (thrown instanceof Error && thrown.message === "error-handler-boom") {
    throw thrown;
  }
  return <p id="root-error">root-error</p>;
}

export const errorFallback = (
  <html>
    <body>
      <p id="fallback">crash-fallback</p>
    </body>
  </html>
);

export function throwHandler(): Element {
  throw new Error("handler-boom");
}

export function throwErrorHandlerBoom(): Element {
  throw new Error("error-handler-boom");
}

export function okPage(): Element {
  return <p id="ok-page">ok</p>;
}

export function nestedError(
  _ctx: WrapperCtx<AppState>,
  _thrown: unknown,
): Element {
  return <p id="nested-error">nested-error</p>;
}

export function nestedErrorLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
): Element {
  return (
    <div id="nested-error-wrap">
      <h2>NestedError</h2>
      {children}
    </div>
  );
}

export function noErrorLayout(
  _ctx: WrapperCtx<AppState>,
  children: Element,
): Element {
  return <div id="no-error-wrap">{children}</div>;
}

export function throwingLayout(): Element {
  throw new Error("nested-layout");
}

export function throwingError(): Element {
  throw new Error("error-fn-boom");
}

export function jsonError(): Response {
  return Response.json({ error: "json-500" }, { status: 500 });
}

export function compactError(): Element {
  return <p id="frag-error">frag-error-ui</p>;
}

export function responseError(): Response {
  return new Response("no-splice", { status: 500 });
}

export function nestedMw(
  _ctx: WrapperCtx<AppState>,
  next: () => Promise<Response>,
): Promise<Response> {
  return next().then((res) => {
    res.headers.set("x-nested-mw", "1");
    return res;
  });
}

export function throwingMw(): Response {
  throw new Error("middleware-boom");
}

export function embedFragThrow(): Element {
  return (
    <div id="embed-throw">
      <RouteFragment src="/frag-throw" />
    </div>
  );
}

export function embedFragError(): Element {
  return (
    <div id="embed-error">
      <RouteFragment src="/frag-error" />
    </div>
  );
}

export function embedFragErrorResponse(): Element {
  return (
    <div id="embed-error-res">
      <RouteFragment src="/frag-error-response" />
    </div>
  );
}

export function embedFragErrorThrows(): Element {
  return (
    <div id="embed-error-throws">
      <RouteFragment src="/frag-error-throws" />
    </div>
  );
}

export function embedFragMiss(): Element {
  return (
    <div id="embed-miss">
      <RouteFragment src="/no-such-fragment" />
    </div>
  );
}
