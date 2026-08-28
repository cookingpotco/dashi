import { type Element, RouteFragment, serve, type WrapperCtx } from "dashi";

function faultError(_ctx: WrapperCtx, thrown: unknown): Element {
  return (
    <p id="fault">
      {thrown instanceof Error ? thrown.message : String(thrown)}
    </p>
  );
}

function two(): Element {
  return <RouteFragment src="/outer" />;
}

function three(): Element {
  return <RouteFragment src="/a" />;
}

function outer(): Element {
  return <RouteFragment src="/inner" />;
}

function inner(): Element {
  return <p id="inner">inner</p>;
}

function a(): Element {
  return <RouteFragment src="/b" />;
}

function b(): Element {
  return <RouteFragment src="/c" />;
}

function c(): Element {
  return <p id="c">c</p>;
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

if (import.meta.main) {
  start();
}
