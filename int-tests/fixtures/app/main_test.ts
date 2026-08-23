import {
  assertEquals,
  assertFalse,
  assertMatch,
  assertStringIncludes,
} from "@std/assert";
import {
  type App,
  boot,
  formatIntegrationFailure,
  type IntegrationTestCase,
  runCases,
} from "../../mod.ts";

const guestbookMultipart = new FormData();
guestbookMultipart.set("body", "from-formdata");

function importMapFrom(html: string): Record<string, string> {
  const match = html.match(/<script type="importmap">([^<]*)<\/script>/);
  if (match === null) {
    throw new Error("missing importmap");
  }
  const parsed = JSON.parse(match[1]!) as { imports?: Record<string, string> };
  if (parsed.imports === undefined) {
    throw new Error("importmap missing imports");
  }
  return parsed.imports;
}

const appCases: IntegrationTestCase[] = [
  {
    name: "home page ships no module script",
    request: { path: "/" },
    status: 200,
    html: {
      bodyExcludes: ['<script type="module"'],
      select: [
        { selector: 'script[type="importmap"]', exists: true },
        { selector: 'script[type="module"]', exists: false },
      ],
    },
  },
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
        { selector: 'script[type="importmap"]', exists: true },
        { selector: 'script[type="module"]', exists: true },
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
      bodyExcludes: ["<!DOCTYPE html>", "<script"],
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
      bodyExcludes: ["NestedError", "api-404"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #pre", text: "from-mw" },
        { selector: "html > body > #not-found", text: "custom-404" },
        { selector: "#nested-error-wrap", exists: false },
        { selector: "#api-wrap", exists: false },
        { selector: "#api-not-found", exists: false },
      ],
    },
  },
  {
    name: "prefixed group miss uses that group's notFound",
    request: { path: "/api/nope" },
    status: 404,
    headers: { "content-type": "text/html", "x-mw": "ok", "x-api": "1" },
    html: {
      bodyIncludes: ["<!DOCTYPE html>"],
      bodyExcludes: ["custom-404", "api-v2-404"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #pre", text: "from-mw" },
        {
          selector: "html > body > #api-wrap > #api-not-found",
          text: "api-404",
        },
        { selector: "#not-found", exists: false },
        { selector: "#api-v2-not-found", exists: false },
      ],
    },
  },
  {
    name: "innermost prefixed group miss uses that group's notFound",
    request: { path: "/api/v2/nope" },
    status: 404,
    headers: { "content-type": "text/html", "x-mw": "ok", "x-api": "1" },
    html: {
      bodyExcludes: ["custom-404"],
      select: [
        {
          selector: "html > body > #api-wrap > #api-v2-not-found",
          text: "api-v2-404",
        },
        { selector: "#api-not-found", exists: false },
        { selector: "#not-found", exists: false },
      ],
    },
  },
  {
    name: "api prefix does not capture /apix",
    request: { path: "/apix" },
    status: 404,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      bodyExcludes: ["api-404"],
      select: [
        { selector: "html > body > #not-found", text: "custom-404" },
        { selector: "#api-wrap", exists: false },
      ],
    },
  },
  {
    name: "root miss uses root notFound",
    request: { path: "/nope" },
    status: 404,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      bodyExcludes: ["api-404"],
      select: [
        { selector: "html > body > #not-found", text: "custom-404" },
        { selector: "#api-wrap", exists: false },
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
    headers: { allow: "GET, HEAD, OPTIONS" },
    bodyIncludes: ["Method Not Allowed"],
    bodyExcludes: ["<!DOCTYPE html>"],
  },
  {
    name: "OPTIONS / is 204 with Allow",
    request: { method: "OPTIONS", path: "/" },
    status: 204,
    headers: { allow: "GET, HEAD, OPTIONS", "x-mw": "ok" },
    bodyExact: "",
  },
  {
    name: "OPTIONS miss is HTML 404",
    request: { method: "OPTIONS", path: "/no-such-page" },
    status: 404,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      bodyIncludes: ["<!DOCTYPE html>"],
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #not-found", text: "custom-404" },
      ],
    },
  },
  {
    name: "GET /ok is JSON",
    request: { path: "/ok" },
    status: 200,
    headers: { "content-type": "application/json" },
    json: { ok: true },
  },
  {
    name: "HEAD /ok is 200 with empty body",
    request: { method: "HEAD", path: "/ok" },
    status: 200,
    headers: { "content-type": "application/json", "x-mw": "ok" },
    bodyExact: "",
  },
  {
    name: "HEAD unmatched path is 404 with empty body",
    request: { method: "HEAD", path: "/no-such-page" },
    status: 404,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    bodyExact: "",
  },
  {
    name: "stylesheet is served from the static directory",
    request: { path: "/static/app.css" },
    status: 200,
    headers: {
      "content-type": "text/css; charset=utf-8",
      "content-length": "24",
      "cache-control": "public, max-age=31536000, immutable",
      "x-mw": "ok",
    },
    bodyExact: "body {\n  color: #111;\n}\n",
  },
  {
    name: "HEAD stylesheet is 200 with empty body",
    request: { method: "HEAD", path: "/static/app.css" },
    status: 200,
    headers: {
      "content-type": "text/css; charset=utf-8",
      "content-length": "24",
      "cache-control": "public, max-age=31536000, immutable",
      "x-mw": "ok",
    },
    bodyExact: "",
  },
  {
    name: "svg is served from the static directory",
    request: { path: "/static/logo.svg" },
    status: 200,
    headers: {
      "content-type": "image/svg+xml",
      "x-mw": "ok",
    },
    bodyIncludes: ['xmlns="http://www.w3.org/2000/svg"'],
  },
  {
    name: "javascript is served from the static directory",
    request: { path: "/static/app.js" },
    status: 200,
    headers: {
      "content-type": "text/javascript; charset=utf-8",
      "content-length": "11",
      "x-mw": "ok",
    },
    bodyExact: "export {};\n",
  },
  {
    name: "unknown extension is octet-stream",
    request: { path: "/static/blob.bin" },
    status: 200,
    headers: {
      "content-type": "application/octet-stream",
      "content-length": "2",
      "x-mw": "ok",
    },
    bodyExact: "x\n",
  },
  {
    name: "public cache strategy sets max-age and s-maxage",
    request: { path: "/static-public/app.css" },
    status: 200,
    headers: {
      "cache-control": "public, max-age=3600, s-maxage=86400",
      "x-mw": "ok",
    },
  },
  {
    name: "private cache strategy is private",
    request: { path: "/static-private/app.css" },
    status: 200,
    headers: {
      "cache-control": "private",
      "x-mw": "ok",
    },
  },
  {
    name: "empty static catch-all is plain 404",
    request: { path: "/static" },
    status: 404,
    bodyExact: "Not found",
  },
  {
    name: "static directory is plain 404",
    request: { path: "/static/nested" },
    status: 404,
    bodyExact: "Not found",
  },
  {
    name: "HEAD missing static file is 404 with empty body",
    request: { method: "HEAD", path: "/static/missing.css" },
    status: 404,
    headers: { "content-length": "9" },
    bodyExact: "",
  },
  {
    name: "encoded slash traversal does not serve a sibling file",
    request: { path: "/static/%2e%2e%2foutside.txt" },
    status: 404,
    bodyExcludes: ["outside-secret-do-not-serve"],
  },
  {
    name: "missing static file is plain 404",
    request: { path: "/static/missing.css" },
    status: 404,
    headers: { "content-length": "9" },
    bodyExact: "Not found",
  },
  {
    name: "favicon.ico is HTML 404",
    request: { path: "/favicon.ico" },
    status: 404,
    headers: { "content-type": "text/html", "x-mw": "ok" },
    html: {
      select: [
        { selector: "html > body > h1", text: "Website Title" },
        { selector: "html > body > #not-found", text: "custom-404" },
      ],
    },
  },
  {
    name: "POST to static file route is 405",
    request: { method: "POST", path: "/static/app.css" },
    status: 405,
    headers: { allow: "GET, HEAD, OPTIONS" },
    bodyIncludes: ["Method Not Allowed"],
    bodyExcludes: ["<!DOCTYPE html>"],
  },
  {
    name: "dot-dot traversal does not serve a sibling file",
    request: { path: "/static/../outside.txt" },
    status: 404,
    bodyExcludes: ["outside-secret-do-not-serve"],
  },
  {
    name: "encoded dot-dot traversal does not serve a sibling file",
    request: { path: "/static/%2e%2e/outside.txt" },
    status: 404,
    bodyExcludes: ["outside-secret-do-not-serve"],
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

async function assertHeadMatchesGet(app: App, path: string): Promise<void> {
  const get = await app.fetch({ path });
  const getBody = await get.text();
  const head = await app.fetch({ method: "HEAD", path });
  const headBody = await head.text();
  const length = String(new TextEncoder().encode(getBody).byteLength);
  try {
    assertEquals(get.headers.get("content-length"), length);
    assertEquals(head.status, get.status);
    assertEquals(headBody, "");
    assertEquals(head.headers.get("content-length"), length);
    assertEquals(
      head.headers.get("content-type"),
      get.headers.get("content-type"),
    );
  } catch (error) {
    throw new Error(
      formatIntegrationFailure(app, { method: "HEAD", path }, head, headBody),
      { cause: error },
    );
  }
}

Deno.test("main fixture app over HTTP", async (t) => {
  await using app = await boot(
    new URL("./main.ts", import.meta.url),
  );

  await runCases(t, app, appCases);
  await runCases(t, app, errorCases, stillServes);

  await t.step("embed page module is the route-fragment runtime", async () => {
    const res = await app.fetch({ path: "/embed" });
    const html = await res.text();
    const scripts = [
      ...html.matchAll(/<script type="module" src="([^"]+)"><\/script>/g),
    ];
    try {
      assertEquals(scripts.length, 1);
      const src = scripts[0]![1]!;
      assertEquals(src.startsWith("/_dashi/client/"), true);
      const hashed = importMapFrom(html)[src];
      if (hashed === undefined) {
        throw new Error(`importmap missing ${src}`);
      }
      assertMatch(hashed, /-[A-Za-z0-9_-]+\.js$/);
      const js = await app.fetch({ path: hashed });
      const body = await js.text();
      assertEquals(js.status, 200);
      assertEquals(js.headers.get("content-type"), "text/javascript");
      assertStringIncludes(body, "customElements.define");
      assertStringIncludes(body, "route-fragment");
    } catch (error) {
      const dump = formatIntegrationFailure(
        app,
        { path: "/embed" },
        res,
        html,
      );
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

  await t.step("fragment without a client host has no Link", async () => {
    const res = await app.fetch({
      path: "/fragment",
      headers: { "x-fragment": "1" },
    });
    const body = await res.text();
    try {
      assertEquals(res.headers.get("link"), null);
    } catch (error) {
      const dump = formatIntegrationFailure(
        app,
        { path: "/fragment", headers: { "x-fragment": "1" } },
        res,
        body,
      );
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

  await t.step("client.element document script and fragment Link", async () => {
    const page = await app.fetch({ path: "/probe" });
    const pageHtml = await page.text();
    const scripts = [
      ...pageHtml.matchAll(/<script type="module" src="([^"]+)"><\/script>/g),
    ];
    const frag = await app.fetch({
      path: "/probe",
      headers: { "x-fragment": "1" },
    });
    const fragHtml = await frag.text();
    try {
      assertEquals(scripts.length, 1);
      const src = scripts[0]![1]!;
      assertEquals(src.startsWith("/_dashi/client/"), true);
      const hashed = importMapFrom(pageHtml)[src];
      if (hashed === undefined) {
        throw new Error(`importmap missing ${src}`);
      }
      assertEquals(fragHtml.includes("<script"), false);
      const link = frag.headers.get("link");
      if (link === null) {
        throw new Error("missing Link");
      }
      assertStringIncludes(link, `rel="modulepreload"`);
      assertStringIncludes(link, hashed);
    } catch (error) {
      const dump = [
        formatIntegrationFailure(app, { path: "/probe" }, page, pageHtml),
        formatIntegrationFailure(
          app,
          { path: "/probe", headers: { "x-fragment": "1" } },
          frag,
          fragHtml,
        ),
      ].join("\n\n");
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

  await t.step(
    "HEAD matches GET Content-Length with an empty body",
    async (t) => {
      for (
        const path of [
          "/",
          "/ok",
          "/no-such-page",
          "/static/app.css",
          "/static/missing.css",
        ]
      ) {
        await t.step(path, () => assertHeadMatchesGet(app, path));
      }
    },
  );

  await t.step("cors() star origin is * without Vary", async () => {
    const res = await app.fetch({
      path: "/cors-star",
      headers: { origin: "https://app.example" },
    });
    const body = await res.text();
    try {
      assertEquals(res.status, 200);
      assertEquals(JSON.parse(body), { ok: true });
      assertEquals(res.headers.get("access-control-allow-origin"), "*");
      assertEquals(res.headers.get("vary"), null);
    } catch (error) {
      const dump = formatIntegrationFailure(
        app,
        { path: "/cors-star", headers: { origin: "https://app.example" } },
        res,
        body,
      );
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

  await t.step("cors list origin match and mismatch", async () => {
    const allowed = await app.fetch({
      path: "/cors-list",
      headers: { origin: "https://app.example" },
    });
    const allowedBody = await allowed.text();
    const denied = await app.fetch({
      path: "/cors-list",
      headers: { origin: "https://evil.example" },
    });
    const deniedBody = await denied.text();
    try {
      assertEquals(allowed.status, 200);
      assertEquals(JSON.parse(allowedBody), { ok: true });
      assertEquals(
        allowed.headers.get("access-control-allow-origin"),
        "https://app.example",
      );
      assertEquals(allowed.headers.get("vary"), "Origin");
      assertEquals(denied.status, 200);
      assertEquals(JSON.parse(deniedBody), { ok: true });
      assertEquals(denied.headers.get("access-control-allow-origin"), null);
    } catch (error) {
      const dump = [
        formatIntegrationFailure(
          app,
          { path: "/cors-list", headers: { origin: "https://app.example" } },
          allowed,
          allowedBody,
        ),
        formatIntegrationFailure(
          app,
          { path: "/cors-list", headers: { origin: "https://evil.example" } },
          denied,
          deniedBody,
        ),
      ].join("\n\n");
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

  await t.step("cors function origin allow and deny", async () => {
    const allowed = await app.fetch({
      path: "/cors-fn",
      headers: { origin: "https://app.example" },
    });
    const allowedBody = await allowed.text();
    const denied = await app.fetch({
      path: "/cors-fn",
      headers: { origin: "https://evil.example" },
    });
    const deniedBody = await denied.text();
    try {
      assertEquals(allowed.status, 200);
      assertEquals(JSON.parse(allowedBody), { ok: true });
      assertEquals(
        allowed.headers.get("access-control-allow-origin"),
        "https://app.example",
      );
      assertEquals(denied.status, 200);
      assertEquals(JSON.parse(deniedBody), { ok: true });
      assertEquals(denied.headers.get("access-control-allow-origin"), null);
    } catch (error) {
      const dump = [
        formatIntegrationFailure(
          app,
          { path: "/cors-fn", headers: { origin: "https://app.example" } },
          allowed,
          allowedBody,
        ),
        formatIntegrationFailure(
          app,
          { path: "/cors-fn", headers: { origin: "https://evil.example" } },
          denied,
          deniedBody,
        ),
      ].join("\n\n");
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

  await t.step("conditional GET and HEAD of a stylesheet are 304", async () => {
    const first = await app.fetch({ path: "/static/app.css" });
    const firstBody = await first.text();
    const etag = first.headers.get("etag");
    try {
      assertEquals(first.status, 200);
      if (etag === null) {
        throw new Error("missing etag");
      }
      const get304 = await app.fetch({
        path: "/static/app.css",
        headers: { "if-none-match": etag },
      });
      const getBody = await get304.text();
      assertEquals(get304.status, 304);
      assertEquals(getBody, "");
      assertEquals(get304.headers.get("etag"), etag);
      assertEquals(
        get304.headers.get("cache-control"),
        "public, max-age=31536000, immutable",
      );

      const head304 = await app.fetch({
        method: "HEAD",
        path: "/static/app.css",
        headers: { "if-none-match": etag },
      });
      const headBody = await head304.text();
      assertEquals(head304.status, 304);
      assertEquals(headBody, "");
      assertEquals(head304.headers.get("etag"), etag);
      assertEquals(
        head304.headers.get("cache-control"),
        "public, max-age=31536000, immutable",
      );

      const star = await app.fetch({
        path: "/static/app.css",
        headers: { "if-none-match": "*" },
      });
      assertEquals(star.status, 304);
      assertEquals(await star.text(), "");

      const listed = await app.fetch({
        path: "/static/app.css",
        headers: { "if-none-match": `W/"9-9", ${etag}` },
      });
      assertEquals(listed.status, 304);
      assertEquals(await listed.text(), "");

      const miss = await app.fetch({
        path: "/static/app.css",
        headers: { "if-none-match": `W/"9-9"` },
      });
      assertEquals(miss.status, 200);
      await miss.text();
    } catch (error) {
      const dump = formatIntegrationFailure(
        app,
        { path: "/static/app.css" },
        first,
        firstBody,
      );
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

  await t.step("uppercase extension still maps content-type", async () => {
    const file = new URL("./static/app.CSS", import.meta.url);
    await Deno.writeTextFile(file, "body{color:#000}\n");
    try {
      const res = await app.fetch({ path: "/static/app.CSS" });
      const body = await res.text();
      try {
        assertEquals(res.status, 200);
        assertEquals(
          res.headers.get("content-type"),
          "text/css; charset=utf-8",
        );
        assertEquals(body, "body{color:#000}\n");
      } catch (error) {
        const dump = formatIntegrationFailure(
          app,
          { path: "/static/app.CSS" },
          res,
          body,
        );
        if (error instanceof Error) {
          error.message = `${error.message}\n\n${dump}`;
        }
        throw error;
      }
    } finally {
      await Deno.remove(file);
    }
  });

  await t.step("missing static directory is 404 and logs", async () => {
    const res = await app.fetch({ path: "/static-missing-dir/app.css" });
    const body = await res.text();
    try {
      assertEquals(res.status, 404);
      assertEquals(body, "Not found");
      assertStringIncludes(app.stderr, "staticFile: directory not found:");
      assertStringIncludes(app.stderr, "no-such-static");
    } catch (error) {
      const dump = formatIntegrationFailure(
        app,
        { path: "/static-missing-dir/app.css" },
        res,
        body,
      );
      if (error instanceof Error) {
        error.message = `${error.message}\n\n${dump}`;
      }
      throw error;
    }
  });

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
