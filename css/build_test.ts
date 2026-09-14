import { assertEquals, assertMatch, assertNotEquals } from "@std/assert";
import { buildCss } from "./mod.ts";

async function setupTailwindProject(root: string): Promise<void> {
  await Deno.writeTextFile(
    `${root}/styles.css`,
    `@import "tailwindcss";
@source "./**/*.{ts,tsx}";
`,
  );
  await Deno.writeTextFile(
    `${root}/sample.ts`,
    `export const markup = "<div class=\\"flex p-4\\"></div>";
`,
  );
  await Deno.writeTextFile(
    `${root}/deno.json`,
    `${
      JSON.stringify(
        {
          nodeModulesDir: "auto",
          imports: { tailwindcss: "npm:tailwindcss@4" },
        },
        null,
        2,
      )
    }\n`,
  );
  const install = new Deno.Command(Deno.execPath(), {
    args: ["install", "--allow-scripts=npm:@parcel/watcher"],
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  const installStatus = await install.output();
  if (!installStatus.success) {
    throw new Error(`deno install failed with code ${installStatus.code}`);
  }
}

async function readManifestHref(root: string): Promise<string> {
  const manifest = JSON.parse(
    await Deno.readTextFile(`${root}/styles.json`),
  );
  if (typeof manifest !== "object" || manifest === null) {
    throw new Error("invalid manifest");
  }
  const href = Reflect.get(manifest, "href");
  if (typeof href !== "string") {
    throw new Error("invalid manifest href");
  }
  return href;
}

async function listStyleFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(`${root}/generated`)) {
    if (entry.isFile && entry.name.startsWith("styles-")) {
      files.push(entry.name);
    }
  }
  return files.sort();
}

Deno.test("buildCss one-shot fingerprints and purges old files", async () => {
  const root = await Deno.makeTempDir({ prefix: "dashi-css-build-" });
  try {
    await setupTailwindProject(root);
    await buildCss({ root });

    const href = await readManifestHref(root);
    assertMatch(href, /^\/generated\/styles-[A-Za-z0-9_-]+\.css$/);
    const cssPath = `${root}${href}`;
    const css = await Deno.readTextFile(cssPath);
    assertMatch(css, /\.flex\b/);
    assertMatch(css, /\.p-4\b/);

    await Deno.writeTextFile(
      `${root}/sample.ts`,
      `export const markup = "<div class=\\"flex p-4 gap-2\\"></div>";
`,
    );
    await buildCss({ root });

    const href2 = await readManifestHref(root);
    assertNotEquals(href2, href);
    const files = await listStyleFiles(root);
    assertEquals(files.length, 1);
    assertEquals(files[0], href2.replace("/generated/", ""));
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("buildCss watch keeps previous fingerprint while rebuilding", async (t) => {
  const root = await Deno.makeTempDir({ prefix: "dashi-css-watch-" });
  try {
    await setupTailwindProject(root);
    const ac = new AbortController();
    let buildError: Error | undefined;
    const build = buildCss({ root, watch: true, signal: ac.signal }).catch(
      (error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        buildError = error instanceof Error ? error : new Error(String(error));
      },
    );

    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      try {
        await Deno.stat(`${root}/styles.json`);
        break;
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
      if (buildError !== undefined) {
        throw buildError;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const hrefA = await readManifestHref(root);
    const nameA = hrefA.replace("/generated/", "");

    await Deno.writeTextFile(
      `${root}/sample.ts`,
      `export const markup = "<div class=\\"flex p-4 grid\\"></div>";
`,
    );

    const changeDeadline = Date.now() + 15_000;
    let hrefB = hrefA;
    while (Date.now() < changeDeadline) {
      if (buildError !== undefined) {
        throw buildError;
      }
      hrefB = await readManifestHref(root);
      if (hrefB !== hrefA) {
        const nameBNow = hrefB.replace("/generated/", "");
        await Deno.stat(`${root}/generated/${nameA}`);
        await Deno.stat(`${root}/generated/${nameBNow}`);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assertNotEquals(hrefB, hrefA);
    const nameB = hrefB.replace("/generated/", "");

    await t.step("both fingerprints exist after watch rebuild", async () => {
      await Deno.stat(`${root}/generated/${nameA}`);
      await Deno.stat(`${root}/generated/${nameB}`);
    });

    await Deno.writeTextFile(
      `${root}/sample.ts`,
      `export const markup = "<div class=\\"flex p-4 grid gap-2\\"></div>";
`,
    );

    const thirdDeadline = Date.now() + 15_000;
    let hrefC = hrefB;
    while (Date.now() < thirdDeadline) {
      if (buildError !== undefined) {
        throw buildError;
      }
      hrefC = await readManifestHref(root);
      if (hrefC !== hrefB) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    assertNotEquals(hrefC, hrefB);
    const nameC = hrefC.replace("/generated/", "");

    await t.step("watch purge drops older than previous", async () => {
      const files = await listStyleFiles(root);
      assertEquals(files.sort(), [nameB, nameC].sort());
      await Deno.stat(`${root}/generated/${nameB}`);
      await Deno.stat(`${root}/generated/${nameC}`);
      let missingA = false;
      try {
        await Deno.stat(`${root}/generated/${nameA}`);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          missingA = true;
        } else {
          throw error;
        }
      }
      assertEquals(missingA, true);
    });

    ac.abort();
    await build;
    if (buildError !== undefined) {
      throw buildError;
    }
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});
