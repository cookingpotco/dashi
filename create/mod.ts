/**
 * @module
 *
 * Scaffolds a fresh Dashi project. Not intended for runtime use.
 */

import pkg from "../deno.json" with { type: "json" };
import { remoteFiles, textFiles } from "./generated_files.ts";

const USAGE = "Usage: deno create jsr:@cookingpot/dashi -- [dir] [--force]";
const ASSETS = new URL("https://dashi.run/");

interface ParsedArgs {
  dir: string | undefined;
  force: boolean;
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

async function writeAppFile(
  targetDir: string,
  rel: string,
  content: string | Uint8Array,
): Promise<void> {
  const slash = rel.lastIndexOf("/");
  if (slash !== -1) {
    await Deno.mkdir(`${targetDir}/${rel.slice(0, slash)}`, {
      recursive: true,
    });
  }
  if (typeof content === "string") {
    await Deno.writeTextFile(`${targetDir}/${rel}`, content);
  } else {
    await Deno.writeFile(`${targetDir}/${rel}`, content);
  }
}

async function fetchAsset(rel: string): Promise<Uint8Array> {
  const url = new URL(rel, ASSETS);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url.href}: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function createApp(targetDir: string, appName: string): Promise<void> {
  const assets = await Promise.all(
    remoteFiles.map(async (rel) => [rel, await fetchAsset(rel)] as const),
  );
  await Deno.mkdir(targetDir, { recursive: true });
  for (const [rel, text] of Object.entries(textFiles)) {
    await writeAppFile(
      targetDir,
      rel,
      text
        .replaceAll("$DASHI_APP_NAME", () => appName)
        .replaceAll("$DASHI_VERSION", () => pkg.version),
    );
  }
  for (const [rel, bytes] of assets) {
    await writeAppFile(targetDir, rel, bytes);
  }
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
