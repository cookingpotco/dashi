import type { MiddlewareArgs } from "dashi";

export async function logger({ ctx, next }: MiddlewareArgs): Promise<Response> {
  console.log(ctx.req.method, ctx.url.pathname);
  return await next();
}
