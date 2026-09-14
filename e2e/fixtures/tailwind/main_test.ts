import { assertEquals, assertMatch } from "@std/assert";
import { withBrowser } from "../../harness.ts";
import { start } from "./main.ts";

Deno.test("tailwind builds, links, and applies in the document", async () => {
  await withBrowser(start, async ({ app, page }) => {
    await page.goto(`${app.origin}/`);
    const result = await page.evaluate(() => {
      const sheets = [...document.head.querySelectorAll("link")].flatMap(
        (el) => {
          if (
            !(el instanceof HTMLLinkElement) ||
            !el.relList.contains("stylesheet")
          ) {
            return [];
          }
          return [new URL(el.href).pathname];
        },
      );
      const box = document.getElementById("box");
      return {
        sheets,
        display: box ? getComputedStyle(box).display : "",
      };
    });
    assertMatch(
      result.sheets.join(","),
      /\/generated\/styles-[A-Za-z0-9_-]+\.css/,
    );
    assertEquals(result.display, "flex");
  });
});
