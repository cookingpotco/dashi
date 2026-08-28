import { client, group } from "dashi";
import type { AppState } from "../state.ts";

const Widget = client.element(
  "widget-el",
  new URL("./widget_client.ts", import.meta.url),
);

export const widget = group<AppState>("/widget", ({ route }) => ({
  routes: [route("/", { GET: WidgetPage })],
}));

function WidgetPage() {
  return (
    <div>
      <h1 id="heading">widget</h1>
      <Widget />
      <a id="to-home" href="/">Home</a>
    </div>
  );
}
