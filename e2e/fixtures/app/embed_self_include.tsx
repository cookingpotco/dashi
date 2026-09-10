import { type ReadArgs, RouteSlot } from "dashi";

export function EmbedSelfInclude({ html }: ReadArgs) {
  return html(<RouteSlot src="/self-include" />);
}
