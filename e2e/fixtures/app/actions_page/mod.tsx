import { group, RouteFragment } from "dashi";

export const actionsPage = group("/actions-page", ({ route }) => ({
  routes: [route("/", { GET: ActionsPage })],
}));

function ActionsPage() {
  return (
    <div>
      <p id="page-marker">outside</p>
      <RouteFragment src="/todos" />
      <RouteFragment src="/todo-count" />
      <RouteFragment src="/hits" />
      <RouteFragment src="/actions" />
      <RouteFragment src="/notice" />
      <RouteFragment src="/slot" />
      <RouteFragment src="/inserts" />
    </div>
  );
}
