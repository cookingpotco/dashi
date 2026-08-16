import { handle, init, type Route } from "../routing/mod.ts";

/** Forwards remaining options to `Deno.serve` except `handler`, which is always the router. */
export function serve(
  options: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler"> & {
    routes: Route[];
  },
) {
  const { routes, ...serveOptions } = options;
  init(routes);
  Deno.serve({ ...serveOptions, handler: handle });
}
