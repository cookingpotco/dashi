import type { Ctx } from "dashi";

export function Leave() {
  return (
    <form id="leave-form" method="POST" action="/leave">
      <input name="note" />
      <button type="submit">Leave</button>
    </form>
  );
}

export function leave(ctx: Ctx) {
  return Response.redirect(new URL("/", ctx.url), 303);
}
