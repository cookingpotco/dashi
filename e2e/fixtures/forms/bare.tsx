import { type Ctx } from "dashi";

export function Bare() {
  return (
    <div>
      <h1 id="heading">bare</h1>
      <form id="bare-form" method="POST" action="/bare">
        <button id="bare-submit" type="submit">Go</button>
      </form>
    </div>
  );
}

export function post(ctx: Ctx) {
  return Response.redirect(new URL("/search", ctx.url), 303);
}
