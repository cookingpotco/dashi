import type { Ctx } from "dashi";

export function list() {
  return (
    <form id="frag-leave" method="POST" action="/frag-leave">
      <button id="frag-leave-submit" type="submit">Leave</button>
    </form>
  );
}

export function leave(ctx: Ctx) {
  return Response.redirect(new URL("/search", ctx.url), 303);
}
