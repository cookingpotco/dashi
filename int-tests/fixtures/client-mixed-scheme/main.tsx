import { client, type ReadArgs, serve } from "dashi";

const Local = client.element(
  "local-el",
  new URL("./local_client.ts", import.meta.url),
);

// Same specifier a JSR consumer gets from
// `new URL("./route_slot_client.ts", import.meta.url)` on a
// published host.
const JsrSlot = client.module(
  new URL(import.meta.resolve("dashi-jsr-slot")),
);

function home({ html }: ReadArgs) {
  return html(
    <html>
      <Local>local</Local>
      <JsrSlot />
    </html>,
  );
}

export function start() {
  return serve(({ route }) => ({
    routes: [
      route("/", { GET: home }),
    ],
  }), { hostname: "127.0.0.1", port: 0 });
}
