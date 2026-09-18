import { assertEquals, assertMatch, assertThrows } from "@std/assert";
import { stylesheetHref } from "./mod.ts";

Deno.test("stylesheetHref reads href from manifest", async () => {
  const dir = await Deno.makeTempDir({ prefix: "dashi-css-href-" });
  const generatedDir = `${dir}/generated`;
  await Deno.mkdir(generatedDir);
  await Deno.writeTextFile(
    `${generatedDir}/styles.json`,
    `${JSON.stringify({ href: "/generated/styles-abc.css" }, null, 2)}\n`,
  );
  assertEquals(stylesheetHref(dir), "/generated/styles-abc.css");
  await Deno.remove(dir, { recursive: true });
});

Deno.test("stylesheetHref throws when manifest is missing", async () => {
  const dir = await Deno.makeTempDir({ prefix: "dashi-css-href-" });
  try {
    stylesheetHref(dir);
    throw new Error("expected throw");
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    assertMatch(error.message, /styles\.json/);
    assertMatch(error.message, /deno task css/);
  }
  await Deno.remove(dir, { recursive: true });
});

Deno.test("stylesheetHref throws on invalid manifest", async () => {
  const dir = await Deno.makeTempDir({ prefix: "dashi-css-href-" });
  const generatedDir = `${dir}/generated`;
  await Deno.mkdir(generatedDir);
  await Deno.writeTextFile(`${generatedDir}/styles.json`, "not json\n");
  assertThrows(() => stylesheetHref(dir));
  await Deno.writeTextFile(`${generatedDir}/styles.json`, "{}\n");
  assertThrows(() => stylesheetHref(dir), Error, "styles.json");
  await Deno.remove(dir, { recursive: true });
});
