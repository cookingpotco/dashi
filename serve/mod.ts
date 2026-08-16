import { handle, init, type RouteTable } from "../routing/mod.ts";

/**
 * Starts the HTTP server.
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
