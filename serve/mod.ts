import { handle, init, type RouteTable } from "../routing/mod.ts";

/**
 * Root wrap lists plus nested `group()` / `route()` nodes. Parent wraps run
 * first. Remaining options go to `Deno.serve` except `handler`, which is
 * always the router.
 */
export function serve(
  options: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler"> & RouteTable,
) {
  const { layouts, middleware, routes, ...serveOptions } = options;
  init({ layouts, middleware, routes });
  Deno.serve({ ...serveOptions, handler: handle });
}
