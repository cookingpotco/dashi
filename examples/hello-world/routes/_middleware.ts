export default async function logger(
  req: Request,
  next: () => Promise<Response>,
) {
  console.log("Request on", req.url);
  const res = await next();
  console.log("Resposne OK", res.ok);
  return res;
}
