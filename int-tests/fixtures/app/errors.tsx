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

export function ApiV2NotFound(): Element {
  return <p id="api-v2-not-found">api-v2-404</p>;
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

export const fatal = (
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

export function messageError(
  _ctx: WrapperCtx<AppState>,
  thrown: unknown,
): Element {
  return (
    <p id="fragment-fault">
      {thrown instanceof Error ? thrown.message : String(thrown)}
    </p>
  );
}

export function SelfInclude(): Element {
  return <RouteFragment src="/self-include" />;
}

export function CycleA(): Element {
  return <RouteFragment src="/cycle-b" />;
}

export function CycleB(): Element {
  return <RouteFragment src="/cycle-a" />;
}

export function EmbedCycle(): Element {
  return <RouteFragment src="/cycle-a" />;
}

export function CycleQuery(): Element {
  return <RouteFragment src="/cycle-query?y=2" />;
}

export function EmbedCycleQuery(): Element {
  return <RouteFragment src="/cycle-query?x=1" />;
}

export function DepthEmbed(): Element {
  return <RouteFragment src="/d1" />;
}

export function Depth1(): Element {
  return <RouteFragment src="/d2" />;
}

export function Depth2(): Element {
  return <RouteFragment src="/d3" />;
}

export function Depth3(): Element {
  return <RouteFragment src="/d4" />;
}

export function Depth4(): Element {
  return <RouteFragment src="/d5" />;
}

export function Depth5(): Element {
  return <RouteFragment src="/d6" />;
}

export function Depth6(): Element {
  return <p id="depth-leaf">depth-leaf</p>;
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
): Promise<Element> {
  await delay(1000, ctx.req.signal);
  return <p id="slow">slow-body</p>;
}

export async function SlowShort(
  ctx: Ctx<Record<string, never>, AppState>,
): Promise<Element> {
  await delay(150, ctx.req.signal);
  return (
    <div>
      <p id="slow-short">slow-short-body</p>
      <RouteFragment src="/wait-out" />
    </div>
  );
}

export async function WaitOut(): Promise<Element> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return <p id="wait-out">wait-out-body</p>;
}

export function EmbedSlow(): Element {
  return (
    <div id="embed-slow">
      <RouteFragment src="/slow" timeout={50} />
      <RouteFragment src="/peer" />
    </div>
  );
}

export function EmbedSlowEmpty(): Element {
  return (
    <div id="embed-slow-empty">
      <RouteFragment src="/slow-no-error" timeout={50} />
      <RouteFragment src="/peer" />
    </div>
  );
}

export function EmbedSlowHeld(): Element {
  return (
    <div id="embed-slow-held">
      <div id="slow-held">
        <RouteFragment src="/slow-short" timeout={50} />
      </div>
      <div id="held">
        <RouteFragment src="/wait-out" />
      </div>
    </div>
  );
}
