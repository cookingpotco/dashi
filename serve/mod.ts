import { parseRoutesDir } from "../fs/mod.ts";
import * as routing from "../routing/mod.ts";

/** Forwards `options` to `Deno.serve` except `handler`, which is always the router. */
export async function serveFileBased(
  options: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler"> = {},
) {
  const rootDir = Deno.mainModule.replace(/\/[^\/]*$/, "");
  const routesDir = `${rootDir}/routes/`;

  const paths = await parseRoutesDir({ dir: routesDir });
  routing.init(paths);

  Deno.serve({ ...options, handler: routing.handle });
}
