import { client, serve } from "dashi";

const Local = client.element(
  "local-el",
  new URL("./local_client.ts", import.meta.url),
);

// Same specifier a JSR consumer gets from
// `new URL("./route_fragment_client.ts", import.meta.url)` on a
// published host.
const JsrFragment = client.module(
  new URL(
    "https://jsr.io/@cookingpot/dashi/0.6.0/fragments/route_fragment_client.ts",
  ),
);

function home() {
  return (
    <html>
      <Local>local</Local>
      <JsrFragment />
    </html>
  );
}

export function start() {
  return serve(({ route }) => ({
    routes: [
      route("/", { GET: home }),
    ],
  }), { hostname: "127.0.0.1", port: 0 });
}
