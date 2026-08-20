import { assertEquals, assertStringIncludes } from "@std/assert";
import { type IntegrationTestCase, runCases } from "../../cases.ts";
import { boot, formatIntegrationFailure } from "../../harness.ts";

const corsCases: IntegrationTestCase[] = [
  {
    name: "GET from allowed origin has ACAO",
    request: {
      path: "/",
      headers: { origin: "https://app.example" },
    },
    status: 200,
    headers: {
      "access-control-allow-origin": "https://app.example",
      vary: "Origin",
    },
    json: { ok: true },
  },
  {
    name: "OPTIONS miss is 204 with CORS headers",
    request: {
      method: "OPTIONS",
      path: "/no-such-page",
      headers: { origin: "https://app.example" },
    },
    status: 204,
    headers: {
      "access-control-allow-origin": "https://app.example",
      vary: "Origin",
    },
    bodyExact: "",
  },
];

Deno.test("cors fixture over HTTP", async (t) => {
  await using app = await boot(
    new URL("./main.ts", import.meta.url),
  );

  await runCases(t, app, corsCases);

  await t.step("preflight OPTIONS / is 204 with CORS headers", async () => {
    const request = {
      method: "OPTIONS",
      path: "/",
      headers: {
        origin: "https://app.example",
        "access-control-request-method": "GET",
      },
    };
    const res = await app.fetch(request);
    const body = await res.text();
    try {
      assertEquals(res.status, 204);
      assertEquals(body, "");
      assertEquals(
        res.headers.get("access-control-allow-origin"),
        "https://app.example",
      );
      const allowMethods = res.headers.get("access-control-allow-methods") ??
        "";
      assertStringIncludes(allowMethods, "GET");
      assertStringIncludes(allowMethods, "OPTIONS");
      assertEquals(res.headers.get("vary"), "Origin");
      assertEquals(res.headers.get("allow"), null);
    } catch (error) {
      const dump = formatIntegrationFailure(app, request, res, body);
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

  await t.step("GET from disallowed origin has no ACAO", async () => {
    const request = {
      path: "/",
      headers: { origin: "https://evil.example" },
    };
    const res = await app.fetch(request);
    const body = await res.text();
    try {
      assertEquals(res.status, 200);
      assertEquals(JSON.parse(body), { ok: true });
      assertEquals(res.headers.get("access-control-allow-origin"), null);
    } catch (error) {
      const dump = formatIntegrationFailure(app, request, res, body);
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });
});
