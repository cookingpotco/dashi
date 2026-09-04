import type { Ctx, Html } from "dashi";

export function statusForbidden(_ctx: Ctx, html: Html) {
  return html(<p id="status-forbidden">handler-403</p>, { status: 403 });
}
