#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
/**
 * Type-checks the published file set with no import map.
 *
 * Copies `publish.include` into a temp directory, writes a deno.json that
 * keeps name, version, exports, and compilerOptions, and runs `deno check`
 * on each export. Catches bare specifiers that only resolve through the
 * workspace import map, which `deno publish --dry-run` does not graph.
 *
 *   deno run -A scripts/check_published_graph.ts
 */

interface PackedManifest {
  name: string;
  version: string;
  compilerOptions: Record<string, unknown>;
  exports: Record<string, string>;
  include: string[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown, label: string): string[] {
  if (
    !Array.isArray(value) || value.some((entry) => typeof entry !== "string")
  ) {
    throw new Error(`${label} must be an array of strings`);
  }
  return value;
}

function stringRecord(value: unknown, label: string): Record<string, string> {
  if (!isObject(value)) {
    throw new Error(`${label} must be an object`);
  }
  const record: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== "string") {
      throw new Error(`${label}.${key} must be a string`);
    }
    record[key] = entry;
  }
  return record;
}

function readPackedManifest(root: string): PackedManifest {
  const parsed: unknown = JSON.parse(
    Deno.readTextFileSync(`${root}/deno.json`),
  );
  if (!isObject(parsed)) {
    throw new Error(`${root}/deno.json is not an object`);
  }
  if (typeof parsed.name !== "string" || typeof parsed.version !== "string") {
    throw new Error(`${root}/deno.json is missing name or version`);
  }
  if (!isObject(parsed.compilerOptions)) {
    throw new Error(`${root}/deno.json is missing compilerOptions`);
  }
  if (!isObject(parsed.publish)) {
    throw new Error(`${root}/deno.json is missing publish`);
  }
  return {
    name: parsed.name,
    version: parsed.version,
    compilerOptions: parsed.compilerOptions,
    exports: stringRecord(parsed.exports, "exports"),
    include: stringArray(parsed.publish.include, "publish.include"),
  };
}

async function copyDir(src: string, dest: string): Promise<void> {
  await Deno.mkdir(dest, { recursive: true });
  for await (const entry of Deno.readDir(src)) {
    const childSrc = `${src}/${entry.name}`;
    const childDest = `${dest}/${entry.name}`;
    if (entry.isDirectory) {
      await copyDir(childSrc, childDest);
    } else if (entry.isFile) {
      await Deno.copyFile(childSrc, childDest);
    }
  }
}

async function copyPublishedFiles(
  root: string,
  dest: string,
  include: string[],
): Promise<void> {
  for (const entry of include) {
    const src = `${root}/${entry}`;
    const target = `${dest}/${entry}`;
    let stat: Deno.FileInfo;
    try {
      stat = await Deno.stat(src);
    } catch {
      throw new Error(`publish.include entry not found: ${entry}`);
    }
    if (stat.isDirectory) {
      await copyDir(src, target);
    } else if (stat.isFile) {
      const slash = target.lastIndexOf("/");
      if (slash !== -1) {
        await Deno.mkdir(target.slice(0, slash), { recursive: true });
      }
      await Deno.copyFile(src, target);
    } else {
      throw new Error(
        `publish.include entry is not a file or directory: ${entry}`,
      );
    }
  }
}

async function checkPacked(
  cwd: string,
  exports: Record<string, string>,
): Promise<void> {
  const entrypoints = [...new Set(Object.values(exports))];
  const output = await new Deno.Command(Deno.execPath(), {
    args: ["check", ...entrypoints],
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  if (output.code !== 0) {
    throw new Error(`deno check failed with code ${output.code}`);
  }
}

async function main(): Promise<void> {
  const root = Deno.realPathSync(`${import.meta.dirname}/..`);
  const manifest = readPackedManifest(root);
  const dir = await Deno.makeTempDir({ prefix: "dashi-published-" });
  if (dir === root || dir.startsWith(`${root}/`)) {
    throw new Error(`temp dir ${dir} is inside the checkout`);
  }

  let passed = false;
  try {
    await copyPublishedFiles(root, dir, manifest.include);
    const packed = {
      name: manifest.name,
      version: manifest.version,
      exports: manifest.exports,
      compilerOptions: manifest.compilerOptions,
    };
    await Deno.writeTextFile(
      `${dir}/deno.json`,
      `${JSON.stringify(packed, null, 2)}\n`,
    );
    console.log(
      `published graph at ${dir} using ${manifest.name}@${manifest.version}`,
    );
    await checkPacked(dir, manifest.exports);
    passed = true;
  } finally {
    if (passed) {
      await Deno.remove(dir, { recursive: true });
    } else {
      console.error(`published graph left at ${dir}`);
    }
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
