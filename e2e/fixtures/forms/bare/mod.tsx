import { type Ctx, group } from "dashi";

export const bare = group("/bare", ({ route }) => ({
  routes: [route("/", { GET: Bare, POST: post })],
}));

function Bare() {
  return (
    <div>
      <h1 id="heading">bare</h1>
      <form id="bare-form" method="POST" action="/bare">
        <button id="bare-submit" type="submit">Go</button>
      </form>
    </div>
  );
}

function post(ctx: Ctx) {
  return Response.redirect(new URL("/search", ctx.url), 303);
}
