import { client, type Ctx, type SealHtml } from "dashi";
import type { AppState } from "../state.ts";

const Widget = client.element(
  "widget-el",
  new URL("./widget_client.ts", import.meta.url),
);

export function WidgetPage(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: SealHtml,
) {
  return html(
    <div>
      <h1 id="heading">widget</h1>
      <Widget />
      <a id="to-home" href="/">Home</a>
    </div>,
  );
}
