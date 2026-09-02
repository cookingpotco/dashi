import { client, serve } from "dashi";

const Local = client.element(
  "local-el",
  new URL("./local_client.ts", import.meta.url),
);

const JsrFragment = client.module(
  new URL(import.meta.resolve("dashi-jsr-fragment")),
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
