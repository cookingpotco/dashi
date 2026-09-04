import { assertEquals } from "@std/assert";
import { group, patch } from "dashi";
import { renderPatches } from "../patching/mod.ts";

Deno.test("patch list serializes to sibling dashi-patch elements", () => {
  assertEquals(
    String(renderPatches([
      patch.append("#todos", <li>milk</li>),
      patch.replace("/todo-count", <span>3</span>),
      patch.replace("#status", <p>Saved</p>),
      patch.remove("#notice"),
      patch.refresh("/hits"),
      patch.prepend("/todos", <li>bread</li>),
      patch.before("/slot", <p>before</p>),
      patch.after("/slot", <p>after</p>),
    ])),
    '<dashi-patch kind="append" target="#todos"><li>milk</li></dashi-patch>' +
      '<dashi-patch kind="replace" target="/todo-count"><span>3</span></dashi-patch>' +
      '<dashi-patch kind="replace" target="#status"><p>Saved</p></dashi-patch>' +
      '<dashi-patch kind="remove" target="#notice"></dashi-patch>' +
      '<dashi-patch kind="refresh" target="/hits"></dashi-patch>' +
      '<dashi-patch kind="prepend" target="/todos"><li>bread</li></dashi-patch>' +
      '<dashi-patch kind="before" target="/slot"><p>before</p></dashi-patch>' +
      '<dashi-patch kind="after" target="/slot"><p>after</p></dashi-patch>',
  );
});

Deno.test("patch target attribute is escaped", () => {
  assertEquals(
    String(renderPatches([
      patch.remove("/a&b"),
    ])),
    '<dashi-patch kind="remove" target="/a&amp;b"></dashi-patch>',
  );
});

function typechecks() {
  group(({ route }) => {
    route("/x", {
      // @ts-expect-error GET cannot return patches
      GET: () => [patch.remove("/x")],
    });
    route("/x", {
      POST: ({ patches }) => patches([patch.remove("/x")]),
    });
    route("/x", {
      // @ts-expect-error writes cannot return markup
      POST: () => <div />,
    });
    return { routes: [] };
  });
  // @ts-expect-error refresh rejects an id target
  patch.refresh("#status");
}

Deno.test("GET cannot return patches", () => {
  void typechecks;
});
