import { type ReadArgs, RouteSlot } from "dashi";

export function TodosPage({ html }: ReadArgs) {
  return html(
    <div>
      <p id="page-marker">outside</p>
      <RouteSlot src="/todos" />
    </div>,
  );
}
