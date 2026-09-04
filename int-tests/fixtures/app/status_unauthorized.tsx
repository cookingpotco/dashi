import type { Ctx, Html } from "dashi";

export function statusUnauthorized(_ctx: Ctx, html: Html) {
  return html(<p id="status-unauthorized">handler-401</p>, { status: 401 });
}
