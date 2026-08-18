import type { WrapCtx } from "dashi";

export default async function logger(
  ctx: WrapCtx,
  next: () => Promise<Response>,
): Promise<Response> {
  console.log("Request on", ctx.req.url);
  const res = await next();
  console.log("Resposne OK", res.ok);
  return res;
}
