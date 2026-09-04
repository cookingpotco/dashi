import { type ReadArgs, type WriteArgs } from "dashi";

export function list({ html }: ReadArgs) {
  return html(
    <form id="frag-leave" method="POST" action="/frag-leave">
      <button id="frag-leave-submit" type="submit">Leave</button>
    </form>,
  );
}

export function leave({ ctx }: WriteArgs) {
  return Response.redirect(new URL("/search", ctx.url), 303);
}
