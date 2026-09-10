import { assertEquals } from "@std/assert";
import { isHtmlContentType, isRootRelativePath } from "./trust_client.ts";

Deno.test("isRootRelativePath", () => {
  assertEquals(isRootRelativePath("/todos"), true);
  assertEquals(isRootRelativePath("/"), true);
  assertEquals(isRootRelativePath("//evil.example/path"), false);
  assertEquals(isRootRelativePath("https://evil.example/path"), false);
  assertEquals(isRootRelativePath("todos"), false);
});

Deno.test("isHtmlContentType", () => {
  assertEquals(isHtmlContentType("text/html"), true);
  assertEquals(isHtmlContentType("text/html; charset=utf-8"), true);
  assertEquals(isHtmlContentType("TEXT/HTML"), true);
  assertEquals(isHtmlContentType("application/json"), false);
  assertEquals(isHtmlContentType(null), false);
});
