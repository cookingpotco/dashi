import { type ReadArgs } from "dashi";

export async function Slow({ html }: ReadArgs) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return html(<p id="slow-body">slow-body</p>);
}
