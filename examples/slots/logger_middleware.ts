import type { MiddlewareArgs } from "dashi";

export async function logger({ ctx, next }: MiddlewareArgs): Promise<Response> {
  console.log("Request on", ctx.req.url);
  const res = await next();
  console.log("Resposne OK", res.ok);
  return res;
}
