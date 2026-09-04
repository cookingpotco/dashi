import { type Ctx, type SealHtml } from "dashi";
import { recordWrite } from "./writes.ts";

export function SlowWrite(_ctx: Ctx, html: SealHtml) {
  return html(
    <form id="slow-form" method="POST" action="/slow-write">
      <button id="slow-submit" type="submit">Slow</button>
    </form>,
  );
}

export async function post(ctx: Ctx) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  recordWrite();
  return Response.redirect(new URL("/wrote", ctx.url), 303);
}
