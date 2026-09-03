import { type Ctx } from "dashi";
import { entries } from "../guestbook.ts";

function Guestbook({ error }: { error?: string }) {
  return (
    <div>
      <h1>Guestbook</h1>
      <ul>
        {entries.map((entry) => <li>{entry}</li>)}
      </ul>
      {error ? <p>{error}</p> : null}
      <form method="POST" action="/guestbook">
        <input name="body" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export function list(ctx: Ctx) {
  const error = ctx.url.searchParams.get("error") === "required"
    ? "body is required"
    : undefined;
  return <Guestbook error={error} />;
}

export async function add(ctx: Ctx) {
  const body = (await ctx.req.formData()).get("body");
  if (typeof body !== "string" || body.trim() === "") {
    return Response.redirect(
      new URL("/guestbook?error=required", ctx.url),
      303,
    );
  }
  entries.push(body);
  return Response.redirect(new URL("/guestbook", ctx.url), 303);
}
