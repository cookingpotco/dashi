import { patch, type ReadArgs, type WriteArgs } from "dashi";

export function form({ html }: ReadArgs) {
  return html(
    <form id="inserts-form" method="POST" action="/inserts">
      <button type="submit">Insert</button>
    </form>,
  );
}

export function apply({ patches }: WriteArgs) {
  return patches([
    patch.prepend("/slot", <span id="prepended">pre</span>),
    patch.before("/slot", <span id="before-slot">before</span>),
    patch.after("/slot", <span id="after-slot">after</span>),
  ]);
}
