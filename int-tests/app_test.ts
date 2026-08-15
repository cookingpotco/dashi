import {
  assertEquals,
  AssertionError,
  assertStringIncludes,
} from "@std/assert";
import { type HttpCase, runCase } from "./cases.ts";
import { boot, formatHttpFailure } from "./harness.ts";

const appCases: HttpCase[] = [
  {
    name: "nested page wraps in both layouts",
    request: { path: "/nested/" },
    status: 200,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    bodyIncludes: ["<!DOCTYPE html>"],
    select: [
      { selector: "h1", text: "Website Title" },
      { selector: "h2", text: "Nested" },
      { selector: "code", text: "nested" },
      { selector: "#pre", text: "from-mw" },
    ],
  },
  {
    name: "interpolated XSS payload is inert",
    request: {
      path: '/?q=<script>alert(1)</script>&title=" onload="alert(1)',
    },
    status: 200,
    bodyIncludes: [
      "&lt;script&gt;alert(1)&lt;/script&gt;",
      "&quot; onload=&quot;alert(1)",
    ],
    bodyExcludes: [
      "<script>alert(1)</script>",
      '" onload="alert(1)',
    ],
  },
  {
    name: "eager fragment substitutes; lazy keeps fallback",
    request: { path: "/embed" },
    status: 200,
    bodyIncludes: ["eager-fragment-body"],
    bodyExcludes: ["{{fragment:"],
    select: [
      { selector: "#frag", text: "eager-fragment-body" },
      { selector: "#fallback", text: "Loading..." },
      { selector: "#lazy", text: "Loading..." },
    ],
  },
  {
    name: "fragment as document includes layouts and doctype",
    request: { path: "/fragment" },
    status: 200,
    headers: { "content-type": "text/html" },
    bodyIncludes: ["<!DOCTYPE html>"],
    select: [
      { selector: "h1", text: "Website Title" },
      { selector: "#frag", text: "eager-fragment-body" },
    ],
  },
  {
    name: "fragment as fragment omits layouts and doctype",
    request: {
      path: "/fragment",
      headers: { "x-fragment": "1" },
    },
    status: 200,
    headers: { "content-type": "text/html" },
    bodyExcludes: ["<!DOCTYPE html>", "Website Title"],
    select: [
      { selector: "#frag", text: "eager-fragment-body" },
    ],
  },
  {
    name: "unmatched path is 404",
    request: { path: "/no-such-page" },
    status: 404,
    bodyIncludes: ["Not found"],
  },
];

Deno.test("fixture app over HTTP", async (t) => {
  await using app = await boot(
    new URL("./fixtures/app/main.ts", import.meta.url),
  );

  for (const httpCase of appCases) {
    await t.step(httpCase.name, async () => {
      await runCase(app, httpCase);
    });
  }

  await t.step("concurrent echo requests stay isolated", async () => {
    const [resA, resB] = await Promise.all([
      app.fetch({ path: "/echo?id=alpha" }),
      app.fetch({ path: "/echo?id=beta" }),
    ]);
    const [bodyA, bodyB] = await Promise.all([resA.text(), resB.text()]);
    try {
      assertEquals(resA.status, 200);
      assertEquals(resB.status, 200);
      assertStringIncludes(bodyA, "alpha");
      assertStringIncludes(bodyB, "beta");
      if (bodyA.includes("beta")) {
        throw new AssertionError('alpha response included "beta"');
      }
      if (bodyB.includes("alpha")) {
        throw new AssertionError('beta response included "alpha"');
      }
    } catch (error) {
      const dump = [
        formatHttpFailure(app, { path: "/echo?id=alpha" }, resA, bodyA),
        formatHttpFailure(app, { path: "/echo?id=beta" }, resB, bodyB),
      ].join("\n\n");
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });
});
