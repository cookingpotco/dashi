import { patch, type ReadArgs, type WriteArgs } from "dashi";

export function list({ html }: ReadArgs) {
  return html(
    <div id="notice">
      <p>Notice</p>
      <form id="dismiss-form" method="POST" action="/notice">
        <button type="submit">Dismiss</button>
      </form>
    </div>,
  );
}

export function dismiss({ patches }: WriteArgs) {
  return patches([patch.remove("/notice")]);
}
