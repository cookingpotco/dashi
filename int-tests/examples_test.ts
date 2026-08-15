import { runCase } from "./cases.ts";
import { boot } from "./harness.ts";

Deno.test("hello-world example boots and serves", async () => {
  await using app = await boot(
    new URL("../examples/hello-world/main.ts", import.meta.url),
  );
  await runCase(app, {
    name: "nested page",
    request: { path: "/nested/" },
    status: 200,
  });
});

Deno.test("fragments example boots and serves", async () => {
  await using app = await boot(
    new URL("../examples/fragments/main.ts", import.meta.url),
  );
  await runCase(app, {
    name: "unmatched path",
    request: { path: "/no-such-page" },
    status: 404,
    bodyIncludes: ["Not found"],
  });
});
