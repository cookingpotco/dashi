import { assertEquals } from "@std/assert";
import { type Ctx } from "../shared/shared_types.ts";
import { staticFile } from "./mod.ts";

function ctx(
  method: string,
  headers?: HeadersInit,
): Ctx<Record<string, string>, Record<string, unknown>> {
  const url = new URL("http://example.test/static/file");
  return {
    req: new Request(url, { method, headers }),
    url,
    params: {},
    isFragment: false,
    state: {},
  };
}

async function withStaticDir(
  run: (dir: string, root: string) => Promise<void>,
): Promise<void> {
  const root = await Deno.makeTempDir();
  const dir = `${root}/static`;
  await Deno.mkdir(dir);
  try {
    await run(dir, root);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
}

Deno.test("content type follows the file extension", async () => {
  await withStaticDir(async (dir) => {
    await Deno.writeTextFile(`${dir}/app.css`, "a{}");
    await Deno.writeTextFile(`${dir}/app.js`, "a()");
    await Deno.writeTextFile(`${dir}/app.CSS`, "A{}");
    await Deno.writeTextFile(`${dir}/blob.bin`, "x");

    const css = await staticFile(ctx("GET"), dir, "app.css");
    assertEquals(css.status, 200);
    assertEquals(css.headers.get("content-type"), "text/css; charset=utf-8");
    assertEquals(await css.text(), "a{}");

    const js = await staticFile(ctx("GET"), dir, "app.js");
    assertEquals(
      js.headers.get("content-type"),
      "text/javascript; charset=utf-8",
    );
    await js.text();

    const upper = await staticFile(ctx("GET"), dir, "app.CSS");
    assertEquals(upper.headers.get("content-type"), "text/css; charset=utf-8");
    await upper.text();

    const bin = await staticFile(ctx("GET"), dir, "blob.bin");
    assertEquals(bin.headers.get("content-type"), "application/octet-stream");
    await bin.text();
  });
});

Deno.test("HEAD is the GET headers with an empty body", async () => {
  await withStaticDir(async (dir) => {
    await Deno.writeTextFile(`${dir}/app.css`, "a{}");
    const get = await staticFile(ctx("GET"), dir, "app.css");
    const body = await get.text();
    const head = await staticFile(ctx("HEAD"), dir, "app.css");
    assertEquals(head.status, 200);
    assertEquals(await head.text(), "");
    assertEquals(
      head.headers.get("content-type"),
      get.headers.get("content-type"),
    );
    assertEquals(
      head.headers.get("content-length"),
      get.headers.get("content-length"),
    );
    assertEquals(head.headers.get("cache-control"), "no-cache");
    assertEquals(head.headers.get("content-length"), String(body.length));
  });
});

Deno.test("fingerprinted basename is immutable", async () => {
  await withStaticDir(async (dir) => {
    await Deno.writeTextFile(`${dir}/app.deadbeef.css`, "a{}");
    await Deno.writeTextFile(`${dir}/app.css`, "a{}");
    const hashed = await staticFile(ctx("GET"), dir, "app.deadbeef.css");
    assertEquals(
      hashed.headers.get("cache-control"),
      "public, max-age=31536000, immutable",
    );
    await hashed.text();
    const plain = await staticFile(ctx("GET"), dir, "app.css");
    assertEquals(plain.headers.get("cache-control"), "no-cache");
    await plain.text();
  });
});

Deno.test("If-None-Match returns 304", async () => {
  await withStaticDir(async (dir) => {
    await Deno.writeTextFile(`${dir}/app.css`, "a{}");
    const first = await staticFile(ctx("GET"), dir, "app.css");
    const tag = first.headers.get("etag");
    await first.text();
    if (tag === null) {
      throw new Error("missing etag");
    }

    const get304 = await staticFile(
      ctx("GET", { "if-none-match": tag }),
      dir,
      "app.css",
    );
    assertEquals(get304.status, 304);
    assertEquals(await get304.text(), "");
    assertEquals(get304.headers.get("etag"), tag);
    assertEquals(get304.headers.get("cache-control"), "no-cache");

    const head304 = await staticFile(
      ctx("HEAD", { "if-none-match": tag }),
      dir,
      "app.css",
    );
    assertEquals(head304.status, 304);
    assertEquals(await head304.text(), "");

    const star = await staticFile(
      ctx("GET", { "if-none-match": "*" }),
      dir,
      "app.css",
    );
    assertEquals(star.status, 304);
    await star.text();

    const listed = await staticFile(
      ctx("GET", { "if-none-match": `W/"9-9", ${tag}` }),
      dir,
      "app.css",
    );
    assertEquals(listed.status, 304);
    await listed.text();

    const miss = await staticFile(
      ctx("GET", { "if-none-match": `W/"9-9"` }),
      dir,
      "app.css",
    );
    assertEquals(miss.status, 200);
    await miss.text();
  });
});

Deno.test("missing, empty, and directory paths are 404", async () => {
  await withStaticDir(async (dir) => {
    await Deno.mkdir(`${dir}/nested`);
    const missing = await staticFile(ctx("GET"), dir, "missing.css");
    assertEquals(missing.status, 404);
    assertEquals(await missing.text(), "Not found");

    const empty = await staticFile(ctx("GET"), dir, "");
    assertEquals(empty.status, 404);
    assertEquals(await empty.text(), "Not found");

    const nested = await staticFile(ctx("GET"), dir, "nested");
    assertEquals(nested.status, 404);
    assertEquals(await nested.text(), "Not found");

    const head = await staticFile(ctx("HEAD"), dir, "missing.css");
    assertEquals(head.status, 404);
    assertEquals(await head.text(), "");
    assertEquals(head.headers.get("content-length"), "9");
  });
});

Deno.test("relative paths that escape the directory are 404", async () => {
  await withStaticDir(async (dir, root) => {
    await Deno.writeTextFile(`${dir}/app.css`, "a{}");
    await Deno.writeTextFile(
      `${root}/outside.txt`,
      "outside-secret-do-not-serve",
    );

    const dotdot = await staticFile(ctx("GET"), dir, "../outside.txt");
    assertEquals(dotdot.status, 404);
    assertEquals(await dotdot.text(), "Not found");

    const encoded = await staticFile(ctx("GET"), dir, "%2e%2e/outside.txt");
    assertEquals(encoded.status, 404);
    assertEquals(
      (await encoded.text()).includes("outside-secret-do-not-serve"),
      false,
    );

    const nul = await staticFile(ctx("GET"), dir, "foo\0bar");
    assertEquals(nul.status, 404);
    await nul.text();

    const malformed = await staticFile(ctx("GET"), dir, "%");
    assertEquals(malformed.status, 404);
    await malformed.text();
  });
});
