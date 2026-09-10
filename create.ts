/**
 * @module
 *
 * Scaffolds a fresh Dashi project. Not intended for runtime use.
 */

import pkg from "./deno.json" with { type: "json" };

const USAGE = "Usage: deno create jsr:@cookingpot/dashi -- [dir] [--force]";

const TEMPLATE_DIR = new URL("./create/template/", import.meta.url);
const OVERLAY_DIR = new URL("./create/overlay/", import.meta.url);

interface ParsedArgs {
  dir: string | undefined;
  force: boolean;
}

function consumerDenoJson(version: string): Record<string, unknown> {
  return {
    compilerOptions: {
      jsx: "precompile",
      jsxImportSource: "dashi",
      lib: ["dom", "deno.ns", "deno.unstable"],
    },
    unstable: ["bundle", "no-legacy-abort"],
    nodeModulesDir: "auto",
    tasks: {
      css: "deno run -A css.ts",
      "css:watch": "deno run -A css.ts --watch",
      dev: "deno run -A dev.ts",
    },
    imports: {
      dashi: `jsr:@cookingpot/dashi@^${version}`,
      tailwindcss: "npm:tailwindcss@4",
      "@tailwindcss/cli": "npm:@tailwindcss/cli@4",
    },
  };
}

function parseArgs(args: string[]): ParsedArgs {
  let dir: string | undefined;
  let force = false;
  for (const arg of args) {
    if (arg === "--force") {
      force = true;
      continue;
    }
    if (arg.startsWith("-")) {
      console.error(`Unknown flag: ${arg}\n${USAGE}`);
      Deno.exit(1);
    }
    if (dir !== undefined) {
      console.error(`Unexpected argument: ${arg}\n${USAGE}`);
      Deno.exit(1);
    }
    dir = arg;
  }
  return { dir, force };
}

async function promptDir(): Promise<string> {
  const buf = new Uint8Array(4096);
  await Deno.stdout.write(
    new TextEncoder().encode("Where should we create the app? [my-dashi-app] "),
  );
  const n = await Deno.stdin.read(buf);
  if (n === null) {
    Deno.exit(1);
  }
  const answer = new TextDecoder().decode(buf.subarray(0, n)).trim();
  if (answer === "") {
    return "my-dashi-app";
  }
  return answer;
}

