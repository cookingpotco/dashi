import { handle, init, type ServeTable } from "../routing/mod.ts";

export type { ServeTable };

/**
 * Starts the HTTP server.
 *
 * Layouts are UI that wraps the route on document render, outermost
 * first, and do not run on fragment renders (eager `<RouteFragment>` or
 * a lazy fetch). Middleware is the request pipeline, outermost first,
 * and runs for document hits and fragment hits. `error` catches handler
 * throws and inner group failures. `notFound` is the miss handler;
 * `errorFallback` is the last-resort 500 value when the error walk is
 * exhausted.
 *
 * @param table Root layouts, middleware, error UI, and nested routes.
 * @param options Forwarded to `Deno.serve`. `handler` is always the router.
 */
export function serve<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(
  table: ServeTable<State>,
  options?: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler">,
) {
  init(table);
  Deno.serve({ ...options, handler: handle });
}
