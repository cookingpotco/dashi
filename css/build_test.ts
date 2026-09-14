import {
  assertEquals,
  assertExists,
  assertMatch,
  assertNotEquals,
} from "@std/assert";
import { buildCss, fingerprint } from "./build.ts";

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

async function runTailwindOnce(root: string, outPath: string): Promise<void> {
  const child = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "-A",
      "npm:@tailwindcss/cli@4",
      "-i",
      `${root}/styles.css`,
      "-o",
      outPath,
    ],
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  const status = await child.output();
  if (!status.success) {
    throw new Error(`Tailwind CLI exited with code ${status.code}`);
  }
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
    const generatedDir = `${root}/generated`;
    const files: string[] = [];
    for await (const entry of Deno.readDir(generatedDir)) {
      if (entry.isFile && entry.name.startsWith("styles-")) {
        files.push(entry.name);
      }
    }
    assertEquals(files.length, 1);
    assertEquals(files[0], href2.replace("/generated/", ""));
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("watch fingerprint keeps the previous stylesheet", async (t) => {
  const root = await Deno.makeTempDir({ prefix: "dashi-css-watch-" });
  try {
    await setupTailwindProject(root);
    await buildCss({ root });
    const hrefA = await readManifestHref(root);
    const nameA = hrefA.replace("/generated/", "");

    await Deno.writeTextFile(
      `${root}/sample.ts`,
      `export const markup = "<div class=\\"flex p-4 grid\\"></div>";
`,
    );
    const tempDir = await Deno.makeTempDir({ prefix: "dashi-styles-" });
    const tempCss = `${tempDir}/styles.css`;
    try {
      await runTailwindOnce(root, tempCss);
      await fingerprint(tempCss, {
        watch: true,
        generatedDir: `${root}/generated`,
        manifest: `${root}/styles.json`,
      });
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }

    const hrefB = await readManifestHref(root);
    assertNotEquals(hrefB, hrefA);
    const nameB = hrefB.replace("/generated/", "");

    await t.step("both fingerprints exist after watch rebuild", async () => {
      await Deno.stat(`${root}/generated/${nameA}`);
      await Deno.stat(`${root}/generated/${nameB}`);
    });
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});
