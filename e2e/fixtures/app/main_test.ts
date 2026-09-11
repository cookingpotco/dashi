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
        "stamped and nested slot scripts stamp the page",
        async () => {
          await page.goto(`${app.origin}/embed`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("stamped-el");
            await customElements.whenDefined("nested-el");
            return {
              stamped: document.querySelector("stamped-el")?.textContent,
              nested: document.querySelector("nested-el")?.textContent,
            };
          });
          assertEquals(result, {
            stamped: "stamped-ran",
            nested: "nested-ran",
          });
        },
      );

      await t.step("connect slot loads lazy content", async () => {
        await page.goto(`${app.origin}/embed`, { waitUntil: "none" });
        const result = await page.evaluate(async () => {
          await customElements.whenDefined("route-slot");
          const start = Date.now();
          while (
            document.querySelector("lazy-el")?.textContent !== "lazy-ran"
          ) {
            if (Date.now() - start > 5000) {
              throw new Error("lazy slot client did not stamp");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          return {
            text: document.querySelector("lazy-el")?.textContent,
          };
        });
        assertEquals(result, { text: "lazy-ran" });
      });

      await t.step(
        "connect slot 500 with error UI",
        async () => {
          await page.goto(`${app.origin}/fail`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("route-slot");
            const start = Date.now();
            while (document.getElementById("frag-error") === null) {
              if (Date.now() - start > 5000) {
                throw new Error("error slot UI did not arrive");
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
            const host = document.querySelector("route-slot");
            return {
              error: document.getElementById("frag-error")?.textContent,
              chrome: document.getElementById("fallback-chrome") !== null,
              hostHasHtml: host?.querySelector("html") !== null,
            };
          });
          assertEquals(result, {
            error: "frag-error-ui",
            chrome: false,
            hostHasHtml: false,
          });
        },
      );

      await t.step("empty 500 keeps the slot empty", async () => {
        await page.goto(`${app.origin}/empty`);
        const result = await page.evaluate(async () => {
          await customElements.whenDefined("route-slot");
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
          const host = document.querySelector("route-slot");
          return {
            error: document.getElementById("frag-error") !== null,
            chrome: document.getElementById("fallback-chrome") !== null,
            hostHasHtml: host?.querySelector("html") !== null,
            body: host?.textContent ?? "",
          };
        });
        assertEquals(result, {
          error: false,
          chrome: false,
          hostHasHtml: false,
          body: "",
        });
      });

      await t.step(
        'fetchWhen="visible" below the fold waits for intersection',
        async () => {
          await page.goto(`${app.origin}/visible-below`);
          const before = await page.evaluate(async () => {
            await customElements.whenDefined("route-slot");
            await new Promise((resolve) => setTimeout(resolve, 500));
            const hits = await (await fetch("/visible-hits")).text();
            return {
              hits,
              fallback: document.getElementById("visible-fallback") !== null,
              body: document.getElementById("visible-counted") !== null,
            };
          });
          assertEquals(before, {
            hits: "0",
            fallback: true,
            body: false,
          });
          const after = await page.evaluate(async () => {
            const host = document.querySelector(
              "route-slot[fetchwhen='visible']",
            );
            if (host === null) {
              throw new Error("missing visible host");
            }
            host.scrollIntoView();
            const start = Date.now();
            while (document.getElementById("visible-counted") === null) {
              if (Date.now() - start > 5000) {
                throw new Error("visible slot did not load");
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
            const hits = await (await fetch("/visible-hits")).text();
            return {
              hits,
              fallback: document.getElementById("visible-fallback") !== null,
              body: document.getElementById("visible-counted")?.textContent,
            };
          });
          assertEquals(after, {
            hits: "1",
            fallback: false,
            body: "visible-counted",
          });
        },
      );

      await t.step(
        "connect slot below the fold fetches without scroll",
        async () => {
          await page.goto(`${app.origin}/lazy-below`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("route-slot");
            const start = Date.now();
            while (document.getElementById("below-counted") === null) {
              if (Date.now() - start > 5000) {
                throw new Error("connect slot did not load");
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
            const hits = await (await fetch("/below-hits")).text();
            return {
              hits,
              body: document.getElementById("below-counted")?.textContent,
            };
          });
          assertEquals(result, {
            hits: "1",
            body: "below-counted",
          });
        },
      );

      await t.step("moving a connect slot does not refetch", async () => {
        await page.goto(`${app.origin}/count`);
        const result = await page.evaluate(async () => {
          await customElements.whenDefined("route-slot");
          const start = Date.now();
          while (document.getElementById("counted") === null) {
            if (Date.now() - start > 5000) {
              throw new Error("counted slot did not arrive");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          const host = document.querySelector("route-slot");
          if (host === null) {
            throw new Error("missing route-slot");
          }
          const dest = document.createElement("div");
          document.body.append(dest);
          dest.append(host);
          await new Promise((resolve) => setTimeout(resolve, 500));
          const hits = await (await fetch("/counted-hits")).text();
          return {
            hits,
            counted: document.getElementById("counted")?.textContent,
          };
        });
        assertEquals(result, {
          hits: "1",
          counted: "counted",
        });
      });

      await t.step(
        "removing a connect slot mid-flight does not write",
        async () => {
          await page.goto(`${app.origin}/embed`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("route-slot");
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
              `<route-slot src="/slow"><span id="slow-fallback">waiting</span></route-slot>`;
            const host = wrap.querySelector("route-slot");
            if (host === null) {
              throw new Error("failed to create route-slot");
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
        "client element inside swapped slot markup upgrades",
        async () => {
          await page.goto(`${app.origin}/todos-page`);
          await page.evaluate(() => customElements.whenDefined("route-slot"));
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

      await t.step(
        "patch update keeps a single todos-root id after repeated submits",
        async () => {
          await page.goto(`${app.origin}/todos-page`);
          await page.evaluate(() => customElements.whenDefined("route-slot"));
          await page.evaluate(async () => {
            const start = Date.now();
            while (document.getElementById("todos-form") === null) {
              if (Date.now() - start > 10000) {
                throw new Error("todos slot did not load");
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
          });

          for (let i = 0; i < 3; i++) {
            await typeField("#todos-form input[name=title]", "milk");
            const addValid = await page.$("#todos-form button");
            if (addValid === null) {
              throw new Error("todos form is missing");
            }
            await addValid.click();
            await page.evaluate(async (expected) => {
              const start = Date.now();
              while (
                document.querySelectorAll("#todos li").length !== expected
              ) {
                if (Date.now() - start > 10000) {
                  throw new Error("todo row did not appear");
                }
                await new Promise((resolve) => setTimeout(resolve, 25));
              }
            }, { args: [i + 1] });
            await typeField("#todos-form input[name=title]", "x");
            await page.keyboard.press("Backspace");
            const addInvalid = await page.$("#todos-form button");
            if (addInvalid === null) {
              throw new Error("todos form is missing");
            }
            await addInvalid.click();
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
          }

          const result = await page.evaluate(() => ({
            roots: document.querySelectorAll("#todos-root").length,
            items: document.querySelectorAll("#todos li").length,
          }));
          assertEquals(result, { roots: 1, items: 3 });
        },
      );

      await t.step("patch list refresh re-GETs the host", async () => {
        await page.goto(`${app.origin}/patches-page`);
        await page.evaluate(() => customElements.whenDefined("route-slot"));
        const initial = await page.evaluate(() =>
          document.getElementById("refresh-stamp")?.textContent
        );
        assertEquals(initial, "1");
        const add = await page.$("#patches-form button");
        if (add === null) {
          throw new Error("patches form is missing");
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
              "route-slot[src='/hits']",
            )?.querySelector("#refresh-stamp")?.textContent ?? null,
          };
        });
        assertEquals(result, {
          url: `${app.origin}/patches-page`,
          stamp: "3",
          stampInHost: "3",
        });
      });

      await t.step(
        "patch list appends to #id, updates todo-count, and updates status",
        async () => {
          await page.goto(`${app.origin}/patches-page`);
          await page.evaluate(() => customElements.whenDefined("route-slot"));
          await page.evaluate(() => {
            const marker = document.getElementById("page-marker");
            if (marker) {
              marker.textContent = "mutated";
            }
          });
          const add = await page.$("#patches-form button");
          if (add === null) {
            throw new Error("patches form is missing");
          }
          await typeField("#patches-form input[name=title]", "action-milk");
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
            const list = document.getElementById("todos");
            const status = document.getElementById("status");
            return {
              url: location.href,
              marker: document.getElementById("page-marker")?.textContent,
              item: document.getElementById("appended-todo")?.textContent,
              itemInList: list?.querySelector("#appended-todo")
                ?.textContent ?? null,
              listTag: list?.localName ?? null,
              count: document.getElementById("todo-count")?.textContent ??
                null,
              statusTag: status?.localName ?? null,
              statusText: status?.textContent ?? null,
            };
          });
          assertEquals(result, {
            url: `${app.origin}/patches-page`,
            marker: "mutated",
            item: "action-milk",
            itemInList: "action-milk",
            listTag: "ul",
            count: "1",
            statusTag: "div",
            statusText: "Saved",
          });
        },
      );

      await t.step("patch list removes a target", async () => {
        await page.goto(`${app.origin}/patches-page`);
        await page.evaluate(() => customElements.whenDefined("route-slot"));
        const dismiss = await page.$("#dismiss-form button");
        if (dismiss === null) {
          throw new Error("dismiss form is missing");
        }
        await dismiss.click();
        await page.evaluate(async () => {
          const start = Date.now();
          while (document.getElementById("notice") !== null) {
            if (Date.now() - start > 10000) {
              throw new Error("notice was not removed");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
        });
        const result = await page.evaluate(() => ({
          url: location.href,
          notice: document.getElementById("notice") !== null,
        }));
        assertEquals(result, {
          url: `${app.origin}/patches-page`,
          notice: false,
        });
      });

      await t.step(
        "patch list prepends inside and inserts beside the host",
        async () => {
          await page.goto(`${app.origin}/patches-page`);
          await page.evaluate(() => customElements.whenDefined("route-slot"));
          const submit = await page.$("#inserts-form button");
          if (submit === null) {
            throw new Error("inserts form is missing");
          }
          await submit.click();
          await page.evaluate(async () => {
            const start = Date.now();
            while (
              document.getElementById("prepended") === null ||
              document.getElementById("before-slot") === null ||
              document.getElementById("after-slot") === null
            ) {
              if (Date.now() - start > 10000) {
                throw new Error("insert patches did not apply");
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
          });
          const result = await page.evaluate(() => {
            const host = document.getElementById("slot");
            return {
              url: location.href,
              host: host !== null,
              firstChild: host?.firstElementChild?.id ?? null,
              prev: host?.previousElementSibling?.id ?? null,
              next: host?.nextElementSibling?.id ?? null,
              inside: host?.querySelector("#slot-inside")?.textContent ??
                null,
              beforeInside: host?.querySelector("#before-slot") !== null,
              afterInside: host?.querySelector("#after-slot") !== null,
            };
          });
          assertEquals(result, {
            url: `${app.origin}/patches-page`,
            host: true,
            firstChild: "prepended",
            prev: "before-slot",
            next: "after-slot",
            inside: "inside",
            beforeInside: false,
            afterInside: false,
          });
        },
      );

      await t.step("patch replace swaps the target element", async () => {
        await page.goto(`${app.origin}/patches-page`);
        await page.evaluate(() => customElements.whenDefined("route-slot"));
        const submit = await page.$("#element-replace-form button");
        if (submit === null) {
          throw new Error("element replace form is missing");
        }
        await submit.click();
        await page.evaluate(async () => {
          const start = Date.now();
          while (
            document.getElementById("element-replace")?.localName !== "p"
          ) {
            if (Date.now() - start > 10000) {
              throw new Error("element replace did not apply");
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
        });
        const result = await page.evaluate(() => {
          const node = document.getElementById("element-replace");
          return {
            tag: node?.localName ?? null,
            text: node?.textContent ?? null,
          };
        });
        assertEquals(result, { tag: "p", text: "replaced" });
      });

      await t.step("patch update on a void host throws", async () => {
        await page.goto(`${app.origin}/patches-page`);
        await page.evaluate(() => customElements.whenDefined("route-slot"));
        const submit = await page.$("#void-update-form button");
        if (submit === null) {
          throw new Error("void update form is missing");
        }
        await submit.click();
        await page.evaluate(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
        });
        const result = await page.evaluate(() => {
          const node = document.getElementById("void-target");
          return {
            tag: node?.localName ?? null,
            value: node instanceof HTMLInputElement ? node.value : null,
          };
        });
        assertEquals(result, { tag: "input", value: "x" });
      });

      await t.step(
        "route-slot rejects a protocol-relative src at construction",
        async () => {
          await page.goto(`${app.origin}/embed`);
          await page.evaluate(() => customElements.whenDefined("route-slot"));
          const result = await page.evaluate(async () => {
            const wrap = document.createElement("div");
            wrap.innerHTML =
              '<route-slot src="//evil.example/frag"><span id="evil-fallback">wait</span></route-slot>';
            document.body.append(...wrap.childNodes);
            await new Promise((resolve) => setTimeout(resolve, 500));
            const host = document.querySelector(
              'route-slot[src="//evil.example/frag"]',
            );
            const fetchedEvil = performance.getEntriesByType("resource").some(
              (entry) => entry.name.includes("evil.example"),
            );
            return {
              fallback: document.getElementById("evil-fallback")?.textContent ??
                null,
              loaded: host?.querySelector("#slot-inside")?.textContent ?? null,
              fetchedEvil,
            };
          });
          assertEquals(result, {
            fallback: "wait",
            loaded: null,
            fetchedEvil: false,
          });
        },
      );

      await t.step(
        "route-slot keeps fallback when the response is not HTML",
        async () => {
          await page.goto(`${app.origin}/trust-slots`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("route-slot");
            const jsonHost = document.querySelector(
              'route-slot[src="/slot-json"]',
            );
            const start = Date.now();
            while (Date.now() - start < 5000) {
              const fetched = performance.getEntriesByType("resource").some(
                (entry) => entry.name.includes("/slot-json"),
              );
              const busy = jsonHost?.getAttribute("aria-busy");
              if (fetched && busy !== "true") {
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
            return {
              good: document.getElementById("slot-inside")?.textContent ?? null,
              jsonFallback:
                document.getElementById("json-fallback")?.textContent ?? null,
              jsonInside: jsonHost?.querySelector("#slot-inside")
                ?.textContent ?? null,
            };
          });
          assertEquals(result, {
            good: "inside",
            jsonFallback: "json-fallback",
            jsonInside: null,
          });
        },
      );

      await t.step(
        "route-slot keeps fallback when the response redirects cross-origin",
        async () => {
          await page.goto(`${app.origin}/trust-slots`);
          const result = await page.evaluate(async () => {
            await customElements.whenDefined("route-slot");
            const start = Date.now();
            while (Date.now() - start < 2000) {
              const fetched = performance.getEntriesByType("resource").some(
                (entry) => entry.name.includes("/slot-redirect-away"),
              );
              if (fetched) {
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
            return {
              redirectFallback:
                document.getElementById("redirect-fallback")?.textContent ??
                  null,
              redirectInside: document.querySelector(
                'route-slot[src="/slot-redirect-away"] #slot-inside',
              )?.textContent ?? null,
            };
          });
          assertEquals(result, {
            redirectFallback: "redirect-fallback",
            redirectInside: null,
          });
        },
      );
    },
  );
});
