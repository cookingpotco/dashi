import { assertEquals } from "@std/assert";
import { withBrowser } from "../../harness.ts";
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

async function typeField(page: Page, selector: string, text: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!(el instanceof HTMLElement)) {
      throw new Error("missing field");
    }
    el.focus();
  }, { args: [selector] });
  await page.keyboard.type(text);
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

async function waitForText(page: Page, id: string, text: string) {
  await page.evaluate(async (expected) => {
    const start = Date.now();
    while (
      document.getElementById(expected.id)?.textContent !== expected.text
    ) {
      if (Date.now() - start > 5000) {
        throw new Error(
          `#${expected.id} is ${
            document.getElementById(expected.id)?.textContent
          }, not ${expected.text}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }, { args: [{ id, text }] });
}

async function writeCount(page: Page): Promise<string> {
  return await page.evaluate(async () => {
    const res = await fetch("/writes");
    return await res.text();
  });
}

async function markDoc(page: Page) {
  await page.evaluate(() => {
    Reflect.set(globalThis, "__dashiDoc", true);
    const persistent = document.getElementById("persistent");
    if (persistent) {
      persistent.textContent = "mutated";
    }
    const marker = document.getElementById("page-marker");
    if (marker) {
      marker.textContent = "mutated";
    }
  });
}

async function prepareHosted(page: Page, origin: string, path: string) {
  await page.goto(`${origin}${path}`);
  await page.evaluate(() => customElements.whenDefined("navigation-root"));
  await markDoc(page);
}

async function prepareFrag(page: Page, origin: string, path: string) {
  await page.goto(`${origin}${path}`);
  await page.evaluate(() => customElements.whenDefined("navigation-root"));
  await page.evaluate(() => customElements.whenDefined("route-fragment"));
  await markDoc(page);
}

async function prepareBareFrag(page: Page, origin: string, path: string) {
  await page.goto(`${origin}${path}`);
  await page.evaluate(() => customElements.whenDefined("route-fragment"));
  await markDoc(page);
}

async function prepareBare(page: Page, origin: string, path: string) {
  await page.goto(`${origin}${path}`);
  await markDoc(page);
}

function snapshot() {
  return {
    survived: Reflect.get(globalThis, "__dashiDoc") === true,
    persistent: document.getElementById("persistent")?.textContent ?? null,
    heading: document.getElementById("heading")?.textContent ?? null,
    url: location.href,
    host: document.querySelector("navigation-root") !== null,
  };
}

Deno.test("forms fixture", async (t) => {
  await withBrowser(
    new URL("./main.ts", import.meta.url),
    async ({ app, page }) => {
      await t.step(
        "page-host write that redirects swaps in place at the new URL",
        async () => {
          await prepareHosted(page, app.origin, "/entries");
          await clickId(page, "redirect-submit");
          await waitForHeading(page, "search");
          const result = await page.evaluate(snapshot);
          assertEquals(result, {
            survived: true,
            persistent: "mutated",
            heading: "search",
            url: `${app.origin}/search`,
            host: true,
          });
        },
      );

      await t.step(
        "back after a redirect lands on the pre-submit page without re-posting",
        async () => {
          await prepareHosted(page, app.origin, "/entries");
          await clickId(page, "redirect-submit");
          await waitForHeading(page, "search");
          const afterSubmit = await writeCount(page);
          await page.evaluate(() => history.back());
          await waitForHeading(page, "entries");
          const afterBack = await writeCount(page);
          const result = await page.evaluate(snapshot);
          assertEquals(afterBack, afterSubmit);
          assertEquals(result, {
            survived: true,
            persistent: "mutated",
            heading: "entries",
            url: `${app.origin}/entries`,
            host: true,
          });
        },
      );

      await t.step(
        "validation error updates a fragment without a history write",
        async () => {
          await prepareHosted(page, app.origin, "/entries");
          await page.evaluate(() =>
            customElements.whenDefined("route-fragment")
          );
          const before = await page.evaluate(() => history.length);
          await clickId(page, "validate-submit");
          await waitForText(page, "error", "title is required");
          const result = await page.evaluate((length) => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            persistent: document.getElementById("persistent")?.textContent ??
              null,
            heading: document.getElementById("heading")?.textContent ?? null,
            url: location.href,
            history: history.length,
            before: length,
            error: document.getElementById("error")?.textContent ?? null,
          }), { args: [before] });
          assertEquals(result.survived, true);
          assertEquals(result.persistent, "mutated");
          assertEquals(result.heading, "entries");
          assertEquals(result.url, `${app.origin}/entries`);
          assertEquals(result.error, "title is required");
          assertEquals(result.history, result.before);
        },
      );

      await t.step("GET form navigates with the query in the URL", async () => {
        await prepareHosted(page, app.origin, "/entries");
        await typeField(page, "#page-search-q", "hello");
        await clickId(page, "page-search-submit");
        await waitForHeading(page, "search");
        const result = await page.evaluate(() => ({
          survived: Reflect.get(globalThis, "__dashiDoc") === true,
          persistent: document.getElementById("persistent")?.textContent ??
            null,
          heading: document.getElementById("heading")?.textContent ?? null,
          query: document.getElementById("query")?.textContent ?? null,
          url: location.href,
        }));
        assertEquals(result.survived, true);
        assertEquals(result.persistent, "mutated");
        assertEquals(result.heading, "search");
        assertEquals(result.query, "hello");
        assertEquals(result.url, `${app.origin}/search?q=hello`);
      });

      await t.step(
        "header GET form outside the page host navigates too",
        async () => {
          await prepareHosted(page, app.origin, "/entries");
          await typeField(page, "#header-search-q", "from-header");
          await clickId(page, "header-search-submit");
          await waitForHeading(page, "search");
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            heading: document.getElementById("heading")?.textContent ?? null,
            query: document.getElementById("query")?.textContent ?? null,
            url: location.href,
          }));
          assertEquals(result.survived, true);
          assertEquals(result.heading, "search");
          assertEquals(result.query, "from-header");
          assertEquals(result.url, `${app.origin}/search?q=from-header`);
        },
      );

      await t.step(
        "form outside a fragment updates that fragment via actions",
        async () => {
          await prepareFrag(page, app.origin, "/frag-page");
          await typeField(page, "#header-write-title", "from-header");
          await clickId(page, "header-write-submit");
          await waitForText(page, "frag-item", "from-header");
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            persistent: document.getElementById("persistent")?.textContent ??
              null,
            heading: document.getElementById("heading")?.textContent ?? null,
            marker: document.getElementById("page-marker")?.textContent ??
              null,
            item: document.getElementById("frag-item")?.textContent ?? null,
            url: location.href,
          }));
          assertEquals(result.survived, true);
          assertEquals(result.persistent, "mutated");
          assertEquals(result.heading, "frag-page");
          assertEquals(result.marker, "mutated");
          assertEquals(result.item, "from-header");
          assertEquals(result.url, `${app.origin}/frag-page`);
        },
      );

      await t.step(
        "write inside a fragment swaps only that host",
        async () => {
          await prepareFrag(page, app.origin, "/frag-page");
          await typeField(page, "#frag-write-title", "milk");
          await clickId(page, "frag-write-submit");
          await waitForText(page, "frag-item", "milk");
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            persistent: document.getElementById("persistent")?.textContent ??
              null,
            heading: document.getElementById("heading")?.textContent ?? null,
            marker: document.getElementById("page-marker")?.textContent ??
              null,
            item: document.getElementById("frag-item")?.textContent ?? null,
            itemInHost: document.querySelector("route-fragment[src='/frag']")
              ?.querySelector("#frag-item")?.textContent ?? null,
            url: location.href,
          }));
          assertEquals(result.survived, true);
          assertEquals(result.persistent, "mutated");
          assertEquals(result.heading, "frag-page");
          assertEquals(result.marker, "mutated");
          assertEquals(result.item, "milk");
          assertEquals(result.itemInHost, "milk");
          assertEquals(result.url, `${app.origin}/frag-page`);
        },
      );

      await t.step(
        "GET form inside a fragment navigates the page",
        async () => {
          await prepareFrag(page, app.origin, "/frag-page");
          await typeField(page, "#frag-get-q", "inside");
          await clickId(page, "frag-get-submit");
          await waitForHeading(page, "search");
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            persistent: document.getElementById("persistent")?.textContent ??
              null,
            heading: document.getElementById("heading")?.textContent ?? null,
            query: document.getElementById("query")?.textContent ?? null,
            frag: document.querySelector("route-fragment[src='/frag']") !==
              null,
            url: location.href,
          }));
          assertEquals(result.survived, true);
          assertEquals(result.persistent, "mutated");
          assertEquals(result.heading, "search");
          assertEquals(result.query, "inside");
          assertEquals(result.frag, false);
          assertEquals(result.url, `${app.origin}/search?q=inside`);
        },
      );

      await t.step(
        "fragment write that redirects escalates to an in-place page swap",
        async () => {
          await prepareFrag(page, app.origin, "/frag-page");
          await clickId(page, "frag-leave-submit");
          await waitForHeading(page, "search");
          const result = await page.evaluate(snapshot);
          assertEquals(result, {
            survived: true,
            persistent: "mutated",
            heading: "search",
            url: `${app.origin}/search`,
            host: true,
          });
        },
      );

      await t.step(
        "hardNavigation form does a real document load",
        async () => {
          await prepareHosted(page, app.origin, "/entries");
          await Promise.all([
            page.waitForNavigation(),
            clickId(page, "hard-submit"),
          ]);
          const result = await page.evaluate(snapshot);
          assertEquals(result.survived, false);
          assertEquals(result.heading, "search");
          assertEquals(result.url, `${app.origin}/search`);
        },
      );

      await t.step(
        "a second submit during a slow write is dropped",
        async () => {
          await prepareHosted(page, app.origin, "/slow-write");
          const before = await writeCount(page);
          await clickId(page, "slow-submit");
          const busy = await page.evaluate(() =>
            document.getElementById("slow-form")?.getAttribute("aria-busy")
          );
          assertEquals(busy, "true");
          await clickId(page, "slow-submit");
          await waitForHeading(page, "wrote");
          const after = await writeCount(page);
          assertEquals(Number(after), Number(before) + 1);
          const result = await page.evaluate(snapshot);
          assertEquals(result.survived, true);
          assertEquals(result.heading, "wrote");
          assertEquals(result.url, `${app.origin}/wrote`);
        },
      );

      await t.step(
        "a non-HTML write response does a real GET load of the final URL",
        async () => {
          await prepareHosted(page, app.origin, "/entries");
          await Promise.all([
            page.waitForNavigation(),
            clickId(page, "json-submit"),
          ]);
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            url: location.pathname,
            body: document.body?.textContent ?? "",
          }));
          assertEquals(result.survived, false);
          assertEquals(result.url, "/json-write");
          assertEquals(result.body.includes("json"), true);
        },
      );

      await t.step(
        "write inside a fragment applies actions with no page host",
        async () => {
          await prepareBareFrag(page, app.origin, "/bare-frag-page");
          await typeField(page, "#frag-write-title", "bare-milk");
          await clickId(page, "frag-write-submit");
          await waitForText(page, "frag-item", "bare-milk");
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            heading: document.getElementById("heading")?.textContent ?? null,
            item: document.getElementById("frag-item")?.textContent ?? null,
            url: location.pathname,
            host: document.querySelector("navigation-root") !== null,
          }));
          assertEquals(result, {
            survived: true,
            heading: "frag-page",
            item: "bare-milk",
            url: "/bare-frag-page",
            host: false,
          });
        },
      );

      await t.step(
        "fragment redirect without a page host does a real document load",
        async () => {
          await prepareBareFrag(page, app.origin, "/bare-frag-page");
          await Promise.all([
            page.waitForNavigation(),
            clickId(page, "frag-leave-submit"),
          ]);
          const result = await page.evaluate(snapshot);
          assertEquals(result.survived, false);
          assertEquals(result.heading, "search");
          assertEquals(result.url, `${app.origin}/search`);
        },
      );

      await t.step(
        "GET form without a page host does a real document load",
        async () => {
          await prepareBareFrag(page, app.origin, "/bare-frag-page");
          await typeField(page, "#frag-get-q", "native");
          await Promise.all([
            page.waitForNavigation(),
            clickId(page, "frag-get-submit"),
          ]);
          const result = await page.evaluate(() => ({
            survived: Reflect.get(globalThis, "__dashiDoc") === true,
            heading: document.getElementById("heading")?.textContent ?? null,
            query: document.getElementById("query")?.textContent ?? null,
            url: location.href,
          }));
          assertEquals(result.survived, false);
          assertEquals(result.heading, "search");
          assertEquals(result.query, "native");
          assertEquals(result.url, `${app.origin}/search?q=native`);
        },
      );

      await t.step("form with no host submits natively", async () => {
        await prepareBare(page, app.origin, "/bare");
        await Promise.all([
          page.waitForNavigation(),
          clickId(page, "bare-submit"),
        ]);
        const result = await page.evaluate(snapshot);
        assertEquals(result.survived, false);
        assertEquals(result.heading, "search");
        assertEquals(result.url, `${app.origin}/search`);
      });
    },
  );
});
