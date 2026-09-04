import { type Ctx, type SealHtml } from "dashi";

export function list(_ctx: Ctx, html: SealHtml) {
  return html(
    <span id="current-time">
      Current time: {new Date().toISOString()}
    </span>,
  );
}
