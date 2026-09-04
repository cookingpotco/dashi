import { type Ctx, type SealHtml } from "dashi";

const entries: string[] = [];

export function list(_ctx: Ctx, html: SealHtml) {
  return html(
    <div>
      <h2>Guestbook</h2>
      <ul>
        {entries.map((entry) => <li>{entry}</li>)}
      </ul>
      <form method="POST" action="/guestbook">
        <input name="body" />
        <button type="submit">Add</button>
      </form>
    </div>,
  );
}

export async function add(ctx: Ctx) {
  const data = await ctx.req.formData();
  const body = data.get("body");
  if (typeof body === "string") {
    entries.push(body);
  }
  return Response.redirect(new URL("/guestbook", ctx.url), 303);
}
