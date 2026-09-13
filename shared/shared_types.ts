import type { CacheConfig } from "../caching/mod.ts";
import type { Patch } from "../patching/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";

/**
 * Per-invocation request context. Mutate `state` in place; do not replace the object.
 *
 * @example
 * ```ts
 * export function show({ ctx, html }: ReadArgs<{ params: { id: string } }>) {
 *   return html(<p>{ctx.params.id}</p>);
 * }
 * ```
 *
 * @see https://dashi.run/docs/handlers#ctx
 */
export interface Ctx<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> {
  /** Incoming request. */
  readonly req: Request;
  /** Request URL. */
  readonly url: URL;
  /** Path params from the matched route. */
  readonly params: Params;
  /** Per-request state. Mutate fields in place; do not replace the object. */
  readonly state: Partial<State>;
}

/**
 * `Ctx` as seen by middleware or an error handler. Params are a wide string record.
 *
 * @example
 * ```ts
 * export async function session({ ctx, next }: MiddlewareArgs) {
 *   return next();
 * }
 * ```
 *
 * @see https://dashi.run/docs/handlers#ctx
 */
export type WrapperCtx<
  State extends Record<string, unknown> = Record<string, unknown>,
> = Ctx<State, Record<string, string>>;

/**
 * `Ctx` as seen by a layout. Same object as the handler's ctx; `state` is readonly.
 *
 * @example
 * ```ts
 * export function RootLayout({ ctx, children }: LayoutArgs) {
 *   return <html>{children}</html>;
 * }
 * ```
 *
 * @see https://dashi.run/docs/layouts-middleware-errors#layouts
 */
export type LayoutCtx<
  State extends Record<string, unknown> = Record<string, unknown>,
> = Omit<WrapperCtx<State>, "state"> & {
  readonly state: Readonly<Partial<State>>;
};

/**
 * GET / HEAD args. Call `html()` to seal markup, or return a raw `Response`.
 *
 * @example
 * ```ts
 * export function Home({ html }: ReadArgs) {
 *   return html(<h1>Hello</h1>);
 * }
 * ```
 *
 * @see https://dashi.run/docs/handlers#read-handler
 */
export interface ReadArgs<
  T extends
    & {
      state?: Record<string, unknown>;
      params?: Record<string, string>;
    }
    & { [K in Exclude<keyof T, "state" | "params">]: never } = Record<
      never,
      never
    >,
> {
  /** Per-invocation request context. */
  ctx: Ctx<
    T extends { state: infer S extends Record<string, unknown> } ? S
      : Record<string, unknown>,
    T extends { params: infer P extends Record<string, string> } ? P
      : Record<string, never>
  >;
  /** Bound HTML sealer. */
  html: SealHtml;
}

/**
 * POST / PUT / PATCH / DELETE args. Call `patches()` or return a raw `Response`.
 *
 * @example
 * ```ts
 * export function add({ patches }: WriteArgs) {
 *   return patches([patch.append("#todos", <li>milk</li>)]);
 * }
 * ```
 *
 * @see https://dashi.run/docs/handlers#write-handler
 */
export interface WriteArgs<
  T extends
    & {
      state?: Record<string, unknown>;
      params?: Record<string, string>;
    }
    & { [K in Exclude<keyof T, "state" | "params">]: never } = Record<
      never,
      never
    >,
> {
  /** Per-invocation request context. */
  ctx: Ctx<
    T extends { state: infer S extends Record<string, unknown> } ? S
      : Record<string, unknown>,
    T extends { params: infer P extends Record<string, string> } ? P
      : Record<string, never>
  >;
  /** Bound patch sealer. */
  patches: SealPatches;
}

/**
 * `notFound` args. Same fields as `ReadArgs`; params are a wide string record.
 *
 * @example
 * ```ts
 * export function notFound({ html }: NotFoundArgs) {
 *   return html(<p>Not found</p>);
 * }
 * ```
 *
 * @see https://dashi.run/docs/layouts-middleware-errors#errors
 */
