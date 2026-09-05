import {
  assertEquals,
  assertFalse,
  assertMatch,
  assertStringIncludes,
} from "@std/assert";
import { boot, formatIntegrationFailure } from "../../mod.ts";
import { start } from "./main.tsx";

const PUBLIC_CLIENT = /^\/_dashi\/client\/[^/]+\-[A-Za-z0-9_-]+\.js$/;

Deno.test("mixed file and JSR client entries compile over HTTP", async () => {
  await using app = await boot(start);
  const res = await app.fetch({ path: "/" });
  const html = await res.text();
  try {
    assertEquals(res.status, 200);
    const scripts = [
      ...html.matchAll(/<script type="module" src="([^"]+)"><\/script>/g),
    ].map((match) => match[1]!);
    assertEquals(scripts.length, 2);
    const localSrc = scripts.find((src) => src.includes("local_client-"));
    const jsrSrc = scripts.find((src) =>
      src.includes("route_fragment_client-")
    );
    if (localSrc === undefined || jsrSrc === undefined) {
      throw new Error(`missing hashed module src in ${scripts.join(", ")}`);
    }
    assertMatch(localSrc, PUBLIC_CLIENT);
    assertMatch(jsrSrc, PUBLIC_CLIENT);

    const localJs = await app.fetch({ path: localSrc });
    const localBody = await localJs.text();
    assertEquals(localJs.status, 200);
    assertEquals(
      localJs.headers.get("content-type"),
      "text/javascript; charset=utf-8",
    );
    assertStringIncludes(localBody, "local-el");
    assertFalse(localBody.includes("route-fragment"));

    const jsrJs = await app.fetch({ path: jsrSrc });
    const jsrBody = await jsrJs.text();
    assertEquals(jsrJs.status, 200);
    assertEquals(
      jsrJs.headers.get("content-type"),
      "text/javascript; charset=utf-8",
    );
    assertStringIncludes(jsrBody, "route-fragment");
    assertFalse(jsrBody.includes("local-el"));
  } catch (error) {
    const dump = formatIntegrationFailure(app, { path: "/" }, res, html);
    if (error instanceof Error) {
      error.message = `${error.message}\n\n${dump}`;
    }
    throw error;
  }
});
