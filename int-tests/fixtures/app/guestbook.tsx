import type { Ctx, Html } from "dashi";
import type { AppState } from "./state.ts";

const entries: string[] = [];

export function list(
  _ctx: Ctx<Record<string, never>, AppState>,
  html: Html,
) {
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

export async function add(ctx: Ctx<Record<string, never>, AppState>) {
  const data = await ctx.req.formData();
  const body = data.get("body");
  if (typeof body === "string") {
    entries.push(body);
  }
  return Response.redirect(new URL("/guestbook", ctx.url), 303);
}
