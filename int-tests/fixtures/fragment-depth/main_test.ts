import { boot, runCases } from "../../mod.ts";

Deno.test("fragment-depth fixture over HTTP", async (t) => {
  await using app = await boot(
    new URL("./main.tsx", import.meta.url),
  );

  await runCases(t, app, [
    {
      name: "two-level nest is under the serve limit",
      request: { path: "/two" },
      status: 200,
      html: {
        bodyExcludes: ["{{fragment:", "Fragment depth exceeded"],
        select: [{ selector: "#inner", text: "inner" }],
      },
    },
    {
      name: "three-level nest exceeds fragmentDepthLimit 2",
      request: { path: "/three" },
      status: 500,
      html: {
        bodyIncludes: ["Fragment depth exceeded (2): /a → /b → /c"],
        select: [
          {
            selector: "#fault",
            text: "Fragment depth exceeded (2): /a → /b → /c",
          },
        ],
      },
    },
  ]);
});
