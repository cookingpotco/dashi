import type { Ctx } from "dashi";
import { recordWrite } from "./writes.ts";
import { pageResponse } from "./page_response.ts";

export function SlowWrite() {
  return (
    <form id="slow-form" method="POST" action="/slow-write">
      <button id="slow-submit" type="submit">Slow</button>
    </form>
  );
}

export async function slowWrite(ctx: Ctx) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  recordWrite();
  return pageResponse(
    ctx,
    <div>
      <h1 id="heading">wrote</h1>
    </div>,
  );
}
