import { RouteFragment } from "dashi";

export function TodosPage() {
  return (
    <div>
      <p id="page-marker">outside</p>
      <RouteFragment src="/todos" />
    </div>
  );
}
