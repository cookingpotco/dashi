import { type Element } from "../jsx-runtime/mod.ts";
import {
  type GroupBag,
  type GroupFields,
  handle,
  init,
} from "../routing/mod.ts";

/**
 * Starts the HTTP server.
 *
 * The first argument is the root table callback. Nested and prefixed
 * groups use the bag's `group`. The root itself is pathless; `notFound`
 * here is the default 404. Layouts wrap the route on document render,
 * outermost first, and do not run on fragment renders. Middleware is
 * the request pipeline, outermost first, and runs for document hits and
 * fragment hits. `error` catches handler throws and inner group
 * failures. `errorFallback` is the last-resort 500 value when the error
 * walk is exhausted.
 *
 * @param build Root table. Pathless; nested prefixes live on the bag's
 * `group`.
 * @param options Forwarded to `Deno.serve`, plus `errorFallback`.
 * `handler` is always the router.
 */
export function serve<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  build: (bag: GroupBag<"", State>) => GroupFields<State>,
  options?: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler"> & {
    /**
     * Last-resort 500 value: no layouts, no `ctx`, no `thrown`.
     * `Element` becomes 500 HTML with DOCTYPE; `Response` is sent
     * as-is. Omitted: `new Response("Something Went Wrong", {
     * status: 500 })`.
     */
    errorFallback?: Element | Response;
  },
) {
  const { errorFallback, ...serveOptions } = options ?? {};
  init(build, errorFallback);
  Deno.serve({ ...serveOptions, handler: handle });
}
