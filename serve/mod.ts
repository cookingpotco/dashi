import { compileClient } from "../client/mod.ts";
import { Logger } from "../logging/mod.ts";
import {
  type GroupCallback,
  type GroupFields,
  handle,
  init,
} from "../routing/mod.ts";
import type { FatalArgs } from "../shared/mod.ts";
import { bindUrls, grantedNetworkInterfaces } from "./bind_urls.ts";

/**
 * Starts the HTTP server from a pathless root table.
 *
 * @param build Root table callback. `route()` and `group()` values go in `routes`.
 * @param options Forwarded to `Deno.serve`, plus `fatal`.
 *
 * @example
 * ```ts
 * import { serve } from "dashi";
 *
 * serve(({ route }) => ({
 *   routes: [route("/", { GET: ({ html }) => html(<h1>Hi</h1>) })],
 * }));
 * ```
 *
 * @see https://dashi.run/docs/routing#serve
 */
export async function serve<
  State extends Record<string, unknown> = Record<string, unknown>,
>(
  build: (cb: GroupCallback<"/", State>) => GroupFields<State>,
  options?: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler"> & {
    /**
     * Last-resort 500: no layouts, no `ctx`, no `thrown`. Call
     * `html()` to seal 500 HTML with DOCTYPE; a raw `Response` is
     * sent as-is. Omitted: `new Response("Something Went Wrong", {
     * status: 500 })`.
     */
    fatal?: (args: FatalArgs) => Response | Promise<Response>;
  },
): Promise<Deno.HttpServer> {
  const {
    fatal,
    onListen,
    ...serveOptions
  } = options ?? {};
  init(build, fatal);
  await compileClient();
  return Deno.serve({
    ...serveOptions,
    onListen(addr) {
      const interfaces = addr.hostname === "0.0.0.0" || addr.hostname === "::"
        ? grantedNetworkInterfaces()
        : [];
      const urls = bindUrls(addr.hostname, addr.port, interfaces);
      Logger.info(["serve"], `Listening on ${urls.join(", ")}`);
      onListen?.(addr);
    },
    handler: handle,
  });
}
