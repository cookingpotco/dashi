import { assertEquals } from "@std/assert";
import { withBrowser } from "../../harness.ts";
import { start } from "./main.ts";

Deno.test("app fixture", async (t) => {
  await withBrowser(
    start,
    async ({ app, page }) => {
      async function typeField(selector: string, text: string) {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!(el instanceof HTMLElement)) {
            throw new Error("missing field");
          }
          el.focus();
        }, { args: [selector] });
        await page.keyboard.type(text);
      }

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

      await t.step("lazy fragment shows fallback then content", async () => {
        await page.goto(`${app.origin}/embed`, { waitUntil: "none" });
        const result = await page.evaluate(async () => {
          const start = Date.now();
          let first: { fallback: boolean; lazyEl: boolean } | undefined;
          while (first === undefined) {
            const host = document.querySelector("route-fragment[lazy]");
            if (host) {
              first = {
                fallback: host.querySelector("#lazy-fallback") !== null,
                lazyEl: host.querySelector("lazy-el") !== null,
              };
            } else if (Date.now() - start > 5000) {
              throw new Error("lazy host did not appear");
            } else {
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
          }
          await customElements.whenDefined("route-fragment");
          while (
            document.querySelector("lazy-el")?.textContent !== "lazy-ran"
          ) {
            if (Date.now() - start > 5000) {
              throw new Error("lazy fragment client did not stamp");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          return {
            first,
            after: {
              text: document.querySelector("lazy-el")?.textContent,
              fallback: document.querySelector("#lazy-fallback") !== null,
            },
          };
        });
        assertEquals(result.first, { fallback: true, lazyEl: false });
        assertEquals(result.after, { text: "lazy-ran", fallback: false });
      });

      await t.step(
        "lazy fragment 500 with error UI replaces fallback",
        async () => {
          await page.goto(`${app.origin}/fail`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("route-fragment");
            const start = Date.now();
            while (document.getElementById("frag-error") === null) {
              if (Date.now() - start > 5000) {
                throw new Error("error fragment UI did not arrive");
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
            const host = document.querySelector("route-fragment");
            return {
              error: document.getElementById("frag-error")?.textContent,
              fallback: document.getElementById("fail-fallback") !== null,
              chrome: document.getElementById("fallback-chrome") !== null,
              hostHasHtml: host?.querySelector("html") !== null,
            };
          });
          assertEquals(result, {
            error: "frag-error-ui",
            fallback: false,
            chrome: false,
            hostHasHtml: false,
          });
        },
      );

      await t.step("empty 500 keeps the fallback", async () => {
        await page.goto(`${app.origin}/empty`);
        const result = await page.evaluate(async () => {
          await customElements.whenDefined("route-fragment");
          const start = Date.now();
          while (
            !performance.getEntriesByType("resource").some((entry) =>
              entry.name.includes("/empty-fail")
            )
          ) {
            if (Date.now() - start > 5000) {
              throw new Error("empty-fail was not fetched");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          const host = document.querySelector("route-fragment");
          return {
            fallback: document.getElementById("empty-fallback")?.textContent,
            error: document.getElementById("frag-error") !== null,
            chrome: document.getElementById("fallback-chrome") !== null,
            hostHasHtml: host?.querySelector("html") !== null,
          };
        });
        assertEquals(result, {
          fallback: "Loading empty...",
          error: false,
          chrome: false,
          hostHasHtml: false,
        });
      });

      await t.step("moving a lazy fragment does not refetch", async () => {
        await page.goto(`${app.origin}/count`);
        const result = await page.evaluate(async () => {
          await customElements.whenDefined("route-fragment");
          const start = Date.now();
          while (document.getElementById("counted") === null) {
            if (Date.now() - start > 5000) {
              throw new Error("counted fragment did not arrive");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          const host = document.querySelector("route-fragment");
          if (host === null) {
            throw new Error("missing route-fragment");
          }
          const dest = document.createElement("div");
          document.body.append(dest);
          dest.append(host);
          await new Promise((resolve) => setTimeout(resolve, 500));
          const hits = await (await fetch("/counted-hits")).text();
          return {
            hits,
            counted: document.getElementById("counted")?.textContent,
            fallback: document.getElementById("count-fallback") !== null,
          };
        });
        assertEquals(result, {
          hits: "1",
          counted: "counted",
          fallback: false,
        });
      });

      await t.step(
        "removing a lazy fragment mid-flight does not write",
        async () => {
          await page.goto(`${app.origin}/embed`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("route-fragment");
            const errors: string[] = [];
            const onError = (event: ErrorEvent) => {
              errors.push(event.message);
            };
            const onRejection = (event: PromiseRejectionEvent) => {
              errors.push(String(event.reason));
            };
            globalThis.addEventListener("error", onError);
            globalThis.addEventListener("unhandledrejection", onRejection);
            const wrap = document.createElement("div");
            wrap.innerHTML =
              `<route-fragment src="/slow" lazy><span id="slow-fallback">waiting</span></route-fragment>`;
            const host = wrap.querySelector("route-fragment");
            if (host === null) {
              throw new Error("failed to create route-fragment");
            }
            document.body.append(host);
            host.remove();
            await new Promise((resolve) => setTimeout(resolve, 2500));
            globalThis.removeEventListener("error", onError);
            globalThis.removeEventListener("unhandledrejection", onRejection);
            return {
              errors,
              connected: host.isConnected,
              body: host.querySelector("#slow-body") !== null,
              fallback: host.querySelector("#slow-fallback") !== null,
              text: host.textContent,
            };
          });
          assertEquals(result, {
            errors: [],
            connected: false,
            body: false,
            fallback: true,
            text: "waiting",
          });
        },
      );

      await t.step(
        "client element inside swapped fragment markup upgrades",
        async () => {
          await page.goto(`${app.origin}/todos-page`);
          await page.evaluate(() =>
            customElements.whenDefined("route-fragment")
          );
          const add = await page.$("#todos-form button");
          if (add === null) {
            throw new Error("todos form is missing");
          }
          await typeField("#todos-form input[name=title]", "x");
          await page.keyboard.press("Backspace");
          await add.click();
          await page.evaluate(async () => {
            const start = Date.now();
            while (
              document.querySelector("todo-error-el")?.textContent !==
                "error-upgraded"
            ) {
              if (Date.now() - start > 10000) {
                throw new Error("validation error did not upgrade");
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
          });
          const text = await page.evaluate(() =>
            document.querySelector("todo-error-el")?.textContent
          );
          assertEquals(text, "error-upgraded");
        },
      );

      await t.step("action list refresh re-GETs the host", async () => {
        await page.goto(`${app.origin}/actions-page`);
        await page.evaluate(() => customElements.whenDefined("route-fragment"));
        const initial = await page.evaluate(() =>
          document.getElementById("refresh-stamp")?.textContent
        );
        assertEquals(initial, "1");
        const add = await page.$("#actions-form button");
        if (add === null) {
          throw new Error("actions form is missing");
        }
        await add.click();
        await page.evaluate(async () => {
          const start = Date.now();
          while (
            document.getElementById("refresh-stamp")?.textContent !== "2"
          ) {
            if (Date.now() - start > 10000) {
              throw new Error("refresh stamp did not become 2");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
        });
        await add.click();
        const result = await page.evaluate(async () => {
          const start = Date.now();
          while (
            document.getElementById("refresh-stamp")?.textContent !== "3"
          ) {
            if (Date.now() - start > 10000) {
              throw new Error("refresh stamp did not become 3");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          return {
            url: location.href,
            stamp: document.getElementById("refresh-stamp")?.textContent,
            stampInHost: document.querySelector(
              "route-fragment[src='/hits']",
            )?.querySelector("#refresh-stamp")?.textContent ?? null,
          };
        });
        assertEquals(result, {
          url: `${app.origin}/actions-page`,
          stamp: "3",
          stampInHost: "3",
        });
      });

      await t.step(
        "action list appends and replaces without a page load",
        async () => {
          await page.goto(`${app.origin}/actions-page`);
          await page.evaluate(() =>
            customElements.whenDefined("route-fragment")
          );
          await page.evaluate(() => {
            const marker = document.getElementById("page-marker");
            if (marker) {
              marker.textContent = "mutated";
            }
          });
          const add = await page.$("#actions-form button");
          if (add === null) {
            throw new Error("actions form is missing");
          }
          await typeField("#actions-form input[name=title]", "action-milk");
          await add.click();
          await page.evaluate(async () => {
            const start = Date.now();
            while (document.getElementById("appended-todo") === null) {
              if (Date.now() - start > 10000) {
                throw new Error("appended row did not appear");
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
          });
          const result = await page.evaluate(() => {
            const todosHost = document.querySelector(
              "route-fragment[src='/todos']",
            );
            const countHost = document.querySelector(
              "route-fragment[src='/todo-count']",
            );
            return {
              url: location.href,
              marker: document.getElementById("page-marker")?.textContent,
              item: document.getElementById("appended-todo")?.textContent,
              itemInHost: todosHost?.querySelector("#appended-todo")
                ?.textContent ?? null,
              count: document.getElementById("todo-count")?.textContent,
              countInHost: countHost?.querySelector("#todo-count")
                ?.textContent ?? null,
            };
          });
          assertEquals(result, {
            url: `${app.origin}/actions-page`,
            marker: "mutated",
            item: "action-milk",
            itemInHost: "action-milk",
            count: "1",
            countInHost: "1",
          });
        },
      );

      await t.step("action list removes a host", async () => {
        await page.goto(`${app.origin}/actions-page`);
        await page.evaluate(() => customElements.whenDefined("route-fragment"));
        const dismiss = await page.$("#dismiss-form button");
        if (dismiss === null) {
          throw new Error("dismiss form is missing");
        }
        await dismiss.click();
        await page.evaluate(async () => {
          const start = Date.now();
          while (
            document.querySelector("route-fragment[src='/notice']") !== null
          ) {
            if (Date.now() - start > 10000) {
              throw new Error("notice host was not removed");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
        });
        const result = await page.evaluate(() => ({
          url: location.href,
          host: document.querySelector("route-fragment[src='/notice']") !==
            null,
          notice: document.getElementById("notice") !== null,
        }));
        assertEquals(result, {
          url: `${app.origin}/actions-page`,
          host: false,
          notice: false,
        });
      });
    },
  );
});
