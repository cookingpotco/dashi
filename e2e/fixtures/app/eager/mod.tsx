import { client, type Ctx, RouteFragment, type SealHtml } from "dashi";

const EagerMark = client.element(
  "eager-el",
  new URL("./eager_client.ts", import.meta.url),
);

export function EagerFrag(_ctx: Ctx, html: SealHtml) {
  return html(
    <div>
      <EagerMark />
      <RouteFragment src="/nested" />
    </div>,
  );
}
