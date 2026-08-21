import { assertEquals } from "@std/assert";
import { withBrowser } from "../../harness.ts";

Deno.test("home heading is ok", async () => {
  await withBrowser(
    new URL("./main.ts", import.meta.url),
    async ({ app, page }) => {
      await page.goto(`${app.origin}/`);
      const heading = await page.$("h1");
      assertEquals(await heading?.innerText(), "ok");
    },
  );
});
