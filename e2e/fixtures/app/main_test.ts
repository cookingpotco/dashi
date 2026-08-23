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

      await t.step("imported library runs in registered client", async () => {
        await page.goto(`${app.origin}/mark`);
        const text = await page.evaluate(async () => {
          await customElements.whenDefined("mark-el");
          return document.querySelector("mark-el")?.textContent;
        });
        assertEquals(text, "from-lib");
      });

      await t.step("eager and nested fragment clients run", async () => {
        await page.goto(`${app.origin}/embed`);
        const result = await page.evaluate(async () => {
          await customElements.whenDefined("route-fragment");
          await customElements.whenDefined("eager-el");
          await customElements.whenDefined("nested-el");
          const start = Date.now();
          while (document.querySelector("#lazy-ssr") === null) {
            if (Date.now() - start > 5000) {
              throw new Error("lazy fragment did not swap");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          return {
            defined: customElements.get("route-fragment") != null,
            eager: document.querySelector("eager-el")?.textContent,
            nested: document.querySelector("nested-el")?.textContent,
            lazy: document.querySelector("#lazy-ssr")?.textContent,
          };
        });
        assertEquals(result, {
          defined: true,
          eager: "eager-ran",
          nested: "nested-ran",
          lazy: "lazy-ssr",
        });
      });
    },
  );
});
