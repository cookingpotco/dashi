#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
/**
 * Type-checks the published graph without workspace path mappings or
 * `jsxImportSource`.
 *
 * Published sources must address their own modules by relative path. Path
 * mappings in `imports` and `compilerOptions.jsxImportSource` only resolve
 * inside this checkout (or against a *different* published version), so
 * `deno publish --dry-run` on an unmodified tree cannot see them fail.
 *
 * Strips those, runs `deno publish --dry-run --allow-dirty`, and restores
 * the original `deno.json` text. The Publish dry-run leg still runs without
 * `--allow-dirty` so a dirty tree stays a failure.
 *
 *   deno run -A scripts/check_published_graph.ts
 */

import denoJson from "../deno.json" with { type: "json" };

async function main(): Promise<void> {
  const root = Deno.realPathSync(`${import.meta.dirname}/..`);
  const manifestPath = `${root}/deno.json`;
  const original = Deno.readTextFileSync(manifestPath);
  const imports: Record<string, string> = {};
  for (const [key, value] of Object.entries(denoJson.imports)) {
    if (
      value.startsWith("./") || value.startsWith("../") ||
      value.startsWith("/")
    ) {
      continue;
    }
    imports[key] = value;
  }
  const { jsxImportSource: _jsxImportSource, ...compilerOptions } =
    denoJson.compilerOptions;

  try {
    Deno.writeTextFileSync(
      manifestPath,
      `${JSON.stringify({ ...denoJson, imports, compilerOptions }, null, 2)}\n`,
    );
    const output = await new Deno.Command(Deno.execPath(), {
      args: ["publish", "--dry-run", "--allow-dirty"],
      cwd: root,
      stdout: "inherit",
      stderr: "inherit",
    }).output();
    if (output.code !== 0) {
      throw new Error(`deno publish --dry-run failed with code ${output.code}`);
    }
  } finally {
    Deno.writeTextFileSync(manifestPath, original);
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}
