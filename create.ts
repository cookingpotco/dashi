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

async function copyDir(src: URL, dest: string): Promise<void> {
  await Deno.mkdir(dest, { recursive: true });
  for await (const entry of Deno.readDir(src)) {
    const srcPath = new URL(`${entry.name}/`, src);
    const destPath = `${dest}/${entry.name}`;
    if (entry.isDirectory) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile) {
      await Deno.copyFile(new URL(entry.name, src), destPath);
    }
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
  const agents = await Deno.readTextFile(new URL("AGENTS.md", OVERLAY_DIR));
  await Deno.writeTextFile(`${targetDir}/AGENTS.md`, agents);

  await Deno.writeTextFile(`${targetDir}/CLAUDE.md`, "@AGENTS.md\n");

  const ruleBody = await Deno.readTextFile(new URL("app-layout.md", OVERLAY_DIR));
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
  await copyDir(TEMPLATE_DIR, targetDir);
  await writeDenoJson(targetDir);
  await substituteAppName(targetDir, appName);
  await applyOverlay(targetDir);
  const gitignore = `${targetDir}/.gitignore`;
  const ignore = await Deno.readTextFile(gitignore);
  if (!ignore.includes("styles.json")) {
    await Deno.writeTextFile(gitignore, `styles.json\n${ignore}`);
  }
}

const COMMAND = "\x1b[34m";
const RESET = "\x1b[0m";

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

  await createApp(targetDir, appName);
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
