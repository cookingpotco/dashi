import { type IntegrationTestCase, runCases } from "../../cases.ts";
import { boot } from "../../harness.ts";

const stillServes: IntegrationTestCase = {
  name: "known-good route is 200",
  request: { path: "/" },
  status: 200,
  html: {
    select: [{ selector: "#home", text: "home" }],
  },
};

Deno.test("error-fallback-response fixture over HTTP", async (t) => {
  await using app = await boot(
    new URL("./main.tsx", import.meta.url),
  );

  await runCases(t, app, [
    {
      name: "root layout throws uses errorFallback Response",
      request: { path: "/root-layout-throws" },
      status: 500,
      headers: { "x-fallback": "1" },
      bodyExact: "fallback-response",
      stillServes: true,
    },
  ], stillServes);
});
