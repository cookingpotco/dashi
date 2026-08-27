import { assertEquals } from "@std/assert";
import { fragment, type GroupCallback } from "dashi";
import { renderFragmentActions } from "../fragments/mod.ts";

Deno.test("action list serializes to sibling route-action elements", () => {
  assertEquals(
    String(renderFragmentActions([
      fragment.append("/todos", <li>milk</li>),
      fragment.replace("/todo-count", <span>3</span>),
      fragment.remove("/notice"),
      fragment.refresh("/hits"),
    ])),
    '<route-action action="append" src="/todos"><li>milk</li></route-action>' +
      '<route-action action="replace" src="/todo-count"><span>3</span></route-action>' +
      '<route-action action="remove" src="/notice"></route-action>' +
      '<route-action action="refresh" src="/hits"></route-action>',
  );
});

Deno.test("action src attribute is escaped", () => {
  assertEquals(
    String(renderFragmentActions([
      fragment.remove("/a&b"),
    ])),
    '<route-action action="remove" src="/a&amp;b"></route-action>',
  );
});

function typechecks(cb: GroupCallback) {
  cb.route("/x", {
    // @ts-expect-error GET cannot return fragment actions
    GET: () => [fragment.remove("/x")],
  });
  cb.route("/x", {
    POST: () => [fragment.remove("/x")],
  });
  cb.route("/x", {
    // @ts-expect-error writes cannot return markup
    POST: () => <div />,
  });
}

Deno.test("GET cannot return fragment actions", () => {
  void typechecks;
});
