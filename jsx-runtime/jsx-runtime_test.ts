import { assertEquals, assertThrows } from "@std/assert";
import { jsx, jsxAttr, jsxEscape, jsxTemplate } from "./mod.ts";
import { init } from "../routing/mod.ts";
import { RenderStorage } from "../ssr/mod.ts";

Deno.test("jsxTemplate returns empty HTML when the strings array is empty", () => {
  assertEquals(String(jsxTemplate([])), "");
});

Deno.test("jsxTemplate returns a single static string unchanged", () => {
  assertEquals(String(jsxTemplate(["<div>ok</div>"])), "<div>ok</div>");
});

Deno.test("jsxTemplate concatenates adjacent dynamics with no static text between them", () => {
  assertEquals(
    String(jsxTemplate(["<p>", "", "</p>"], "a", "b")),
    "<p>ab</p>",
  );
});

Deno.test("jsxTemplate interpolates trusted HTML and raw strings as given", () => {
  assertEquals(
    String(jsxTemplate(["<p>", "</p>"], jsx("b", { children: "ok" }))),
    "<p><b>ok</b></p>",
  );
  assertEquals(String(jsxTemplate(["<p>", "</p>"], "<b>")), "<p><b></p>");
});

Deno.test("jsxTemplate still concatenates when the dynamic count does not match the strings", () => {
  assertEquals(String(jsxTemplate(["a"], "x", "y")), "axya");
  assertEquals(String(jsxTemplate(["a", "b", "c"], "x")), "axc");
});

Deno.test("jsxAttr returns empty string when value is null", () => {
  const result = jsxAttr("test", null);

  assertEquals(result, "");
});

Deno.test("jsxAttr returns empty string when value is undefined", () => {
  const result = jsxAttr("test", undefined);

  assertEquals(result, "");
});

Deno.test("jsxAttr returns empty string when value is false", () => {
  const result = jsxAttr("test", false);

  assertEquals(result, "");
});

Deno.test("jsxAttr returns only the name when value is true", () => {
  const result = jsxAttr("test", true);

  assertEquals(result, "test");
});

Deno.test("jsxAttr throws when value is a function", () => {
  assertThrows(() => jsxAttr("test", () => {}));
});

Deno.test("jsxAttr throws when value is an object", () => {
  assertThrows(() => jsxAttr("test", { test: "a" }));
});

Deno.test("jsxAttr throws when value is an array", () => {
  assertThrows(() => jsxAttr("test", ["a"]));
});

Deno.test("jsxAttr throws when given rendered HTML", () => {
  assertThrows(() => jsxAttr("title", jsx("b", { children: "x" })));
});

Deno.test('jsxAttr returns name="value" when value is a string', () => {
  const result = jsxAttr("test", "a");

  assertEquals(result, 'test="a"');
});

Deno.test("jsxAttr keeps 0 and empty string as quoted values", () => {
  assertEquals(jsxAttr("value", 0), 'value="0"');
  assertEquals(jsxAttr("count", 12.5), 'count="12.5"');
  assertEquals(jsxAttr("value", ""), 'value=""');
});

Deno.test("jsxAttr escapes quotes so an attribute value cannot break out", () => {
  const result = jsxAttr("title", `" onload="alert(1)`);

  assertEquals(result, `title="&quot; onload=&quot;alert(1)"`);
});

Deno.test("jsxAttr escapes ampersands in attribute values", () => {
  const result = jsxAttr("href", "/docs?q=1&lang=en");

  assertEquals(result, 'href="/docs?q=1&amp;lang=en"');
});

Deno.test("jsxEscape returns empty string for null, undefined, and booleans", () => {
  assertEquals(jsxEscape(null), "");
  assertEquals(jsxEscape(undefined), "");
  assertEquals(jsxEscape(true), "");
  assertEquals(jsxEscape(false), "");
});

Deno.test("jsxEscape escapes XSS payloads in body position", () => {
  assertEquals(
    jsxEscape("<script>alert(1)</script>"),
    "&lt;script&gt;alert(1)&lt;/script&gt;",
  );
});

Deno.test("jsxEscape escapes ampersands, quotes, and brackets", () => {
  assertEquals(
    jsxEscape(`&<>"'`),
    "&amp;&lt;&gt;&quot;&#39;",
  );
});

Deno.test("jsxEscape stringifies numbers without changing them", () => {
  assertEquals(jsxEscape(0), "0");
  assertEquals(jsxEscape(12.5), "12.5");
});

