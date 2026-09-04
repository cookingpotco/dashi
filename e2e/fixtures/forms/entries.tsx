import { type Ctx, patch, RouteFragment, status } from "dashi";
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
      <p id="keep-status"></p>
      <form id="keep-form" method="POST" action="/entries">
        <input type="hidden" name="intent" value="keep" />
        <input id="keep-title" name="title" />
        <button id="keep-submit" type="submit">Check</button>
      </form>
      <form id="page-search" method="GET" action="/search">
        <input id="page-search-q" name="q" />
        <button id="page-search-submit" type="submit">Find</button>
      </form>
    </div>
  );
}

export function list() {
  return <EntriesPage />;
}

export async function write(ctx: Ctx) {
  const data = await ctx.req.formData();
  if (data.get("intent") === "validate") {
    const title = data.get("title");
    if (typeof title !== "string" || title.trim() === "") {
      return status(400, [
        patch.replace(
          "/entries-form",
          <EntriesForm error="title is required" />,
        ),
      ]);
    }
    return [patch.replace("/entries-form", <EntriesForm />)];
  }
  if (data.get("intent") === "keep") {
    return status(400, [
      patch.replace("#keep-status", <span>title is required</span>),
    ]);
  }
  recordWrite();
  return Response.redirect(new URL("/search", ctx.url), 303);
}
