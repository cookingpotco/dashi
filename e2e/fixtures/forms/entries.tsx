import { type Ctx, type Html, patch, type Patches, RouteFragment } from "dashi";
import { EntriesForm } from "./entries_form.tsx";
import { recordWrite } from "./writes.ts";

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
      <form id="drop-form" method="POST" action="/drop-write">
        <input id="drop-title" name="title" />
        <button id="drop-submit" type="submit">Drop</button>
      </form>
      <form id="reject-form" method="POST" action="/reject-write">
        <input id="reject-title" name="title" />
        <button id="reject-submit" type="submit">Reject</button>
      </form>
      <p id="reject-status"></p>
      <form id="page-search" method="GET" action="/search">
        <input id="page-search-q" name="q" />
        <button id="page-search-submit" type="submit">Find</button>
      </form>
    </div>
  );
}

export function list(_ctx: Ctx, html: Html) {
  return html(<EntriesPage />);
}

export async function write(ctx: Ctx, patches: Patches) {
  const data = await ctx.req.formData();
  if (data.get("intent") === "validate") {
    const title = data.get("title");
    if (typeof title !== "string" || title.trim() === "") {
      return patches([
        patch.replace(
          "/entries-form",
          <EntriesForm error="title is required" />,
        ),
      ]);
    }
    return patches([patch.replace("/entries-form", <EntriesForm />)]);
  }
  recordWrite();
  return Response.redirect(new URL("/search", ctx.url), 303);
}
