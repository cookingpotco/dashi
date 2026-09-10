import { type ReadArgs, RouteSlot } from "dashi";

export function PatchesPage({ html }: ReadArgs) {
  return html(
    <div>
      <p id="page-marker">outside</p>
      <div id="status">idle</div>
      <span id="element-replace">idle</span>
      <input id="void-target" type="hidden" value="x" />
      <RouteSlot src="/todos" />
      <span id="todo-count">0</span>
      <RouteSlot src="/hits" />
      <RouteSlot src="/patches" />
      <RouteSlot src="/notice" />
      <RouteSlot src="/slot" id="slot" />
      <RouteSlot src="/inserts" />
      <RouteSlot src="/element-replace" />
      <RouteSlot src="/void-update" />
    </div>,
  );
}