export type NotFoundArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
> = ReadArgs<{ state: State; params: Record<string, string> }>;

/**
 * Group `error` args. `thrown` is the raw value.
 *
 * @example
 * ```ts
 * export function error({ html }: ErrorArgs) {
 *   return html(<p>Something went wrong</p>);
 * }
 * ```
 *
 * @see https://dashi.run/docs/layouts-middleware-errors#errors
 */
export interface ErrorArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Per-invocation request context. */
  ctx: WrapperCtx<State>;
  /** Raw thrown value. */
  thrown: unknown;
  /** Bound HTML sealer. Default status 500. */
  html: SealHtml;
}

/**
 * Last-resort 500 args. No `ctx`, no `thrown`.
 *
 * @example
 * ```ts
 * export function fatal({ html }: FatalArgs) {
 *   return html(<p>The site could not recover</p>);
 * }
 * ```
 *
 * @see https://dashi.run/docs/layouts-middleware-errors#errors
 */
export interface FatalArgs {
  /** Bound HTML sealer. Default status 500. No layouts. */
  html: SealHtml;
}

/**
 * Layout args. `ctx.state` is readonly.
 *
 * @example
 * ```ts
 * export function RootLayout({ children }: LayoutArgs) {
 *   return <html><body>{children}</body></html>;
 * }
 * ```
 *
 * @see https://dashi.run/docs/layouts-middleware-errors#layouts
 */
export interface LayoutArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Per-invocation request context. `state` is readonly. */
  ctx: LayoutCtx<State>;
  /** Wrapped route output. */
  children: Element;
}

/**
 * Middleware args. Mutate `ctx.state` in place.
 *
 * @example
 * ```ts
 * export async function session({ ctx, next }: MiddlewareArgs) {
 *   return next();
 * }
 * ```
 *
 * @see https://dashi.run/docs/layouts-middleware-errors#middleware
 */
export interface MiddlewareArgs<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Per-invocation request context. Mutate `state` in place. */
  ctx: WrapperCtx<State>;
  /** Next middleware or the matched handler. */
  next: () => Promise<Response>;
}

/**
 * Seal-time options for `html()`.
 *
 * @example
 * ```ts
 * return html(<h1>Gone</h1>, { status: 410 });
 * ```
 *
 * @see https://dashi.run/docs/handlers#read-handler
 */
export interface SealOptions {
  /** Document HTTP status. Omitted uses the call site default. */
  status?: number;
  /** Cache policy. Omitted is no-store, plus `Vary: x-slot`. */
  cache?: CacheConfig;
}

/**
 * Seal-time options for `patches()`.
 *
 * @example
 * ```ts
 * return patches([patch.remove("#notice")], { status: 422 });
 * ```
 *
 * @see https://dashi.run/docs/handlers#write-handler
 */
export interface SealPatchesOptions {
  /** Patch response HTTP status. Omitted is 200. */
  status?: number;
}

/**
 * Bound HTML sealer. Walks layouts on a document hit; slot hits skip layouts.
 *
 * @example
 * ```ts
 * export function Home({ html }: ReadArgs) {
 *   return html(<h1>Hello</h1>);
 * }
 * ```
 *
 * @see https://dashi.run/docs/handlers#read-handler
 */
export type SealHtml = (
  page: Element,
  opts?: SealOptions,
) => Response | Promise<Response>;

/**
 * Bound patch sealer. Never walks layouts. Default status 200. Always no-store.
 *
 * @example
 * ```ts
 * export function add({ patches }: WriteArgs) {
 *   return patches([patch.append("#todos", <li>milk</li>)]);
 * }
 * ```
 *
 * @see https://dashi.run/docs/handlers#write-handler
 */
export type SealPatches = (
  list: readonly Patch[],
  opts?: SealPatchesOptions,
) => Response | Promise<Response>;

