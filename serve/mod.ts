import { handle, init, type RouteTable } from "../routing/mod.ts";

/**
 * Starts the HTTP server.
 *
 * Layouts wrap a full-page hit, outermost first, and do not run on
 * fragment renders (eager `<RouteFragment>` or a lazy fetch). Middleware
 * is the request pipeline, outermost first, and runs for document hits
 * and fragment hits.
 *
 * @param table Root layouts, middleware, and nested routes.
 * @param options Forwarded to `Deno.serve`. `handler` is always the router.
 */
export function serve(
  table: RouteTable,
  options?: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler">,
) {
  init(table);
  Deno.serve({ ...options, handler: handle });
}
