import { Route } from "dashi";

export class HomeRoute implements Route {
  render(req: Request) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const title = url.searchParams.get("title") ?? "";
    return <p title={title}>{q}</p>;
  }
}
