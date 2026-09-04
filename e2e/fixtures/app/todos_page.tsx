import { type ReadArgs, RouteFragment } from "dashi";

export function TodosPage({ html }: ReadArgs) {
  return html(
    <div>
      <p id="page-marker">outside</p>
      <RouteFragment src="/todos" />
    </div>,
  );
}
