import { assertEquals } from "@std/assert";
import { withBrowser } from "../../harness.ts";

Deno.test("app fixture", async (t) => {
  await withBrowser(
    new URL("./main.ts", import.meta.url),
    async ({ app, page }) => {
      await t.step("home heading is ok", async () => {
        await page.goto(`${app.origin}/`);
        const heading = await page.$("h1");
        assertEquals(await heading?.innerText(), "ok");
      });

      await t.step("route-fragment upgrades", async () => {
        await page.goto(`${app.origin}/embed`);
        const result = await page.evaluate(() =>
          customElements.whenDefined("route-fragment").then(() => ({
            defined: customElements.get("route-fragment") != null,
            present: document.querySelector("route-fragment") != null,
          }))
        );
        assertEquals(result, { defined: true, present: true });
      });
    },
  );
});
