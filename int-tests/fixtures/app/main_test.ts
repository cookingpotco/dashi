import { assertEquals, assertFalse, assertStringIncludes } from "@std/assert";
import { type IntegrationTestCase, runCases } from "../../cases.ts";
import { boot, formatIntegrationFailure } from "../../harness.ts";

const guestbookMultipart = new FormData();
guestbookMultipart.set("body", "from-formdata");

const appCases: IntegrationTestCase[] = [
  {
    name: "nested page wraps in both layouts",
    request: { path: "/nested" },
    status: 200,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      bodyIncludes: ["<!DOCTYPE html>"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > div > h2", text: "Nested" },
        { selector: "html > body > div > div > code", text: "nested" },
        { selector: "html > body > #pre", text: "from-mw" },
      ],
    },
  },
  {
    name: "interpolated XSS payload is inert",
    request: {
      path: '/?q=<script>alert(1)</script>&title=" onload="alert(1)',
    },
    status: 200,
    html: {
      bodyIncludes: [
        "&lt;script&gt;alert(1)&lt;/script&gt;",
        "&quot; onload=&quot;alert(1)",
      ],
      bodyExcludes: [
        "<script>alert(1)</script>",
        '" onload="alert(1)',
      ],
    },
  },
  {
    name: "eager fragment substitutes; lazy keeps fallback",
    request: { path: "/embed" },
    status: 200,
    html: {
      bodyExcludes: ["{{fragment:"],
      select: [
        {
          selector: "route-fragment:not([lazy]) #frag",
          text: "eager-fragment-body",
          attr: {
            "data-pre": "from-mw",
            "data-embed-only": "yes",
            "data-frag-only": "yes",
            "data-frag": "1",
          },
        },
        {
          selector: "#peer",
          text: "peer-body",
          attr: {
            "data-embed-only": "yes",
            "data-frag-only": "",
          },
        },
        { selector: "route-fragment[lazy] #fallback", text: "Loading..." },
        { selector: "route-fragment[lazy] #frag", exists: false },
      ],
    },
  },
  {
    name: "fragment as document includes layouts and doctype",
    request: { path: "/fragment" },
    status: 200,
    headers: { "content-type": "text/html" },
    html: {
      bodyIncludes: ["<!DOCTYPE html>"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        {
          selector: "html > body > #frag",
          text: "eager-fragment-body",
          attr: {
            "data-embed-only": "",
            "data-frag-only": "yes",
            "data-frag": "0",
          },
        },
      ],
    },
  },
  {
    name: "fragment as fragment omits layouts and doctype",
    request: {
      path: "/fragment",
      headers: { "x-fragment": "1" },
    },
    status: 200,
    headers: { "content-type": "text/html" },
    html: {
      bodyExcludes: ["<!DOCTYPE html>"],
      select: [
        {
          selector: "#frag",
          text: "eager-fragment-body",
          attr: {
            "data-embed-only": "",
            "data-frag-only": "yes",
            "data-frag": "1",
          },
        },
        { selector: "h1", exists: false },
      ],
    },
  },
  {
    name: "unmatched path is 404",
    request: { path: "/no-such-page" },
    status: 404,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      bodyIncludes: ["<!DOCTYPE html>"],
      bodyExcludes: ["NestedError"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #pre", text: "from-mw" },
        { selector: "html > body > #not-found", text: "custom-404" },
        { selector: "#nested-error-wrap", exists: false },
      ],
    },
  },
  {
    name: "static /posts/new beats /posts/:id",
    request: { path: "/posts/new" },
    status: 200,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > p#new-post", text: "new-post" },
        { selector: "html > body > #pre", text: "from-mw" },
      ],
    },
  },
  {
    name: "param route renders params.id",
    request: { path: "/posts/abc" },
    status: 200,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > p#post", text: "abc" },
        { selector: "html > body > #pre", text: "from-mw" },
      ],
    },
  },
  {
    name: "POST to GET-only / is 405",
    request: { method: "POST", path: "/" },
    status: 405,
    headers: { allow: "GET" },
    bodyIncludes: ["Method Not Allowed"],
    bodyExcludes: ["<!DOCTYPE html>"],
  },
  {
    name: "GET /ok is JSON",
    request: { path: "/ok" },
    status: 200,
    headers: { "content-type": "application/json" },
    json: { ok: true },
  },
  {
    name: "POST /guestbook urlencoded redirects",
    request: {
      method: "POST",
      path: "/guestbook",
      body: new URLSearchParams({ body: "hello" }),
    },
    status: 303,
    headers: { location: "/guestbook" },
  },
  {
    name: "GET /guestbook after POST lists the entry",
    request: { path: "/guestbook" },
    status: 200,
    html: {
      bodyIncludes: ["hello"],
      select: [
        { selector: "form", attr: { method: "POST", action: "/guestbook" } },
        { selector: "#entries", text: "hello" },
      ],
    },
  },
  {
    name: "POST /guestbook multipart redirects",
    request: {
      method: "POST",
      path: "/guestbook",
      body: guestbookMultipart,
    },
    status: 303,
    headers: { location: "/guestbook" },
  },
  {
    name: "gated path redirects without session cookie",
    request: { path: "/gated" },
    status: 303,
    headers: { location: "/" },
  },
  {
    name: "gated path renders with session cookie",
    request: {
      path: "/gated",
      headers: { cookie: "session=1" },
    },
    status: 200,
    html: {
      select: [{ selector: "#gated", text: "welcome" }],
    },
  },
];

