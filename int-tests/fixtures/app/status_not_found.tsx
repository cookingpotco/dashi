import type { Ctx, Html } from "dashi";

export function statusNotFound(_ctx: Ctx, html: Html) {
  return html(<p id="status-not-found">handler-404</p>, { status: 404 });
}
