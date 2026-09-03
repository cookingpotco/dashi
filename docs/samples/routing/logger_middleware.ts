import type { WrapperCtx } from "dashi";

export async function logger(
  ctx: WrapperCtx,
  next: () => Promise<Response>,
): Promise<Response> {
  const started = Date.now();
  const res = await next();
  console.log(
    `${ctx.req.method} ${ctx.url.pathname} ${res.status} ${
      Date.now() - started
    }ms`,
  );
  return res;
}
