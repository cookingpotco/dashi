import { assertEquals } from "@std/assert";
import denoJson from "../deno.json" with { type: "json" };

Deno.test("root import map does not map to paths inside the package", () => {
  const paths = Object.entries(denoJson.imports).filter(([, value]) =>
    value.startsWith("./") || value.startsWith("../") ||
    value.startsWith("/")
  );
  assertEquals(paths, []);
});

Deno.test("root compilerOptions carries no JSX configuration", () => {
  assertEquals("jsx" in denoJson.compilerOptions, false);
  assertEquals("jsxImportSource" in denoJson.compilerOptions, false);
});
