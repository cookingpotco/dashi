import { assertEquals } from "@std/assert";
import {
  contentType,
  decodeRelative,
  etag,
  ifNoneMatch,
  isFingerprinted,
  isInsideRoot,
} from "./mod.ts";

Deno.test("contentType maps extensions and defaults to octet-stream", () => {
  assertEquals(contentType("app.css"), "text/css; charset=utf-8");
  assertEquals(contentType("app.js"), "text/javascript; charset=utf-8");
  assertEquals(contentType("app.mjs"), "text/javascript; charset=utf-8");
  assertEquals(contentType("data.json"), "application/json");
  assertEquals(contentType("logo.svg"), "image/svg+xml");
  assertEquals(contentType("pic.png"), "image/png");
  assertEquals(contentType("pic.jpg"), "image/jpeg");
  assertEquals(contentType("pic.jpeg"), "image/jpeg");
  assertEquals(contentType("pic.gif"), "image/gif");
  assertEquals(contentType("favicon.ico"), "image/x-icon");
  assertEquals(contentType("pic.webp"), "image/webp");
  assertEquals(contentType("font.woff"), "font/woff");
  assertEquals(contentType("font.woff2"), "font/woff2");
  assertEquals(contentType("font.ttf"), "font/ttf");
  assertEquals(contentType("font.otf"), "font/otf");
  assertEquals(contentType("app.js.map"), "application/json");
  assertEquals(contentType("notes.txt"), "text/plain");
  assertEquals(contentType("index.html"), "text/html");
  assertEquals(contentType("index.htm"), "text/html");
  assertEquals(contentType("app.wasm"), "application/wasm");
  assertEquals(contentType("data.xml"), "application/xml");
  assertEquals(contentType("app.webmanifest"), "application/manifest+json");
  assertEquals(contentType("file.bin"), "application/octet-stream");
  assertEquals(contentType("noext"), "application/octet-stream");
  assertEquals(contentType("dir/app.CSS"), "text/css; charset=utf-8");
});

Deno.test("isFingerprinted looks for an 8+ hex run in the basename", () => {
  assertEquals(isFingerprinted("app.deadbeef.css"), true);
  assertEquals(isFingerprinted("client-deadbeef.js"), true);
  assertEquals(isFingerprinted("nested/app.deadbeef.css"), true);
  assertEquals(isFingerprinted("app.css"), false);
  assertEquals(isFingerprinted("logo.svg"), false);
  assertEquals(isFingerprinted("deadbeef/app.css"), false);
});

Deno.test("etag is a weak tag of size and mtime", () => {
  assertEquals(etag(16, 1700000000000), `W/"16-1700000000000"`);
});

Deno.test("ifNoneMatch honors * and a comma-separated list", () => {
  const tag = `W/"16-1"`;
  assertEquals(ifNoneMatch(null, tag), false);
  assertEquals(ifNoneMatch("*", tag), true);
  assertEquals(ifNoneMatch(" * ", tag), true);
  assertEquals(ifNoneMatch(tag, tag), true);
  assertEquals(ifNoneMatch(`W/"9-9", ${tag}`, tag), true);
  assertEquals(ifNoneMatch(`W/"9-9", W/"8-8"`, tag), false);
  assertEquals(ifNoneMatch(`W/"16-2"`, tag), false);
});

Deno.test("decodeRelative rejects empty, NUL, and malformed sequences", () => {
  assertEquals(decodeRelative("app.css"), "app.css");
  assertEquals(decodeRelative("nested/app.css"), "nested/app.css");
  assertEquals(decodeRelative("../outside.txt"), "../outside.txt");
  assertEquals(decodeRelative("%2e%2e/outside.txt"), "../outside.txt");
  assertEquals(decodeRelative("%2e%2e%2foutside.txt"), "../outside.txt");
  assertEquals(decodeRelative(""), null);
  assertEquals(decodeRelative("foo\0bar"), null);
  assertEquals(decodeRelative("%00"), null);
  assertEquals(decodeRelative("%"), null);
});

Deno.test("isInsideRoot requires the resolved path to stay under root", () => {
  assertEquals(isInsideRoot("/app/static", "/app/static/app.css"), true);
  assertEquals(isInsideRoot("/app/static", "/app/static"), true);
  assertEquals(isInsideRoot("/app/static", "/app/outside.txt"), false);
  assertEquals(isInsideRoot("/app/static", "/app/staticextra"), false);
  assertEquals(isInsideRoot("/app/static", "/etc/passwd"), false);
});
