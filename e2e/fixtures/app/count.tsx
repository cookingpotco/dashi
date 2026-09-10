import { type ReadArgs, RouteSlot } from "dashi";

export function Count({ html }: ReadArgs) {
  return html(<RouteSlot src="/counted" />);
}
