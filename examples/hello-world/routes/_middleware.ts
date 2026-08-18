import type { Middleware } from "dashi";

const logger: Middleware = async (ctx, next) => {
  console.log("Request on", ctx.req.url);
  const res = await next();
  console.log("Resposne OK", res.ok);
  return res;
};

export default logger;
