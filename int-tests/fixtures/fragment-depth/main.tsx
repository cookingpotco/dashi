import { type ErrorArgs, type ReadArgs, RouteFragment, serve } from "dashi";

function faultError({ thrown, html }: ErrorArgs) {
  return html(
    <p id="fault">
      {thrown instanceof Error ? thrown.message : String(thrown)}
    </p>,
  );
}

function two({ html }: ReadArgs) {
  return html(<RouteFragment src="/outer" />);
}

function three({ html }: ReadArgs) {
  return html(<RouteFragment src="/a" />);
}

function outer({ html }: ReadArgs) {
  return html(<RouteFragment src="/inner" />);
}

function inner({ html }: ReadArgs) {
  return html(<p id="inner">inner</p>);
}

function a({ html }: ReadArgs) {
  return html(<RouteFragment src="/b" />);
}

function b({ html }: ReadArgs) {
  return html(<RouteFragment src="/c" />);
}

function c({ html }: ReadArgs) {
  return html(<p id="c">c</p>);
}

export function start() {
  return serve(({ route }) => ({
    error: faultError,
    routes: [
      route("/two", { GET: two }),
      route("/three", { GET: three }),
      route("/outer", { GET: outer }),
      route("/inner", { GET: inner }),
      route("/a", { GET: a }),
      route("/b", { GET: b }),
      route("/c", { GET: c }),
    ],
  }), { fragmentDepthLimit: 2, hostname: "127.0.0.1", port: 0 });
}
