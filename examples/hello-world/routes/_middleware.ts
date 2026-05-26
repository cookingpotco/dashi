import { type Middleware } from "saffron";

export class RootMiddleware implements Middleware {
  async handle(req: Request, next: () => Promise<Response>) {
    console.log("Request on", req.url);
    const res = await next();
    console.log("Resposne", res.body);
  }
}
