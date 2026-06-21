import { type Middleware } from "dashi";

export class RootMiddleware implements Middleware {
  preRender(req: Request) {
    console.log("Request on", req.url);
  }

  postRender(res: Response) {
    console.log("Resposne OK", res.ok);
  }
}
