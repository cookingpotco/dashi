import { assertEquals, assertExists } from "@std/assert";

import "./samples/getting-started/main.ts";
import "./samples/routing/main.ts";
import "./samples/fragments/main.ts";
import "./samples/forms/main.ts";
import "./samples/client/main.ts";
import "./samples/navigation/main.ts";

const ROOT = import.meta.dirname;
const PAGES = [
  "getting-started",
  "thesis",
  "routing",
  "fragments",
  "forms",
  "client",
  "navigation",
  "deploy",
] as const;

interface Fence {
  lang: string;
  path: string | undefined;
  body: string;
}

function fencesIn(markdown: string): Fence[] {
  const fences: Fence[] = [];
  const re = /```([^\n]*)\n([\s\S]*?)```/g;
  for (const match of markdown.matchAll(re)) {
    const info = match[1]!.trim();
    const [lang, ...rest] = info.split(/\s+/);
    fences.push({
      lang: lang ?? "",
      path: rest.length > 0 ? rest.join(" ") : undefined,
      body: match[2]!.replace(/\n$/, ""),
    });
  }
  return fences;
}

Deno.test("handbook pages list every shipping feature", async () => {
  for (const page of PAGES) {
    const stat = await Deno.stat(`${ROOT}/${page}.md`);
    assertEquals(stat.isFile, true);
  }
});

Deno.test("handbook fences match sample files", async () => {
  for (const page of PAGES) {
    const markdown = await Deno.readTextFile(`${ROOT}/${page}.md`);
    for (const fence of fencesIn(markdown)) {
      if (fence.path === undefined) {
        if (fence.lang === "json") {
          JSON.parse(fence.body);
        }
        continue;
      }
      const file = `${ROOT}/samples/${page}/${fence.path}`;
      const expected = (await Deno.readTextFile(file)).replace(/\n$/, "");
      assertEquals(
        fence.body,
        expected,
        `${page}.md fence ${fence.path} does not match ${file}`,
      );
    }
  }
});

Deno.test("getting-started deno.json names every consumer key", async () => {
  const markdown = await Deno.readTextFile(`${ROOT}/getting-started.md`);
  const fence = fencesIn(markdown).find((item) =>
    item.path === "consumer.deno.json"
  );
  assertExists(fence);
  const config = JSON.parse(fence.body) as {
    compilerOptions?: {
      jsx?: string;
      jsxImportSource?: string;
      lib?: string[];
    };
    unstable?: string[];
    imports?: Record<string, string>;
  };
  assertEquals(config.compilerOptions?.jsx, "precompile");
  assertEquals(config.compilerOptions?.jsxImportSource, "dashi");
  assertEquals(config.compilerOptions?.lib, [
    "dom",
    "deno.ns",
    "deno.unstable",
  ]);
  assertEquals(config.unstable, ["bundle"]);
  assertEquals(
    config.imports?.dashi?.startsWith("jsr:@cookingpot/dashi@"),
    true,
  );
});