/**
 * Last-resort 500. No layouts, no `ctx`, no `thrown`. Omitted: text 500.
 *
 * @internal
 */
export type Fatal = (args: FatalArgs) => Response | Promise<Response>;

/**
 * Route function. Always returns a `Response`. Call `html()` to seal
 * document or slot markup (layouts, DOCTYPE, default cache headers).
 * A raw `Response` is sent as-is: no layouts or DOCTYPE.
 *
 * Only the router calls a handler. A direct call skips the target's
 * middleware and error boundary and leaves it reading the caller's
 * `ctx`. Share markup as a component; client-fetch a route with
 * `<RouteSlot src>`.
 */
/** @internal */
export type Handler<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> = (
  args: ReadArgs<{ state: State; params: Params }>,
) => Response | Promise<Response>;

/**
 * Group error UI. `thrown` is the raw value. Call `html()` to seal
 * markup (remaining layouts from this boundary; slot hits: this
 * group's `error` only). A raw `Response` is sent as-is. Default
 * status 500.
 */
/** @internal */
export type ErrorHandler<
  State extends Record<string, unknown> = Record<string, unknown>,
> = (
  args: ErrorArgs<State>,
) => Response | Promise<Response>;

/**
 * Methods the router advertises. GET also answers HEAD; every matched
 * path answers OPTIONS. HEAD and OPTIONS are not handler keys on the
 * route map.
 */
/** @internal */
export const METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
] as const;
/** @internal */
export type Method = typeof METHODS[number];

/**
 * POST/PUT/PATCH/DELETE. Call `patches()` to seal a patch list, or
 * return a raw `Response`. Patches never walk layouts.
 */
/** @internal */
export type WriteHandler<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> = (
  args: WriteArgs<{ state: State; params: Params }>,
) => Response | Promise<Response>;

type HandlerMethod = Exclude<Method, "HEAD" | "OPTIONS">;

type MethodHandlerMap<
  State extends Record<string, unknown>,
  Params extends Record<string, string>,
> = {
  [M in HandlerMethod]?: M extends "GET" ? Handler<State, Params>
    : WriteHandler<State, Params>;
};

type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

/**
 * Per-method handlers on a route. At least one method is required. GET
 * seals a page or slot body with `html()`. Writes seal patches with
 * `patches()`, or return a Response.
 *
 * @internal
 */
export type MethodHandlers<
  State extends Record<string, unknown> = Record<string, unknown>,
  Params extends Record<string, string> = Record<string, never>,
> = RequireAtLeastOne<MethodHandlerMap<State, Params>>;

/**
 * Shared UI that wraps the route on document render, outermost first.
 * Runs after the route has rendered. Does not run on slot renders.
 * Never use a layout for
 * gating or state-setting — that belongs on middleware or individual
 * route handlers.
 */
/** @internal */
export type Layout<
  State extends Record<string, unknown> = Record<string, unknown>,
> = (
  args: LayoutArgs<State>,
) => Element | Promise<Element>;

/**
 * Request pipeline, outermost first. Runs for document hits and slot
 * hits.
 */
/** @internal */
export type Middleware<
  State extends Record<string, unknown> = Record<string, unknown>,
> = (
  args: MiddlewareArgs<State>,
) => Response | Promise<Response>;

/**
 * One group's layouts, optional `error`, and optional `notFound`.
 * `parent` is the enclosing group, if any. A group's `error` catches
 * handler throws and inner group failures; it does not catch that
 * group's own layouts. `notFound` handles document misses captured
 * here; omitted walks to the parent.
 */
/** @internal */
export interface GroupBoundary<
  State extends Record<string, unknown> = Record<string, unknown>,
> {
  layouts: Layout<State>[];
  error?: ErrorHandler<State>;
  notFound?: Handler<State, Record<string, string>>;
  parent?: GroupBoundary<State>;
}
