import { type Ctx, type Html, RouteFragment, type WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";
import type { AppState } from "./state.ts";

export function NotFound(
  ctx: Ctx<Record<string, string>, AppState>,
  html: Html,
) {
  if (ctx.url.pathname === "/not-found-throws") {
    throw new Error("not-found-throws");
  }
  if (ctx.url.pathname === "/not-found-gone") {
    return html(<p id="gone">gone</p>, { status: 410 });
  }
  return html(<p id="not-found">custom-404</p>);
}

export function ApiNotFound(
  _ctx: Ctx<Record<string, string>, AppState>,
  html: Html,
) {
  return html(<p id="api-not-found">api-404</p>);
}

export function ApiV2NotFound(
  _ctx: Ctx<Record<string, string>, AppState>,
  html: Html,
) {
  return html(<p id="api-v2-not-found">api-v2-404</p>);
}

export function RootError(
  _ctx: WrapperCtx<AppState>,
  thrown: unknown,
  html: Html,
) {
  if (thrown instanceof Error && thrown.message === "error-handler-boom") {
    throw thrown;
  }
  if (thrown instanceof Error && thrown.message === "service-unavailable") {
    return html(<p id="error-503">unavailable</p>, { status: 503 });
  }
  return html(<p id="root-error">root-error</p>);
}

export function fatal(html: Html) {
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

export function okPage(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="ok-page">ok</p>);
}

export function nestedError(
  _ctx: WrapperCtx<AppState>,
  _thrown: unknown,
  html: Html,
) {
  return html(<p id="nested-error">nested-error</p>);
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

export function throwingLayout(): never {
  throw new Error("nested-layout");
}

export function throwingError(): never {
  throw new Error("error-fn-boom");
}

export function jsonError(): Response {
  return Response.json({ error: "json-500" }, { status: 500 });
}

export function compactError(
  _ctx: WrapperCtx<AppState>,
  _thrown: unknown,
  html: Html,
) {
  return html(<p id="frag-error">frag-error-ui</p>);
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

export function embedFragThrow(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="embed-throw">
      <RouteFragment src="/frag-throw" />
    </div>,
  );
}

export function embedFragError(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="embed-error">
      <RouteFragment src="/frag-error" />
    </div>,
  );
}

export function embedFragErrorResponse(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="embed-error-res">
      <RouteFragment src="/frag-error-response" />
    </div>,
  );
}

export function embedFragErrorThrows(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="embed-error-throws">
      <RouteFragment src="/frag-error-throws" />
    </div>,
  );
}

export function embedFragMiss(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="embed-miss">
      <RouteFragment src="/no-such-fragment" />
    </div>,
  );
}

export function messageError(
  _ctx: WrapperCtx<AppState>,
  thrown: unknown,
  html: Html,
) {
  return html(
    <p id="fragment-fault">
      {thrown instanceof Error ? thrown.message : String(thrown)}
    </p>,
  );
}

export function SelfInclude(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/self-include" />);
}

export function CycleA(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/cycle-b" />);
}

export function CycleB(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/cycle-a" />);
}

export function EmbedCycle(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/cycle-a" />);
}

export function CycleQuery(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/cycle-query?y=2" />);
}

export function EmbedCycleQuery(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/cycle-query?x=1" />);
}

export function DepthEmbed(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/d1" />);
}

export function Depth1(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/d2" />);
}

export function Depth2(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/d3" />);
}

export function Depth3(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/d4" />);
}

export function Depth4(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/d5" />);
}

export function Depth5(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<RouteFragment src="/d6" />);
}

export function Depth6(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(<p id="depth-leaf">depth-leaf</p>);
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

export async function Slow(
  ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  await delay(1000, ctx.req.signal);
  return html(<p id="slow">slow-body</p>);
}

export async function SlowShort(
  ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  await delay(150, ctx.req.signal);
  return html(
    <div>
      <p id="slow-short">slow-short-body</p>
      <RouteFragment src="/wait-out" />
    </div>,
  );
}

export async function WaitOut(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return html(<p id="wait-out">wait-out-body</p>);
}

export function EmbedSlow(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="embed-slow">
      <RouteFragment src="/slow" timeout={50} />
      <RouteFragment src="/peer" />
    </div>,
  );
}

export function EmbedSlowEmpty(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="embed-slow-empty">
      <RouteFragment src="/slow-no-error" timeout={50} />
      <RouteFragment src="/peer" />
    </div>,
  );
}

export function EmbedSlowHeld(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
  return html(
    <div id="embed-slow-held">
      <div id="slow-held">
        <RouteFragment src="/slow-short" timeout={50} />
      </div>
      <div id="held">
        <RouteFragment src="/wait-out" />
      </div>
    </div>,
  );
}
