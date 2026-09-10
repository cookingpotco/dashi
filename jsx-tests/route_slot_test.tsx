import { RouteSlot } from "dashi";

function typechecks() {
  <RouteSlot src="/todos" />;
  <RouteSlot
    src="/demo"
    fetchWhen="visible"
    fallback={<p>Loading…</p>}
  />;
  // @ts-expect-error connected is not a fetchWhen value; omit fetchWhen instead
  <RouteSlot src="/demo" fetchWhen="connected" />;
  // @ts-expect-error RouteSlot children are not HTMLAttributes children; use fallback
  <RouteSlot src="/demo">loading</RouteSlot>;
}

Deno.test("RouteSlot props typecheck", () => {
  void typechecks;
});
