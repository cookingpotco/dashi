import { assertEquals, assertFalse, assertStringIncludes } from "@std/assert";
import { type IntegrationTestCase, runCase } from "./cases.ts";
import { boot, formatIntegrationFailure } from "./harness.ts";

const appCases: IntegrationTestCase[] = [
  {
    name: "nested page wraps in both layouts",
    request: { path: "/nested" },
    status: 200,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    bodyIncludes: ["<!DOCTYPE html>"],
    select: [
      { selector: "html > body > h1", text: "Website Title" },
      { selector: "html > body > div > h2", text: "Nested" },
      { selector: "html > body > div > div > code", text: "nested" },
      { selector: "html > body > #pre", text: "from-mw" },
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
    bodyExcludes: ["{{fragment:"],
    select: [
      {
        selector: "route-fragment:not([lazy]) #frag",
        text: "eager-fragment-body",
      },
      { selector: "route-fragment[lazy] #fallback", text: "Loading..." },
      { selector: "route-fragment[lazy] #frag", exists: false },
    ],
  },
  {
    name: "fragment as document includes layouts and doctype",
    request: { path: "/fragment" },
    status: 200,
    headers: { "content-type": "text/html" },
    bodyIncludes: ["<!DOCTYPE html>"],
    select: [
      { selector: "html > body > h1", text: "Website Title" },
      { selector: "html > body > #frag", text: "eager-fragment-body" },
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
    bodyExcludes: ["<!DOCTYPE html>"],
    select: [
      { selector: "#frag", text: "eager-fragment-body" },
      { selector: "h1", exists: false },
    ],
  },
  {
    name: "unmatched path is 404",
    request: { path: "/no-such-page" },
    status: 404,
    bodyIncludes: ["Not found"],
  },
  {
    name: "static /posts/new beats /posts/:id",
    request: { path: "/posts/new" },
    status: 200,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    select: [
      { selector: "html > body > h1", text: "Website Title" },
      { selector: "html > body > p#new-post", text: "new-post" },
      { selector: "html > body > #pre", text: "from-mw" },
    ],
  },
  {
    name: "param route renders params.id",
    request: { path: "/posts/abc" },
    status: 200,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    select: [
      { selector: "html > body > h1", text: "Website Title" },
      { selector: "html > body > p#post", text: "abc" },
      { selector: "html > body > #pre", text: "from-mw" },
    ],
  },
];

Deno.test("fixture app over HTTP", async (t) => {
  await using app = await boot(
    new URL("./fixtures/app/main.ts", import.meta.url),
  );

  for (const testCase of appCases) {
    await t.step(testCase.name, async () => {
      await runCase(app, testCase);
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
      assertFalse(bodyA.includes("beta"));
      assertFalse(bodyB.includes("alpha"));
    } catch (error) {
      const dump = [
        formatIntegrationFailure(app, { path: "/echo?id=alpha" }, resA, bodyA),
        formatIntegrationFailure(app, { path: "/echo?id=beta" }, resB, bodyB),
      ].join("\n\n");
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });
});
