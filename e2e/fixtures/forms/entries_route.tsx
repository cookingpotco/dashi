import type { Ctx } from "dashi";
import { recordWrite } from "./writes.ts";
import { pageResponse } from "./page_response.ts";

function EntriesPage({ error }: { error?: string }) {
  return (
    <div>
      <h1 id="heading">entries</h1>
      {error ? <p id="error">{error}</p> : null}
      <form id="redirect-form" method="POST" action="/entries">
        <button id="redirect-submit" type="submit">Save</button>
      </form>
      <form id="validate-form" method="POST" action="/entries">
        <input type="hidden" name="intent" value="validate" />
        <input id="validate-title" name="title" />
        <button id="validate-submit" type="submit">Check</button>
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

export function list() {
  return <EntriesPage />;
}

export async function write(ctx: Ctx) {
  const data = await ctx.req.formData();
  if (data.get("intent") === "validate") {
    const title = data.get("title");
    if (typeof title !== "string" || title.trim() === "") {
      return pageResponse(ctx, <EntriesPage error="title is required" />);
    }
    return pageResponse(ctx, <EntriesPage />);
  }
  recordWrite();
  return Response.redirect(new URL("/search", ctx.url), 303);
}
