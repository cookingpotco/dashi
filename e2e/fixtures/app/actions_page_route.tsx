import { RouteFragment } from "dashi";

export function ActionsPage() {
  return (
    <div>
      <p id="page-marker">outside</p>
      <RouteFragment src="/todos" />
      <RouteFragment src="/todo-count" />
      <RouteFragment src="/hits" />
      <RouteFragment src="/actions" />
      <RouteFragment src="/notice" />
    </div>
  );
}
