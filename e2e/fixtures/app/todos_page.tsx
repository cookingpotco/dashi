import { type Ctx, RouteFragment, type SealHtml } from "dashi";

export function TodosPage(_ctx: Ctx, html: SealHtml) {
  return html(
    <div>
      <p id="page-marker">outside</p>
      <RouteFragment src="/todos" />
    </div>,
  );
}
