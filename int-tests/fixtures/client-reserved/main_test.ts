import { assertEquals, assertStringIncludes } from "@std/assert";
import { boot, formatIntegrationFailure, runCases } from "../../mod.ts";

async function bootFails(
  spec: URL,
  snippet: string,
): Promise<void> {
  try {
    const app = await boot(spec);
    await app[Symbol.asyncDispose]();
    throw new Error(`expected ${spec.pathname} to fail boot`);
  } catch (thrown) {
    const message = thrown instanceof Error ? thrown.message : String(thrown);
    assertStringIncludes(message, snippet);
  }
}

Deno.test("reserved client path over HTTP", async (t) => {
  await using app = await boot(new URL("./main.tsx", import.meta.url));

  await runCases(t, app, [
    {
      name: "param route still matches",
      request: { path: "/files/1" },
      status: 200,
      bodyExact: "param:1",
    },
    {
      name: "catch-all still matches other paths",
      request: { path: "/other" },
      status: 200,
      bodyExact: "caught:other",
    },
    {
      name: "missing compiled file is reserved 404 not the catch-all",
      request: { path: "/_dashi/client/missing.js" },
      status: 404,
      bodyExact: "Not found",
    },
  ]);

  await t.step("compiled module is not taken by the catch-all", async () => {
    const res = await app.fetch({ path: "/" });
    const html = await res.text();
    const scripts = [
      ...html.matchAll(/<script type="module" src="([^"]+)"><\/script>/g),
    ];
    try {
      assertEquals(scripts.length, 1);
      const src = scripts[0]![1]!;
      assertEquals(src.startsWith("/_dashi/client/"), true);
      const js = await app.fetch({ path: src });
      const body = await js.text();
      assertEquals(js.status, 200);
      assertEquals(js.headers.get("content-type"), "text/javascript");
      assertStringIncludes(body, "probe-el");
    } catch (error) {
      const dump = formatIntegrationFailure(app, { path: "/" }, res, html);
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });
});

Deno.test("declaring the reserved client path fails boot", async (t) => {
  await t.step("same catch-all shape is a duplicate route", async () => {
    await bootFails(
      new URL("../client-reserved-conflict/main.ts", import.meta.url),
      "Duplicate or unreachable route",
    );
  });
  await t.step("a param on the reserved prefix is rejected", async () => {
    await bootFails(
      new URL("../client-reserved-param/main.ts", import.meta.url),
      "reserved path /_dashi/client is declared by the app",
    );
  });
});
