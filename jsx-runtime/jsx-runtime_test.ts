import { assertEquals, assertThrows } from "@std/assert";
import { jsx, jsxAttr, jsxEscape } from "./mod.ts";

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

Deno.test('jsxAttr returns a quoted name="value" when value is a number', () => {
  const result = jsxAttr("test", 0);

  assertEquals(result, 'test="0"');
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

Deno.test("jsxEscape escapes each item in an array", () => {
  assertEquals(
    jsxEscape(["<b>", jsx("i", { children: "ok" }), "'"]),
    "&lt;b&gt;<i>ok</i>&#39;",
  );
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
