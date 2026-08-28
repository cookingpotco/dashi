import { boot, type IntegrationTestCase, runCases } from "../../mod.ts";

const stillServes: IntegrationTestCase = {
  name: "known-good route is 200",
  request: { path: "/" },
  status: 200,
  headers: { "x-mw": "ok" },
  html: {
    select: [{ selector: "#home", text: "home" }],
  },
};

Deno.test("error-defaults fixture over HTTP", async (t) => {
  await using app = await boot(
    new URL("./main.tsx", import.meta.url),
  );

  await runCases(t, app, [
    {
      name: "omitted notFound is plain 404",
      request: { path: "/nope" },
      status: 404,
      headers: { "x-mw": "ok" },
      bodyExact: "Not found",
    },
    {
      name: "handler throws with no error uses fatal",
      request: { path: "/throw" },
      status: 500,
      headers: { "x-mw": "ok" },
      bodyExact: "Something Went Wrong",
      stillServes: true,
    },
    {
      name: "root layout throws with omitted fatal",
      request: { path: "/root-layout-throws" },
      status: 500,
      bodyExact: "Something Went Wrong",
      stillServes: true,
    },
  ], stillServes);
});
