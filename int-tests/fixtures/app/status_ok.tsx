import type { Ctx, Html } from "dashi";

export function statusOk(_ctx: Ctx, html: Html) {
  return html(<p id="status-ok">handler-200</p>);
}
