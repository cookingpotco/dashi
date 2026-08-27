import { group, RouteFragment } from "dashi";

export const todosPage = group("/todos-page", ({ route }) => ({
  routes: [route("/", { GET: TodosPage })],
}));

function TodosPage() {
  return (
    <div>
      <p id="page-marker">outside</p>
      <RouteFragment src="/todos" />
    </div>
  );
}
