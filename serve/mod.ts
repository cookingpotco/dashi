import { compileClient } from "../client/mod.ts";
import type { Element } from "../jsx-runtime/mod.ts";
import {
  type GroupCallback,
  type GroupFields,
  handle,
  init,
} from "../routing/mod.ts";

/**
 * Starts the HTTP server.
 *
 * The first argument is the root table callback. The root itself is
 * pathless; `notFound` here is the default 404. One-path pages are
 * `route()` entries. Prefixed subtrees and wrap shells are `group()`
 * values in `routes`. Layouts wrap the route on document render,
 * outermost first, and do not run on fragment renders. Middleware is
 * the request pipeline, outermost first, and runs for document hits
 * and fragment hits. `error` catches handler throws and inner group
 * failures. `fatal` is the last-resort 500 value when the error walk
 * is exhausted.
 *
 * Compiles the client graph, then returns the `Deno.HttpServer` that
 * `Deno.serve` returns. Callers that only boot a process may omit
 * `await`.
 *
 * @param build Root table. Pathless. One-path pages are `route()`
 * entries here; nested prefixes and wrap shells live on imported
 * `group()` values in `routes`.
 * @param options Forwarded to `Deno.serve`, plus `fatal` and
 * `fragmentDepthLimit`. `handler` is always the router.
 *
 * @example
 * ```ts
 * import { serve } from "dashi";
 *
 * serve(({ route }) => ({
 *   routes: [route("/", { GET: () => <h1>Hi</h1> })],
 * }));
 * ```
 */
export async function serve<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  build: (cb: GroupCallback<"", State>) => GroupFields<State>,
  options?: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler"> & {
    /**
     * Last-resort 500 value: no layouts, no `ctx`, no `thrown`.
     * `Element` becomes 500 HTML with DOCTYPE; `Response` is sent
     * as-is. Omitted: `new Response("Something Went Wrong", {
     * status: 500 })`.
     */
    fatal?: Element | Response;
    /**
     * Max eager include chain length. Omitted is 5. A longer chain
     * fails the request.
     */
    fragmentDepthLimit?: number;
  },
): Promise<Deno.HttpServer> {
  const { fatal, fragmentDepthLimit, ...serveOptions } = options ?? {};
  init(build, fatal, fragmentDepthLimit);
  await compileClient();
  return Deno.serve({ ...serveOptions, handler: handle });
}
