import { type ReadArgs, RouteFragment } from "dashi";

export function PatchesPage({ html }: ReadArgs) {
  return html(
    <div>
      <p id="page-marker">outside</p>
      <div id="status">idle</div>
      <RouteFragment src="/todos" />
      <RouteFragment src="/todo-count" />
      <RouteFragment src="/todo-count" />
      <RouteFragment src="/hits" />
      <RouteFragment src="/patches" />
      <RouteFragment src="/notice" />
      <RouteFragment src="/slot" />
      <RouteFragment src="/inserts" />
    </div>,
  );
}
