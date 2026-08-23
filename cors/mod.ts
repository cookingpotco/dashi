import { mergeVary } from "../caching/mod.ts";
import { METHODS, type Middleware } from "../shared/mod.ts";

export type CorsOrigin =
  | string
  | readonly string[]
  | ((origin: string) => string | undefined);

interface CorsOptionsBase {
  origin?: CorsOrigin;
  allowMethods?: readonly string[];
  allowHeaders?: readonly string[];
  exposeHeaders?: readonly string[];
  maxAge?: number;
}

export type CorsOptions =
  | (CorsOptionsBase & { credentials?: false })
  | (CorsOptionsBase & { origin: CorsOrigin; credentials: true });

function allowOrigin(
  origin: CorsOrigin,
  requestOrigin: string | null,
): string | undefined {
  if (origin === "*") {
    return "*";
  }
  if (requestOrigin === null) {
    return undefined;
  }
  if (typeof origin === "function") {
    return origin(requestOrigin);
  }
  if (typeof origin === "string") {
    return origin === requestOrigin ? requestOrigin : undefined;
  }
  return origin.includes(requestOrigin) ? requestOrigin : undefined;
}

function assignCorsHeaders(
  headers: Headers,
  allowedOrigin: string | undefined,
  credentials: boolean | undefined,
  exposeHeaders: string | undefined,
  varyOrigin: boolean,
): void {
  if (allowedOrigin !== undefined) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
  }
  if (credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  if (exposeHeaders) {
    headers.set("Access-Control-Expose-Headers", exposeHeaders);
  }
  if (varyOrigin) {
    mergeVary(headers, ["Origin"]);
  }
}

/**
 * CORS middleware. Attach on `group()`.
 *
 * OPTIONS returns 204 with CORS headers and does not call `next()`.
 * Other methods call `next()` and add CORS headers to that response.
 */
export function cors<
  State extends Record<string, unknown> = Record<PropertyKey, never>,
>(options: CorsOptions = {}): Middleware<State> {
  const origin = options.origin ?? "*";
  const allowMethods = (options.allowMethods ?? METHODS).join(", ");
  const exposeHeaders = options.exposeHeaders?.join(", ");
  const varyOrigin = origin !== "*";

  return async (ctx, next) => {
    const allowed = allowOrigin(origin, ctx.req.headers.get("Origin"));

    if (ctx.req.method === "OPTIONS") {
      const headers = new Headers();
      assignCorsHeaders(
        headers,
        allowed,
        options.credentials,
        exposeHeaders,
        varyOrigin,
      );
      if (allowMethods) {
        headers.set("Access-Control-Allow-Methods", allowMethods);
      }
      const allowHeaders = options.allowHeaders !== undefined
        ? options.allowHeaders.join(", ")
        : ctx.req.headers.get("Access-Control-Request-Headers") ?? "";
      if (allowHeaders) {
        headers.set("Access-Control-Allow-Headers", allowHeaders);
      }
      if (options.maxAge != null) {
        headers.set("Access-Control-Max-Age", String(options.maxAge));
      }
      return new Response(null, { status: 204, headers });
    }

    const res = await next();
    assignCorsHeaders(
      res.headers,
      allowed,
      options.credentials,
      exposeHeaders,
      varyOrigin,
    );
    return res;
  };
}
