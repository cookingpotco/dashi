import { assertEquals } from "@std/assert";
import denoJson from "../deno.json" with { type: "json" };

// TODO(COO-73): also assert compilerOptions.jsxImportSource is unset
Deno.test("root import map does not map to paths inside the package", () => {
  const paths = Object.entries(denoJson.imports).filter(([, value]) =>
    value.startsWith("./") || value.startsWith("../") ||
    value.startsWith("/")
  );
  assertEquals(paths, []);
});
