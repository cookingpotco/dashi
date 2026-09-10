import { type ReadArgs, RouteSlot } from "dashi";

export function EmbedCycle({ html }: ReadArgs) {
  return html(<RouteSlot src="/cycle-a" />);
}
