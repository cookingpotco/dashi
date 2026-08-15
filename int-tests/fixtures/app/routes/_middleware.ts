import { type Middleware } from "dashi";

export class RootMiddleware implements Middleware {
  async preRender(req: Request) {
    await new Promise((resolve) => setTimeout(resolve, 25));
    req.headers.set("x-pre", "from-mw");
  }

  postRender(res: Response) {
    res.headers.set("x-mw", "ok");
  }
}
