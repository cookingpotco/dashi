import { type Ctx, group } from "dashi";
import { recordWrite } from "../writes.ts";

export const slowWrite = group("/slow-write", ({ route }) => ({
  routes: [route("/", { GET: SlowWrite, POST: post })],
}));

function SlowWrite() {
  return (
    <form id="slow-form" method="POST" action="/slow-write">
      <button id="slow-submit" type="submit">Slow</button>
    </form>
  );
}

async function post(ctx: Ctx) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  recordWrite();
  return Response.redirect(new URL("/wrote", ctx.url), 303);
}