const stillServes: IntegrationTestCase = {
  name: "known-good route is 200",
  request: { path: "/" },
  status: 200,
  headers: { "x-mw": "ok" },
};

const errorCases: Array<IntegrationTestCase & { stillServes?: boolean }> = [
  {
    name: "x-fragment miss is empty 404",
    request: {
      path: "/no-such-page",
      headers: { "x-fragment": "1" },
    },
    status: 404,
    bodyExact: "",
  },
  {
    name: "notFound throws walks to root error",
    request: { path: "/not-found-throws" },
    status: 500,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #root-error", text: "root-error" },
      ],
    },
    stillServes: true,
  },
  {
    name: "notFound ok and root layout throws uses errorFallback",
    request: { path: "/miss-layout-throws" },
    status: 500,
    html: {
      bodyExcludes: ["Website Title", "from-mw"],
      select: [{ selector: "#fallback", text: "crash-fallback" }],
    },
    stillServes: true,
  },
  {
    name: "eager fragment src miss leaves slot empty",
    request: { path: "/embed-frag-miss" },
    status: 200,
    html: {
      bodyExcludes: ["{{fragment:", "custom-404"],
      select: [
        { selector: "#embed-miss", exists: true },
        { selector: "#not-found", exists: false },
        { selector: "route-fragment #not-found", exists: false },
      ],
    },
  },
  {
    name: "handler throws with no group error uses parent error",
    request: { path: "/throw-no-error" },
    status: 500,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      bodyExcludes: ["no-error-wrap"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #root-error", text: "root-error" },
        { selector: "#no-error-wrap", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "handler throws with JSX error",
    request: { path: "/throw" },
    status: 500,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #pre", text: "from-mw" },
        { selector: "html > body > #root-error", text: "root-error" },
      ],
    },
    stillServes: true,
  },
  {
    name: "handler throws with JSON group error",
    request: { path: "/json-throw" },
    status: 500,
    headers: { "content-type": "application/json" },
    json: { error: "json-500" },
    stillServes: true,
  },
  {
    name: "nested handler throws uses nested error and all layouts",
    request: { path: "/nested-error" },
    status: 500,
    headers: {
      "content-type": "text/html",
      "x-mw": "ok",
      "x-nested-mw": "1",
    },
    html: {
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        {
          selector: "html > body > #nested-error-wrap > h2",
          text: "NestedError",
        },
        {
          selector: "html > body > #nested-error-wrap > #nested-error",
          text: "nested-error",
        },
        { selector: "#root-error", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "nested layout throws uses root error without nested chrome",
    request: { path: "/nested-layout-throws" },
    status: 500,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      bodyExcludes: ["NestedError"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #root-error", text: "root-error" },
        { selector: "#nested-error-wrap", exists: false },
        { selector: "#nested-error", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "nested layout throws with no nested error uses root error",
    request: { path: "/nested-layout-throws-no-error" },
    status: 500,
    html: {
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #root-error", text: "root-error" },
      ],
    },
    stillServes: true,
  },
  {
    name: "nested error throws walks to root error",
    request: { path: "/nested-error-throws" },
    status: 500,
    html: {
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #root-error", text: "root-error" },
        { selector: "#nested-error", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "root layout throws uses errorFallback JSX",
    request: { path: "/root-layout-throws" },
    status: 500,
    html: {
      bodyExcludes: ["Website Title", "from-mw"],
      select: [{ selector: "#fallback", text: "crash-fallback" }],
    },
    stillServes: true,
  },
  {
    name: "root error throws uses errorFallback",
    request: { path: "/root-error-throws" },
    status: 500,
    html: {
      bodyExcludes: ["Website Title", "root-error"],
      select: [{ selector: "#fallback", text: "crash-fallback" }],
    },
    stillServes: true,
  },
  {
    name: "middleware throws uses errorFallback immediately",
    request: { path: "/mw-throws" },
    status: 500,
    html: {
      bodyExcludes: ["Website Title", "ok-page"],
      select: [{ selector: "#fallback", text: "crash-fallback" }],
    },
    stillServes: true,
  },
  {
    name: "eager fragment throw without error leaves slot empty",
    request: { path: "/embed-frag-throw" },
    status: 200,
    html: {
      bodyExcludes: ["{{fragment:", "crash-fallback", "root-error"],
      select: [
        { selector: "#embed-throw", exists: true },
        { selector: "#frag-error", exists: false },
        { selector: "#root-error", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "eager fragment throw with error splices compact JSX",
    request: { path: "/embed-frag-error" },
    status: 200,
    html: {
      bodyExcludes: ["{{fragment:"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "route-fragment #frag-error", text: "frag-error-ui" },
        { selector: "route-fragment h1", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "eager fragment throw with Response error leaves slot empty",
    request: { path: "/embed-frag-error-response" },
    status: 200,
    html: {
      bodyExcludes: ["{{fragment:", "no-splice"],
      select: [
        { selector: "#embed-error-res", exists: true },
        { selector: "#frag-error", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "eager fragment throw when error throws leaves slot empty",
    request: { path: "/embed-frag-error-throws" },
    status: 200,
    html: {
      bodyExcludes: ["{{fragment:", "crash-fallback"],
      select: [
        { selector: "#embed-error-throws", exists: true },
        { selector: "#frag-error", exists: false },
        { selector: "#fallback", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "x-fragment throw with error returns markup",
    request: {
      path: "/frag-error",
      headers: { "x-fragment": "1" },
    },
    status: 500,
    headers: { "content-type": "text/html" },
    html: {
      bodyExcludes: ["<!DOCTYPE html>"],
      select: [
        { selector: "#frag-error", text: "frag-error-ui" },
        { selector: "h1", exists: false },
      ],
    },
    stillServes: true,
  },
  {
    name: "x-fragment throw with no error is empty 500",
    request: {
      path: "/frag-throw",
      headers: { "x-fragment": "1" },
    },
    status: 500,
    bodyExact: "",
    stillServes: true,
  },
  {
    name: "x-fragment last-resort is empty 500 not errorFallback",
    request: {
      path: "/frag-error-throws",
      headers: { "x-fragment": "1" },
    },
    status: 500,
    bodyExact: "",
    stillServes: true,
  },
];

Deno.test("main fixture app over HTTP", async (t) => {
  await using app = await boot(
    new URL("./main.ts", import.meta.url),
  );

  await runCases(t, app, appCases);
  await runCases(t, app, errorCases, stillServes);

  await t.step("custom 404 does not run nested group middleware", async () => {
    const res = await app.fetch({ path: "/no-such-page" });
    const body = await res.text();
    try {
      assertEquals(res.status, 404);
      assertEquals(res.headers.get("x-mw"), "ok");
      assertEquals(res.headers.get("x-nested-mw"), null);
    } catch (error) {
      const dump = formatIntegrationFailure(
        app,
        { path: "/no-such-page" },
        res,
        body,
      );
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

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
