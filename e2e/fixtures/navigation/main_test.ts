import { assertEquals } from "@std/assert";
import { boot, withBrowser } from "../../harness.ts";
import type { Page } from "../../harness.ts";

async function clickId(page: Page, id: string) {
  await page.evaluate((sel) => {
    const el = document.getElementById(sel);
    if (!(el instanceof HTMLElement)) {
      throw new Error(`missing #${sel}`);
    }
    el.click();
  }, { args: [id] });
}

async function waitForHeading(page: Page, text: string) {
  await page.evaluate(async (expected) => {
    const start = Date.now();
    while (document.getElementById("heading")?.textContent !== expected) {
      if (Date.now() - start > 5000) {
        throw new Error(
          `heading is ${
            document.getElementById("heading")?.textContent
          }, not ${expected}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }, { args: [text] });
}

async function waitForPath(page: Page, path: string) {
  await page.evaluate(async (expected) => {
    const start = Date.now();
    while (location.pathname !== expected) {
      if (Date.now() - start > 5000) {
        throw new Error(
          `pathname is ${location.pathname}, not ${expected}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }, { args: [path] });
}

async function prepare(page: Page, origin: string, path: string) {
  await page.goto(`${origin}${path}`);
  await page.evaluate(() => customElements.whenDefined("route-navigation"));
  await page.evaluate(() => {
    Reflect.set(globalThis, "__dashiDoc", true);
    const chrome = document.getElementById("chrome");
    if (chrome) {
      chrome.textContent = "mutated";
    }
  });
}

function snapshot() {
  return {
    survived: Reflect.get(globalThis, "__dashiDoc") === true,
    chrome: document.getElementById("chrome")?.textContent ?? null,
    heading: document.getElementById("heading")?.textContent ?? null,
    url: location.href,
    scroll: scrollY,
    host: document.querySelector("route-navigation") !== null,
  };
}

Deno.test("navigation fixture", async (t) => {
  await withBrowser(
    new URL("./main.ts", import.meta.url),
    async ({ app, page }) => {
      await t.step(
        "clicking a link from a scrolled page swaps in place",
        async () => {
          await prepare(page, app.origin, "/tall");
          const scrolled = await page.evaluate(() => {
            scrollTo(0, 800);
            return scrollY;
          });
          if (scrolled === 0) {
            throw new Error("tall page did not scroll");
          }
          await clickId(page, "to-widget");
          await waitForPath(page, "/widget");
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("widget-el");
            return {
              survived: Reflect.get(globalThis, "__dashiDoc") === true,
              chrome: document.getElementById("chrome")?.textContent ?? null,
              heading: document.getElementById("heading")?.textContent ?? null,
              widget: document.querySelector("widget-el")?.textContent ?? null,
              url: location.pathname,
              scroll: scrollY,
            };
          });
          assertEquals(result, {
            survived: true,
            chrome: "mutated",
            heading: "widget",
            widget: "widget-upgraded",
            url: "/widget",
            scroll: 0,
          });
        },
      );

      await t.step("back restores the previous page and scroll", async () => {
        await prepare(page, app.origin, "/tall");
        const scrolled = await page.evaluate(() => {
          scrollTo(0, 800);
          return scrollY;
        });
        if (scrolled === 0) {
          throw new Error("tall page did not scroll");
        }
        await clickId(page, "to-about");
        await waitForHeading(page, "about");
        await page.evaluate(() => history.back());
        await waitForHeading(page, "tall");
        const back = await page.evaluate(() => ({
          survived: Reflect.get(globalThis, "__dashiDoc") === true,
          heading: document.getElementById("heading")?.textContent ?? null,
          scroll: scrollY,
          url: location.pathname,
        }));
        assertEquals(back.survived, true);
        assertEquals(back.heading, "tall");
        assertEquals(back.url, "/tall");
        assertEquals(back.scroll, scrolled);
        await page.evaluate(() => history.forward());
        await waitForHeading(page, "about");
        const forward = await page.evaluate(() => ({
          survived: Reflect.get(globalThis, "__dashiDoc") === true,
          heading: document.getElementById("heading")?.textContent ?? null,
          url: location.pathname,
        }));
        assertEquals(forward, {
          survived: true,
          heading: "about",
          url: "/about",
        });
      });

      await t.step(
        "a custom 404 swaps in place with the URL updated",
        async () => {
          await prepare(page, app.origin, "/");
          await clickId(page, "to-missing");
          await waitForPath(page, "/missing");
          const result = await page.evaluate(snapshot);
          assertEquals(result.survived, true);
          assertEquals(result.chrome, "mutated");
          assertEquals(result.heading, "not found");
          assertEquals(result.url, `${app.origin}/missing`);
          assertEquals(result.host, true);
        },
      );

      await t.step(
        "a JSON response falls back to a real document load",
        async () => {
          await prepare(page, app.origin, "/");
          await Promise.all([
            page.waitForNavigation(),
            clickId(page, "to-json"),
          ]);
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            url: location.pathname,
            body: document.body?.textContent ?? "",
          }));
          assertEquals(result.survived, false);
          assertEquals(result.url, "/data");
          assertEquals(result.body.includes("json"), true);
        },
      );

      await t.step(
        "a data-dashi-navigate=false link does a real document load",
        async () => {
          await prepare(page, app.origin, "/");
          await Promise.all([
            page.waitForNavigation(),
            clickId(page, "to-opt-out"),
          ]);
          const result = await page.evaluate(snapshot);
          assertEquals(result.survived, false);
          assertEquals(result.heading, "about");
          assertEquals(result.url, `${app.origin}/about`);
        },
      );

      await t.step(
        "a hash link on the current page is left to the browser",
        async () => {
          await prepare(page, app.origin, "/tall");
          await page.evaluate(() => {
            const heading = document.getElementById("heading");
            if (heading) {
              heading.textContent = "mutated-heading";
            }
          });
          await clickId(page, "to-marker");
          const result = await page.evaluate(async () => {
            const start = Date.now();
            while (location.hash !== "#marker") {
              if (Date.now() - start > 5000) {
                throw new Error(`hash is ${location.hash}, not #marker`);
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
            return {
              survived: Reflect.get(globalThis, "__dashiDoc") === true,
              heading: document.getElementById("heading")?.textContent ?? null,
              hash: location.hash,
            };
          });
          assertEquals(result, {
            survived: true,
            heading: "mutated-heading",
            hash: "#marker",
          });
        },
      );

      await t.step(
        "a cross-origin link does a real document load",
        async () => {
          await using other = await boot(new URL("./main.ts", import.meta.url));
          await prepare(page, app.origin, "/");
          await page.evaluate((href) => {
            const el = document.getElementById("to-cross");
            if (!(el instanceof HTMLAnchorElement)) {
              throw new Error("missing #to-cross");
            }
            el.href = href;
          }, { args: [`${other.origin}/`] });
          await Promise.all([
            page.waitForNavigation(),
            clickId(page, "to-cross"),
          ]);
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            heading: document.getElementById("heading")?.textContent ?? null,
            url: location.href,
          }));
          assertEquals(result.survived, false);
          assertEquals(result.heading, "home");
          assertEquals(result.url, `${other.origin}/`);
        },
      );

      await t.step(
        "a response whose document has no host does a real document load",
        async () => {
          await prepare(page, app.origin, "/");
          await Promise.all([
            page.waitForNavigation(),
            clickId(page, "to-bare"),
          ]);
          const result = await page.evaluate(snapshot);
          assertEquals(result.survived, false);
          assertEquals(result.heading, "bare");
          assertEquals(result.url, `${app.origin}/bare`);
          assertEquals(result.host, false);
        },
      );

      await t.step(
        "a second click while a slow navigation is in flight wins",
        async () => {
          await prepare(page, app.origin, "/");
          await clickId(page, "to-slow");
          await clickId(page, "to-about");
          await waitForPath(page, "/about");
          await page.evaluate(() =>
            new Promise((resolve) => setTimeout(resolve, 2500))
          );
          const result = await page.evaluate(snapshot);
          assertEquals(result.survived, true);
          assertEquals(result.chrome, "mutated");
          assertEquals(result.heading, "about");
          assertEquals(result.url, `${app.origin}/about`);
        },
      );

      await t.step(
        "navigate() from a client module swaps in place",
        async () => {
          await prepare(page, app.origin, "/");
          await page.evaluate(() => customElements.whenDefined("go-about"));
          await clickId(page, "go-about");
          await waitForHeading(page, "about");
          const result = await page.evaluate(snapshot);
          assertEquals(result.survived, true);
          assertEquals(result.chrome, "mutated");
          assertEquals(result.heading, "about");
          assertEquals(result.url, `${app.origin}/about`);
        },
      );
    },
  );
});
