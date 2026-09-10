import type { MiddlewareArgs } from "dashi";

export async function logger({ ctx, next }: MiddlewareArgs): Promise<Response> {
  const start = performance.now();
  console.log(ctx.req.method, ctx.url.pathname);
  const res = await next();
  const ms = Math.round(performance.now() - start);
  console.log(ctx.req.method, ctx.url.pathname, res.status, `${ms}ms`);
  return res;
}
