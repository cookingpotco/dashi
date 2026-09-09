import { patch, type ReadArgs, type WriteArgs } from "dashi";

export function form({ html }: ReadArgs) {
  return html(
    <form id="element-replace-form" method="POST" action="/element-replace">
      <button type="submit">Replace</button>
    </form>,
  );
}

export function apply({ patches }: WriteArgs) {
  return patches([
    patch.replace(
      "#element-replace",
      <p id="element-replace">replaced</p>,
    ),
  ]);
}

export function voidForm({ html }: ReadArgs) {
  return html(
    <form id="void-update-form" method="POST" action="/void-update">
      <button type="submit">Update void</button>
    </form>,
  );
}

export function applyVoidUpdate({ patches }: WriteArgs) {
  return patches([
    patch.update("#void-target", <span>bad</span>),
  ]);
}
