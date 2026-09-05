import type { ReadArgs, WriteArgs } from "dashi";
import type { AppState } from "./state.ts";

const entries: string[] = [];

export function list({ html }: ReadArgs<AppState>) {
  return html(
    <div>
      <ul id="entries">
        {entries.map((entry) => <li>{entry}</li>)}
      </ul>
      <form method="POST" action="/guestbook">
        <input name="body" />
        <button type="submit">Add</button>
      </form>
    </div>,
  );
}

export async function add({ ctx }: WriteArgs<AppState>) {
  const data = await ctx.req.formData();
  const body = data.get("body");
  if (typeof body === "string") {
    entries.push(body);
  }
  return Response.redirect(new URL("/guestbook", ctx.url), 303);
}