async function isNonEmptyDir(path: string): Promise<boolean> {
  try {
    for await (const _entry of Deno.readDir(path)) {
      return true;
    }
    return false;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

async function readBytes(url: URL): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.href}: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function readText(url: URL): Promise<string> {
  return new TextDecoder().decode(await readBytes(url));
}

async function listLocalFiles(dir: URL): Promise<string[]> {
  const files: string[] = [];
  async function walk(url: URL, rel: string): Promise<void> {
    for await (const entry of Deno.readDir(url)) {
      const childRel = rel === "" ? entry.name : `${rel}/${entry.name}`;
      if (entry.isDirectory) {
        await walk(new URL(`${entry.name}/`, url), childRel);
      } else if (entry.isFile) {
        files.push(childRel);
      }
    }
  }
  await walk(dir, "");
  return files;
}

function jsrDirPrefix(dir: URL): string {
  const match = dir.href.match(
    /^https:\/\/jsr\.io\/@[^/]+\/[^/]+\/[^/]+(\/.*)/,
  );
  if (match === null) {
    throw new Error(`Cannot list package files for ${dir.href}`);
  }
  return match[1].replace(/\/?$/, "/");
}

function jsrMetaUrl(dir: URL): URL {
  const match = dir.href.match(
    /^(https:\/\/jsr\.io\/@[^/]+\/[^/]+\/[^/]+)\//,
  );
  if (match === null) {
    throw new Error(`Cannot list package files for ${dir.href}`);
  }
  return new URL(`${match[1]}_meta.json`);
}

async function listJsrFiles(dir: URL): Promise<string[]> {
  const prefix = jsrDirPrefix(dir);
  const metaResponse = await fetch(jsrMetaUrl(dir));
  if (!metaResponse.ok) {
    throw new Error(`Failed to fetch JSR meta: ${metaResponse.status}`);
  }
  const { manifest } = await metaResponse.json() as {
    manifest: Record<string, unknown>;
  };
  const files: string[] = [];
  for (const path of Object.keys(manifest)) {
    if (path.startsWith(prefix) && !path.endsWith("/")) {
      files.push(path.slice(prefix.length));
    }
  }
  if (files.length === 0) {
    throw new Error(`Published package has no files under ${prefix}`);
  }
  return files;
}

async function listFiles(dir: URL): Promise<string[]> {
  if (dir.protocol === "file:") {
    return await listLocalFiles(dir);
  }
  return await listJsrFiles(dir);
}

async function copyDir(src: URL, dest: string): Promise<void> {
  for (const rel of await listFiles(src)) {
    const slash = rel.lastIndexOf("/");
    if (slash !== -1) {
      await Deno.mkdir(`${dest}/${rel.slice(0, slash)}`, { recursive: true });
    }
    await Deno.writeFile(`${dest}/${rel}`, await readBytes(new URL(rel, src)));
  }
}

async function writeDenoJson(targetDir: string): Promise<void> {
  await Deno.writeTextFile(
    `${targetDir}/deno.json`,
    `${JSON.stringify(consumerDenoJson(pkg.version), null, 2)}\n`,
  );
}

async function substituteAppName(
  targetDir: string,
  appName: string,
): Promise<void> {
  const path = `${targetDir}/home/mod.tsx`;
  const text = await Deno.readTextFile(path);
  await Deno.writeTextFile(
    path,
    text.replaceAll("__DASHI_APP_NAME__", appName),
  );
}

async function applyOverlay(targetDir: string): Promise<void> {
  await Deno.writeTextFile(
    `${targetDir}/AGENTS.md`,
    await readText(new URL("AGENTS.md", OVERLAY_DIR)),
  );

  await Deno.writeTextFile(`${targetDir}/CLAUDE.md`, "@AGENTS.md\n");

  const ruleBody = await readText(new URL("app-layout.md", OVERLAY_DIR));
  await Deno.mkdir(`${targetDir}/.cursor/rules`, { recursive: true });
  await Deno.writeTextFile(
    `${targetDir}/.cursor/rules/app-layout.mdc`,
    `---\ndescription: Dashi app layout and conventions\nalwaysApply: true\n---\n\n${ruleBody}`,
  );

  await Deno.mkdir(`${targetDir}/.claude/rules`, { recursive: true });
  await Deno.writeTextFile(
    `${targetDir}/.claude/rules/app-layout.md`,
    `---\nalwaysApply: true\n---\n\n${ruleBody}`,
  );
}

async function createApp(targetDir: string, appName: string): Promise<void> {
  await Deno.mkdir(targetDir, { recursive: true });
  await copyDir(TEMPLATE_DIR, targetDir);
  await writeDenoJson(targetDir);
  await substituteAppName(targetDir, appName);
  await applyOverlay(targetDir);
  let ignore = "";
  try {
    ignore = await Deno.readTextFile(`${targetDir}/.gitignore`);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
    ignore = "generated/\n.deno/\nnode_modules/\n";
  }
  if (!ignore.includes("styles.json")) {
    ignore = `styles.json\n${ignore}`;
  }
  await Deno.writeTextFile(`${targetDir}/.gitignore`, ignore);
}

const COMMAND = "\x1b[34m";
const RESET = "\x1b[0m";
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

async function withLoader(
  label: string,
  work: () => Promise<void>,
): Promise<void> {
  if (!Deno.stdout.isTerminal()) {
    await work();
    return;
  }
  const encode = new TextEncoder();
  let frame = 0;
  const tick = setInterval(() => {
    Deno.stdout.writeSync(encode.encode(`\r${SPINNER[frame]} ${label}`));
    frame = (frame + 1) % SPINNER.length;
  }, 80);
  try {
    await work();
  } finally {
    clearInterval(tick);
    Deno.stdout.writeSync(encode.encode("\r\x1b[K"));
  }
}

function printNextSteps(dirName: string): void {
  console.log(`\n✨ Created ${dirName}\n`);
  console.log(`  ${COMMAND}cd ${dirName}${RESET}`);
  console.log(`  ${COMMAND}deno task dev${RESET}`);
  console.log("\n🌐 Open http://localhost:8000\n");
}

async function main(): Promise<void> {
  const { dir: dirArg, force } = parseArgs(Deno.args);
  const dirInput = dirArg ?? await promptDir();
  const appName = dirInput.split("/").filter(Boolean).at(-1) ?? dirInput;
  const targetDir = dirInput.startsWith("/")
    ? dirInput
    : `${Deno.cwd()}/${dirInput}`;

  if (await isNonEmptyDir(targetDir) && !force) {
    console.error(
      `Directory ${targetDir} is not empty. Pass --force to overwrite files.`,
    );
    Deno.exit(1);
  }

  await withLoader("Creating...", () => createApp(targetDir, appName));
  printNextSteps(dirInput);
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}
