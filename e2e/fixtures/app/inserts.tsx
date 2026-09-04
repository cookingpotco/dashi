import { type Ctx, type Html, patch, type Patches } from "dashi";

export function form(_ctx: Ctx, html: Html) {
  return html(
    <form id="inserts-form" method="POST" action="/inserts">
      <button type="submit">Insert</button>
    </form>,
  );
}

export function apply(_ctx: Ctx, patches: Patches) {
  return patches([
    patch.prepend("/slot", <span id="prepended">pre</span>),
    patch.before("/slot", <span id="before-slot">before</span>),
    patch.after("/slot", <span id="after-slot">after</span>),
  ]);
}
