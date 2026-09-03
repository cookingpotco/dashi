import type { WrapperCtx } from "dashi";

export function requireAuth(
  ctx: WrapperCtx,
  next: () => Promise<Response>,
): Promise<Response> {
  if (ctx.req.headers.get("authorization") === null) {
    return Promise.resolve(
      Response.redirect(new URL("/login", ctx.url), 303),
    );
  }
  return next();
}
