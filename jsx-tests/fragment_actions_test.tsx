import { assertEquals } from "@std/assert";
import { fragment, group } from "dashi";
import { renderFragmentActions } from "../fragments/mod.ts";

Deno.test("action list serializes to sibling route-action elements", () => {
  assertEquals(
    String(renderFragmentActions([
      fragment.append("/todos", <li>milk</li>),
      fragment.replace("/todo-count", <span>3</span>),
      fragment.remove("/notice"),
      fragment.refresh("/hits"),
      fragment.prepend("/todos", <li>bread</li>),
      fragment.before("/slot", <p>before</p>),
      fragment.after("/slot", <p>after</p>),
    ])),
    '<route-action action="append" src="/todos"><li>milk</li></route-action>' +
      '<route-action action="replace" src="/todo-count"><span>3</span></route-action>' +
      '<route-action action="remove" src="/notice"></route-action>' +
      '<route-action action="refresh" src="/hits"></route-action>' +
      '<route-action action="prepend" src="/todos"><li>bread</li></route-action>' +
      '<route-action action="before" src="/slot"><p>before</p></route-action>' +
      '<route-action action="after" src="/slot"><p>after</p></route-action>',
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

function typechecks() {
  group(({ route }) => {
    route("/x", {
      // @ts-expect-error GET cannot return fragment actions
      GET: () => [fragment.remove("/x")],
    });
    route("/x", {
      POST: () => [fragment.remove("/x")],
    });
    route("/x", {
      // @ts-expect-error writes cannot return markup
      POST: () => <div />,
    });
    return { routes: [] };
  });
}

Deno.test("GET cannot return fragment actions", () => {
  void typechecks;
});
