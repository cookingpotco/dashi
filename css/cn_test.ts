import { assertEquals } from "@std/assert";
import { cn } from "./mod.ts";

Deno.test("cn later padding wins", () => {
  assertEquals(cn("p-2", "p-4"), "p-4");
});

Deno.test("cn group conflict resolves to p-4", () => {
  assertEquals(cn("px-2", "p-4"), "p-4");
});

Deno.test("cn skips falsy values", () => {
  assertEquals(
    cn("text-red-500", false, null, undefined, "text-blue-500"),
    "text-blue-500",
  );
});

Deno.test("cn keeps variant and base padding", () => {
  assertEquals(cn("hover:p-2", "p-4"), "hover:p-2 p-4");
});
