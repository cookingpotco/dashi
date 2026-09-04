import { type ReadArgs, type WriteArgs } from "dashi";

export function Bare({ html }: ReadArgs) {
  return html(
    <div>
      <h1 id="heading">bare</h1>
      <form id="bare-form" method="POST" action="/bare">
        <button id="bare-submit" type="submit">Go</button>
      </form>
    </div>,
  );
}

export function post({ ctx }: WriteArgs) {
  return Response.redirect(new URL("/search", ctx.url), 303);
}
