import { client, type Ctx, type Html, RouteFragment } from "dashi";

const EagerMark = client.element(
  "eager-el",
  new URL("./eager_client.ts", import.meta.url),
);

export function EagerFrag(_ctx: Ctx, html: Html) {
  return html(
    <div>
      <EagerMark />
      <RouteFragment src="/nested" />
    </div>,
  );
}
