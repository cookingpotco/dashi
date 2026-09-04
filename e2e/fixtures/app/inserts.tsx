import { type Ctx, patch, type SealHtml, type SealPatches } from "dashi";

export function form(_ctx: Ctx, html: SealHtml) {
  return html(
    <form id="inserts-form" method="POST" action="/inserts">
      <button type="submit">Insert</button>
    </form>,
  );
}

export function apply(_ctx: Ctx, patches: SealPatches) {
  return patches([
    patch.prepend("/slot", <span id="prepended">pre</span>),
    patch.before("/slot", <span id="before-slot">before</span>),
    patch.after("/slot", <span id="after-slot">after</span>),
  ]);
}
