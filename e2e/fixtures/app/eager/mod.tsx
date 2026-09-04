import { client, type ReadArgs, RouteFragment } from "dashi";

const EagerMark = client.element(
  "eager-el",
  new URL("./eager_client.ts", import.meta.url),
);

export function EagerFrag({ html }: ReadArgs) {
  return html(
    <div>
      <EagerMark />
      <RouteFragment src="/nested" />
    </div>,
  );
}
