import { type Ctx, group } from "dashi";

const entries: string[] = [];

export const guestbook = group("/guestbook", ({ route }) => ({
  routes: [route("/", { GET: list, POST: add })],
}));

function list() {
  return (
    <div>
      <h2>Guestbook</h2>
      <ul>
        {entries.map((entry) => <li>{entry}</li>)}
      </ul>
      <form method="POST" action="/guestbook">
        <input name="body" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

async function add(ctx: Ctx) {
  const data = await ctx.req.formData();
  const body = data.get("body");
  if (typeof body === "string") {
    entries.push(body);
  }
  return Response.redirect(new URL("/guestbook", ctx.url), 303);
}
