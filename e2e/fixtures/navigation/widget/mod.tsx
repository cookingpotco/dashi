import { client, type ReadArgs } from "dashi";
import type { AppState } from "../state.ts";

const Widget = client.element(
  "widget-el",
  new URL("./widget_client.ts", import.meta.url),
);

export function WidgetPage(
  { html }: ReadArgs<Record<string, never>, AppState>,
) {
  return html(
    <div>
      <h1 id="heading">widget</h1>
      <Widget />
      <a id="to-home" href="/">Home</a>
    </div>,
  );
}
