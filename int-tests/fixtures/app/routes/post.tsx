import type { ParamsOf } from "dashi";

export default function Post(
  _req: Request,
  params: ParamsOf<"/posts/:id">,
) {
  return <p id="post">{params.id}</p>;
}
