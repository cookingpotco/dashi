import { handle, init } from "../routing/mod.ts";
import { type Route } from "../routing/path.ts";

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
