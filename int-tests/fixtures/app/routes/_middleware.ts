export default async function root(
  req: Request,
  next: () => Promise<Response>,
) {
  await new Promise((resolve) => setTimeout(resolve, 25));
  req.headers.set("x-pre", "from-mw");
  const res = await next();
  res.headers.set("x-mw", "ok");
  return res;
}
