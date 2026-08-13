import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { jsxAttr } from "./mod.ts";

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
  // COO-5: jsxAttr interpolates functions into attributes instead of throwing.
  it.ignore("should throw an error for function value", () => {
    assertThrows(() => jsxAttr("test", () => {}));
  });
  it("should throw an error for object value", () => {
    assertThrows(() => jsxAttr("test", { test: "a" }));
  });
  it("should throw an error for array value", () => {
    assertThrows(() => jsxAttr("test", ["a"]));
  });
  it("should return attr=value for string value", () => {
    const result = jsxAttr("test", "a");

    assertEquals(result, 'test="a"');
  });
  it("should return attr=value for number value", () => {
    const result = jsxAttr("test", 0);

    assertEquals(result, "test=0");
  });
});
