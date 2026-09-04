import { type Ctx, type Html, patch, type Patches } from "dashi";

export function list(_ctx: Ctx, html: Html) {
  return html(
    <div id="notice">
      <p>Notice</p>
      <form id="dismiss-form" method="POST" action="/notice">
        <button type="submit">Dismiss</button>
      </form>
    </div>,
  );
}

export function dismiss(_ctx: Ctx, patches: Patches) {
  return patches([patch.remove("/notice")]);
}
