import { type Ctx, group } from "dashi";

export const fragLeave = group("/frag-leave", ({ route }) => ({
  routes: [route("/", { GET: list, POST: leave })],
}));

function list() {
  return (
    <form id="frag-leave" method="POST" action="/frag-leave">
      <button id="frag-leave-submit" type="submit">Leave</button>
    </form>
  );
}

function leave(ctx: Ctx) {
  return Response.redirect(new URL("/search", ctx.url), 303);
}
