// App-owned CSS fingerprint. COO-128 (@cookingpot/dashi-css) replaces this file.
const ROOT = import.meta.dirname;
const SOURCE = `${ROOT}/styles.css`;
const GENERATED_DIR = `${ROOT}/generated`;
const MANIFEST = `${ROOT}/styles.json`;

function runCli(outPath: string, watch: boolean): Deno.ChildProcess {
  const args = ["run", "-A"];
  if (watch) {
    args.push("--allow-scripts=npm:@parcel/watcher");
  }
  args.push(
    "npm:@tailwindcss/cli@4",
    "-i",
    SOURCE,
    "-o",
    outPath,
  );
  if (watch) {
    args.push("--watch");
  }
  return new Deno.Command(Deno.execPath(), {
    args,
    stdout: "inherit",
    stderr: "inherit",
    cwd: ROOT,
  }).spawn();
}

async function build(cssPath: string): Promise<void> {
  const bytes = await Deno.readFile(cssPath);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  let binary = "";
  for (const byte of digest) {
    binary += String.fromCharCode(byte);
  }
  const hash = btoa(binary).replaceAll("+", "-").replaceAll("/", "_")
    .replaceAll("=", "");
  const name = `styles-${hash}.css`;
  await Deno.mkdir(GENERATED_DIR, { recursive: true });
  await Deno.writeFile(`${GENERATED_DIR}/${name}`, bytes);
  await Deno.writeTextFile(
    MANIFEST,
    `${JSON.stringify({ href: `/generated/${name}` }, null, 2)}\n`,
  );
  for await (const entry of Deno.readDir(GENERATED_DIR)) {
    if (
      entry.isFile &&
      entry.name.startsWith("styles-") &&
      entry.name.endsWith(".css") &&
      entry.name !== name
    ) {
      await Deno.remove(`${GENERATED_DIR}/${entry.name}`);
    }
  }
}

const tempDir = await Deno.makeTempDir({ prefix: "dashi-styles-" });
const tempPath = `${tempDir}/styles.css`;
const watch = Deno.args.includes("--watch");

if (!watch) {
  const once = runCli(tempPath, false);
  const onceStatus = await once.status;
  if (!onceStatus.success) {
    Deno.exit(onceStatus.code);
  }
  await build(tempPath);
  await Deno.remove(tempDir, { recursive: true });
} else {
  const child = runCli(tempPath, true);
  void child.status.then((status) => Deno.exit(status.code));
  const watcher = Deno.watchFs(tempDir);
  for await (const event of watcher) {
    if (event.kind === "access") {
      continue;
    }
    try {
      await build(tempPath);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }
}
