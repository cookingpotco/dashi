import { client } from "dashi";

const Widget = client.element(
  "widget-el",
  new URL("./widget_client.ts", import.meta.url),
);

export function WidgetPage() {
  return (
    <div>
      <h1 id="heading">widget</h1>
      <Widget />
      <a id="to-home" href="/">Home</a>
    </div>
  );
}
