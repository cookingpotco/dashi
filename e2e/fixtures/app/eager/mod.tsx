import { client, RouteFragment } from "dashi";

const EagerMark = client.element(
  "eager-el",
  new URL("./eager_client.ts", import.meta.url),
);

export function EagerFrag() {
  return (
    <div>
      <EagerMark />
      <RouteFragment src="/nested" />
    </div>
  );
}
