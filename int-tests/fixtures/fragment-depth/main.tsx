import {
  type Ctx,
  RouteFragment,
  type SealHtml,
  serve,
  type WrapperCtx,
} from "dashi";

function faultError(_ctx: WrapperCtx, thrown: unknown, html: SealHtml) {
  return html(
    <p id="fault">
      {thrown instanceof Error ? thrown.message : String(thrown)}
    </p>,
  );
}

function two(_ctx: Ctx, html: SealHtml) {
  return html(<RouteFragment src="/outer" />);
}

function three(_ctx: Ctx, html: SealHtml) {
  return html(<RouteFragment src="/a" />);
}

function outer(_ctx: Ctx, html: SealHtml) {
  return html(<RouteFragment src="/inner" />);
}

function inner(_ctx: Ctx, html: SealHtml) {
  return html(<p id="inner">inner</p>);
}

function a(_ctx: Ctx, html: SealHtml) {
  return html(<RouteFragment src="/b" />);
}

function b(_ctx: Ctx, html: SealHtml) {
  return html(<RouteFragment src="/c" />);
}

function c(_ctx: Ctx, html: SealHtml) {
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
