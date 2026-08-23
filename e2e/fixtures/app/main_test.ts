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

      await t.step("client.element script stamps the page", async () => {
        await page.goto(`${app.origin}/mark`);
        const text = await page.evaluate(async () => {
          await customElements.whenDefined("mark-el");
          return document.querySelector("mark-el")?.textContent;
        });
        assertEquals(text, "from-lib");
      });

      await t.step("client.module script stamps the page", async () => {
        await page.goto(`${app.origin}/paint`);
        const text = await page.evaluate(async () => {
          const start = Date.now();
          while (
            document.getElementById("paint-target")?.textContent !==
              "from-module"
          ) {
            if (Date.now() - start > 5000) {
              throw new Error("client.module did not stamp");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          return document.getElementById("paint-target")?.textContent;
        });
        assertEquals(text, "from-module");
      });

      await t.step(
        "eager and nested fragment scripts stamp the page",
        async () => {
          await page.goto(`${app.origin}/embed`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("eager-el");
            await customElements.whenDefined("nested-el");
            return {
              eager: document.querySelector("eager-el")?.textContent,
              nested: document.querySelector("nested-el")?.textContent,
            };
          });
          assertEquals(result, {
            eager: "eager-ran",
            nested: "nested-ran",
          });
        },
      );

      await t.step("lazy fragment script stamps the page", async () => {
        await page.goto(`${app.origin}/embed`);
        const text = await page.evaluate(async () => {
          await customElements.whenDefined("route-fragment");
          const start = Date.now();
          while (
            document.querySelector("lazy-el")?.textContent !== "lazy-ran"
          ) {
            if (Date.now() - start > 5000) {
              throw new Error("lazy fragment client did not stamp");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          return document.querySelector("lazy-el")?.textContent;
        });
        assertEquals(text, "lazy-ran");
      });
    },
  );
});
