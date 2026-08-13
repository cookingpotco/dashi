import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { __dangerouslyInlineHtml, jsx, jsxAttr, jsxEscape } from "./mod.ts";

describe("jsxAttr", () => {
  it("should return empty string for null value", () => {
    const result = jsxAttr("test", null);

    assertEquals(result, "");
  });
  it("should return empty string for undefined value", () => {
    const result = jsxAttr("test", undefined);

    assertEquals(result, "");
  });
  it("should return empty string for false value", () => {
    const result = jsxAttr("test", false);

    assertEquals(result, "");
  });
  it("should return only name string for true value", () => {
    const result = jsxAttr("test", true);

    assertEquals(result, "test");
  });
  it("should throw an error for function value", () => {
    assertThrows(() => jsxAttr("test", () => {}));
  });
  it("should throw an error for object value", () => {
    assertThrows(() => jsxAttr("test", { test: "a" }));
  });
  it("should throw an error for array value", () => {
    assertThrows(() => jsxAttr("test", ["a"]));
  });
  it("should throw when given rendered HTML", () => {
    assertThrows(() => jsxAttr("title", __dangerouslyInlineHtml("<b>x</b>")));
  });
  it("should return attr=value for string value", () => {
    const result = jsxAttr("test", "a");

    assertEquals(result, 'test="a"');
  });
  it("should return quoted attr=value for number value", () => {
    const result = jsxAttr("test", 0);

    assertEquals(result, 'test="0"');
  });
  it("should escape quotes so an attribute value cannot break out", () => {
    const result = jsxAttr("title", `" onload="alert(1)`);

    assertEquals(result, `title="&quot; onload=&quot;alert(1)"`);
  });
  it("should escape ampersands in attribute values", () => {
    const result = jsxAttr("href", "/docs?q=1&lang=en");

    assertEquals(result, 'href="/docs?q=1&amp;lang=en"');
  });
});

describe("jsxEscape", () => {
  it("should return empty string for null, undefined, and booleans", () => {
    assertEquals(jsxEscape(null), "");
    assertEquals(jsxEscape(undefined), "");
    assertEquals(jsxEscape(true), "");
    assertEquals(jsxEscape(false), "");
  });
  it("should escape XSS payloads in body position", () => {
    assertEquals(
      jsxEscape("<script>alert(1)</script>"),
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });
  it("should escape ampersands, quotes, and brackets", () => {
    assertEquals(
      jsxEscape(`&<>"'`),
      "&amp;&lt;&gt;&quot;&#39;",
    );
  });
  it("should stringify numbers without changing them", () => {
    assertEquals(jsxEscape(0), "0");
    assertEquals(jsxEscape(12.5), "12.5");
  });
  it("should escape each item in an array", () => {
    assertEquals(
      jsxEscape(["<b>", __dangerouslyInlineHtml("<i>ok</i>"), "'"]),
      "&lt;b&gt;<i>ok</i>&#39;",
    );
  });
  it("should interpolate __dangerouslyInlineHtml markup unchanged", () => {
    assertEquals(
      jsxEscape(__dangerouslyInlineHtml("<b>ok</b>")),
      "<b>ok</b>",
    );
  });
  it("should throw an error for function value", () => {
    assertThrows(() => jsxEscape(() => {}));
  });
  it("should throw an error for object value", () => {
    assertThrows(() => jsxEscape({ test: "a" }));
  });
  it("should throw for a plain { html } object that was not marked trusted", () => {
    assertThrows(() => jsxEscape({ html: "<b>ok</b>" }));
  });
});

describe("jsx", () => {
  it("renders a custom element through the host-tag path", () => {
    assertEquals(
      String(jsx("x-panel", { title: "n", children: "ok" })),
      `<x-panel title="n">ok</x-panel>`,
    );
  });
});
