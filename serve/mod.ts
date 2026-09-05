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
 * Starts the HTTP server.
 *
 * The first argument is the root table callback. The root itself is
 * pathless; `notFound` here is the default 404. `routes` holds `route()`
 * entries and `group()` values. Layouts are shared UI only. They wrap
 * the route on document render, outermost first, after the route has
 * rendered, and do not run on fragment renders. Never use them for
 * gating or state-setting — that belongs on middleware or individual
 * route handlers. Middleware is the request pipeline, outermost first,
 * and runs for document hits and fragment hits. `error` catches
 * handler throws and inner group failures. `fatal` is the last-resort
 * 500 value when the error walk is exhausted.
 *
 * Compiles the client graph, then returns the `Deno.HttpServer` that
 * `Deno.serve` returns. Callers that only boot a process may omit
 * `await`. On listen, logs one `Listening on` line with localhost and,
 * when bound on all interfaces, each non-loopback IPv4 LAN URL. A
 * caller `onListen` runs after that line.
 *
 * @param build Root table. Pathless. `route()` and `group()` values go
 * in `routes`.
 * @param options Forwarded to `Deno.serve`, plus `fatal` and
 * `fragmentDepthLimit`. `handler` is always the router.
 *
 * @example
 * ```ts
 * import { serve } from "dashi";
 *
 * serve(({ route }) => ({
 *   routes: [route("/", { GET: ({ html }) => html(<h1>Hi</h1>) })],
 * }));
 * ```
 */
export async function serve<
  State extends Record<string, unknown> = Record<string, unknown>,
>(
  build: (cb: GroupCallback<"", State>) => GroupFields<State>,
  options?: Omit<Deno.ServeTcpOptions & Deno.ServeInit, "handler"> & {
    /**
     * Last-resort 500: no layouts, no `ctx`, no `thrown`. Call
     * `html()` to seal 500 HTML with DOCTYPE; a raw `Response` is
     * sent as-is. Omitted: `new Response("Something Went Wrong", {
     * status: 500 })`.
     */
    fatal?: (args: FatalArgs) => Response | Promise<Response>;
    /**
     * Max eager include chain length. Omitted is 5. A longer chain
     * fails the request.
     */
    fragmentDepthLimit?: number;
  },
): Promise<Deno.HttpServer> {
  const {
    fatal,
    fragmentDepthLimit,
    onListen,
    ...serveOptions
  } = options ?? {};
  init(build, fatal, fragmentDepthLimit);
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