Deno.test("jsxEscape escapes each item in an array, including nested and empty arrays", () => {
  assertEquals(
    jsxEscape(["<b>", jsx("i", { children: "ok" }), "'"]),
    "&lt;b&gt;<i>ok</i>&#39;",
  );
  assertEquals(jsxEscape([]), "");
  assertEquals(jsxEscape(["a", ["b", ["<c>"]]]), "ab&lt;c&gt;");
});

Deno.test("jsxEscape interpolates JSX output unchanged", () => {
  assertEquals(jsxEscape(jsx("b", { children: "ok" })), "<b>ok</b>");
});

Deno.test("jsxEscape throws when given a function", () => {
  assertThrows(() => jsxEscape(() => {}));
});

Deno.test("jsxEscape throws when given an object", () => {
  assertThrows(() => jsxEscape({ test: "a" }));
});

Deno.test("jsx renders a function component and escapes a plain string return", () => {
  function Greet(props?: Record<string, unknown>) {
    return jsx("span", { children: props?.name });
  }
  function Echo(props?: Record<string, unknown>) {
    return props?.text;
  }

  assertEquals(String(jsx(Greet, { name: "Ada" })), "<span>Ada</span>");
  assertEquals(String(jsx(Greet)), "<span></span>");
  assertEquals(String(jsx(Echo, { text: "<em>" })), "&lt;em&gt;");
});

Deno.test("jsx renders intrinsic elements with no props", () => {
  assertEquals(String(jsx("div")), "<div></div>");
  assertEquals(String(jsx("div", null)), "<div></div>");
});

Deno.test("jsx renders void elements with a closing tag", () => {
  assertEquals(String(jsx("br")), "<br></br>");
  assertEquals(
    String(jsx("img", { src: "x.png", alt: "" })),
    `<img src="x.png" alt=""></img>`,
  );
});

Deno.test("jsx renders children, including arrays and falsy-but-meaningful values", () => {
  assertEquals(String(jsx("div", { children: "ok" })), "<div>ok</div>");
  assertEquals(String(jsx("div", { children: 0 })), "<div>0</div>");
  assertEquals(String(jsx("div", { children: "" })), "<div></div>");
  assertEquals(
    String(
      jsx("ul", {
        children: [jsx("li", { children: "a" }), 0, ""],
      }),
    ),
    "<ul><li>a</li>0</ul>",
  );
});

Deno.test("jsx renders a custom element through the host-tag path", () => {
  assertEquals(
    String(jsx("x-panel", { title: "n", children: "ok" })),
    `<x-panel title="n">ok</x-panel>`,
  );
});

Deno.test("jsx remaps className when the tag is a string", () => {
  assertEquals(
    String(jsx("div", { className: "x" })),
    `<div class="x"></div>`,
  );
});

Deno.test("jsx throws when style is an object", () => {
  assertThrows(() => jsx("div", { style: { color: "red" } }));
});

Deno.test("jsx inlines dangerouslySetInnerHTML without escaping", () => {
  assertEquals(
    String(
      jsx("div", { dangerouslySetInnerHTML: { __html: "<b>ok</b>" } }),
    ),
    "<div><b>ok</b></div>",
  );
});

Deno.test("jsx throws when children and dangerouslySetInnerHTML are both set", () => {
  assertThrows(() =>
    jsx("div", {
      dangerouslySetInnerHTML: { __html: "<b>ok</b>" },
      children: "nope",
    })
  );
});

Deno.test("jsx throws when dangerouslySetInnerHTML is not `{ __html: string }`", () => {
  assertThrows(() => jsx("div", { dangerouslySetInnerHTML: "<b>ok</b>" }));
});

Deno.test("jsx emits an inline slot for a non-lazy route-fragment", () => {
  init([]);
  RenderStorage.getInstance().init(new Request("http://localhost/"));
  // requestInlineFragment builds `new Request(src, req)`, which needs an absolute URL
  assertEquals(
    String(jsx("route-fragment", { src: "http://localhost/comments" })),
    `<route-fragment src="http://localhost/comments">{{fragment:http://localhost/comments}}</route-fragment>`,
  );
});

Deno.test("jsx renders a lazy route-fragment without an inline slot", () => {
  assertEquals(
    String(
      jsx("route-fragment", {
        src: "/comments",
        lazy: true,
        children: "soon",
      }),
    ),
    `<route-fragment src="/comments" lazy>soon</route-fragment>`,
  );
});
