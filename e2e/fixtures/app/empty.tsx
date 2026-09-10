import { type ReadArgs, RouteSlot } from "dashi";

export function Empty({ html }: ReadArgs) {
  return html(<RouteSlot src="/empty-fail" />);
}
