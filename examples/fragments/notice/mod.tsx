import { type Ctx, patch, type SealHtml, type SealPatches } from "dashi";

export function list(_ctx: Ctx, html: SealHtml) {
  return html(
    <div id="notice">
      <p>Try dismiss — it removes this fragment.</p>
      <form method="POST" action="/notice">
        <button type="submit">Dismiss</button>
      </form>
    </div>,
  );
}

export function dismiss(_ctx: Ctx, patches: SealPatches) {
  return patches([patch.remove("/notice")]);
}
