import { type Ctx, fragment, group, RouteFragment } from "dashi";
import { EntriesForm } from "../entries_form.tsx";
import { recordWrite } from "../writes.ts";

export const entries = group("/entries", ({ route }) => ({
  routes: [route("/", { GET: list, POST: write })],
}));

function EntriesPage() {
  return (
    <div>
      <h1 id="heading">entries</h1>
      <RouteFragment src="/entries-form" />
      <form id="redirect-form" method="POST" action="/entries">
        <button id="redirect-submit" type="submit">Save</button>
      </form>
      <form
        id="hard-form"
        method="POST"
        action="/entries"
        hardNavigation
      >
        <button id="hard-submit" type="submit">Hard</button>
      </form>
      <form id="json-form" method="POST" action="/json-write">
        <button id="json-submit" type="submit">Json</button>
      </form>
      <form id="page-search" method="GET" action="/search">
        <input id="page-search-q" name="q" />
        <button id="page-search-submit" type="submit">Find</button>
      </form>
    </div>
  );
}

function list() {
  return <EntriesPage />;
}

async function write(ctx: Ctx) {
  const data = await ctx.req.formData();
  if (data.get("intent") === "validate") {
    const title = data.get("title");
    if (typeof title !== "string" || title.trim() === "") {
      return [
        fragment.replace(
          "/entries-form",
          <EntriesForm error="title is required" />,
        ),
      ];
    }
    return [fragment.replace("/entries-form", <EntriesForm />)];
  }
  recordWrite();
  return Response.redirect(new URL("/search", ctx.url), 303);
}
