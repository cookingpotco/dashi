import { client, type ReadArgs, RouteSlot } from "dashi";

const StampedMark = client.element(
  "stamped-el",
  new URL("./stamped_client.ts", import.meta.url),
);

export function StampedSlot({ html }: ReadArgs) {
  return html(
    <div>
      <StampedMark />
      <RouteSlot src="/nested" />
    </div>,
  );
}
