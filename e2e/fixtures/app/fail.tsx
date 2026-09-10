import { type ReadArgs, RouteSlot } from "dashi";

export function Fail({ html }: ReadArgs) {
  return html(<RouteSlot src="/fail-slot" />);
}
