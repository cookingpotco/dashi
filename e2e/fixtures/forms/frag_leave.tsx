import { type Ctx, type Html } from "dashi";

export function list(_ctx: Ctx, html: Html) {
  return html(
    <form id="frag-leave" method="POST" action="/frag-leave">
      <button id="frag-leave-submit" type="submit">Leave</button>
    </form>,
  );
}

export function leave(ctx: Ctx) {
  return Response.redirect(new URL("/search", ctx.url), 303);
}
