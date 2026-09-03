const ROOT = import.meta.dirname;
const SOURCE = `${ROOT}/styles.css`;
const STATIC_DIR = `${ROOT}/static`;
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

async function fingerprint(cssPath: string): Promise<void> {
  const bytes = await Deno.readFile(cssPath);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  let binary = "";
  for (const byte of digest) {
    binary += String.fromCharCode(byte);
  }
  const hash = btoa(binary).replaceAll("+", "-").replaceAll("/", "_")
    .replaceAll("=", "");
  const name = `styles-${hash}.css`;
  await Deno.mkdir(STATIC_DIR, { recursive: true });
  await Deno.writeFile(`${STATIC_DIR}/${name}`, bytes);
  await Deno.writeTextFile(
    MANIFEST,
    `${JSON.stringify({ href: `/static/${name}` }, null, 2)}\n`,
  );
  for await (const entry of Deno.readDir(STATIC_DIR)) {
    if (
      entry.isFile &&
      entry.name.startsWith("styles-") &&
      entry.name.endsWith(".css") &&
      entry.name !== name
    ) {
      await Deno.remove(`${STATIC_DIR}/${entry.name}`);
    }
  }
}

if (import.meta.main) {
  const tempDir = await Deno.makeTempDir({ prefix: "dashi-styles-" });
  const tempPath = `${tempDir}/styles.css`;
  const watch = Deno.args.includes("--watch");

  if (!watch) {
    const once = runCli(tempPath, false);
    const onceStatus = await once.status;
    if (!onceStatus.success) {
      Deno.exit(onceStatus.code);
    }
    await fingerprint(tempPath);
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
        await fingerprint(tempPath);
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
          throw error;
        }
      }
    }
  }
}
