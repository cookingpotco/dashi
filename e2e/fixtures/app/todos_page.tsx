import { type Ctx, type Html, RouteFragment } from "dashi";

export function TodosPage(_ctx: Ctx, html: Html) {
  return html(
    <div>
      <p id="page-marker">outside</p>
      <RouteFragment src="/todos" />
    </div>,
  );
}
