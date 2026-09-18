/** Options for {@linkcode buildCss}. */
export interface BuildCssOptions {
  /** App root directory containing `styles.css`. */
  root: string;
  /** Rebuild on Tailwind output changes. */
  watch?: boolean;
  /** Aborts watch mode when signaled. */
  signal?: AbortSignal;
}

function spawnTailwind(
  root: string,
  source: string,
  outPath: string,
  watch: boolean,
): Deno.ChildProcess {
  const args = ["run", "-A"];
  if (watch) {
    args.push("--allow-scripts=npm:@parcel/watcher");
  }
  args.push(
    "npm:@tailwindcss/cli@4",
    "-i",
    source,
    "-o",
    outPath,
  );
  if (watch) {
    args.push("--watch=always", "--poll");
  }
  return new Deno.Command(Deno.execPath(), {
    args,
    stdout: "inherit",
    stderr: "inherit",
    cwd: root,
  }).spawn();
}

async function hashCss(bytes: Uint8Array): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new Uint8Array(bytes)),
  );
  let binary = "";
  for (const byte of digest) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_")
    .replaceAll("=", "");
}

function manifestHrefValue(parsed: unknown, manifest: string): string {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`Invalid ${manifest}`);
  }
  const href = Reflect.get(parsed, "href");
  if (typeof href !== "string") {
    throw new Error(`Invalid ${manifest}`);
  }
  return href;
}

async function readPreviousHref(manifest: string): Promise<string | undefined> {
  try {
    const text = await Deno.readTextFile(manifest);
    return manifestHrefValue(JSON.parse(text), manifest);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return undefined;
    }
    throw error;
  }
}

async function fingerprint(
  cssPath: string,
  options: {
    watch: boolean;
    generatedDir: string;
    manifest: string;
  },
): Promise<void> {
  const bytes = await Deno.readFile(cssPath);
  if (bytes.length === 0) {
    return;
  }
  const hash = await hashCss(bytes);
  const name = `styles-${hash}.css`;
  const href = `/generated/${name}`;
  const previousHref = await readPreviousHref(options.manifest);
  if (options.watch && previousHref === href) {
    return;
  }
  await Deno.mkdir(options.generatedDir, { recursive: true });
  await Deno.writeFile(`${options.generatedDir}/${name}`, bytes);
  await Deno.writeTextFile(
    options.manifest,
    `${JSON.stringify({ href }, null, 2)}\n`,
  );
  const keep = new Set([name]);
  if (
    options.watch &&
    previousHref !== undefined &&
    previousHref !== href
  ) {
    keep.add(previousHref.replace(/^\/generated\//, ""));
  }
  for await (const entry of Deno.readDir(options.generatedDir)) {
    if (
      entry.isFile &&
      entry.name.startsWith("styles-") &&
      entry.name.endsWith(".css") &&
      !keep.has(entry.name)
    ) {
      await Deno.remove(`${options.generatedDir}/${entry.name}`);
    }
  }
  if (options.watch && previousHref !== href) {
    console.log(`[css] ${href}`);
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function abortWhenSignaled(signal?: AbortSignal): Promise<never> {
  if (signal === undefined) {
    return new Promise(() => {});
  }
  if (signal.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }
  return new Promise((_, reject) => {
    signal.addEventListener("abort", () => {
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

async function waitForFirstFingerprint(
  outPath: string,
  fingerprintCss: () => Promise<void>,
  signal?: AbortSignal,
): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    throwIfAborted(signal);
    try {
      await Deno.stat(outPath);
      await fingerprintCss();
      return;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Timed out waiting for Tailwind output");
}

async function watchFingerprints(
  watcher: Deno.FsWatcher,
  fingerprintCss: () => Promise<void>,
  signal?: AbortSignal,
): Promise<void> {
  for await (const event of watcher) {
    throwIfAborted(signal);
    if (event.kind === "access") {
      continue;
    }
    await fingerprintCss();
  }
}

async function maybeFingerprint(
  outPath: string,
  generatedDir: string,
  manifest: string,
): Promise<void> {
  try {
    await fingerprint(outPath, { watch: true, generatedDir, manifest });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return;
    }
    throw error;
  }
}

async function watchBuildCss(options: {
  root: string;
  source: string;
  generatedDir: string;
  manifest: string;
  tempDir: string;
  outPath: string;
  signal?: AbortSignal;
}): Promise<void> {
  const watcher = Deno.watchFs(options.tempDir);
  const tailwind = spawnTailwind(
    options.root,
    options.source,
    options.outPath,
    true,
  );
  const fingerprintCss = () =>
    maybeFingerprint(options.outPath, options.generatedDir, options.manifest);

  try {
    await Promise.race([
      (async () => {
        await waitForFirstFingerprint(
          options.outPath,
          fingerprintCss,
          options.signal,
        );
        await watchFingerprints(watcher, fingerprintCss, options.signal);
      })(),
      tailwind.status.then((status) => {
        if (options.signal?.aborted) {
          return;
        }
        if (!status.success) {
          throw new Error(`Tailwind CLI exited with code ${status.code}`);
        }
      }),
      abortWhenSignaled(options.signal),
    ]);
  } finally {
    try {
      tailwind.kill();
    } catch {
      // already exited
    }
    try {
      watcher.close();
    } catch {
      // already closed
    }
    try {
      await Deno.remove(options.tempDir, { recursive: true });
    } catch {
      // already removed
    }
  }
}

/**
 * Runs the Tailwind CLI and writes a fingerprinted stylesheet manifest.
 *
 * @param options Root directory, watch flag, and optional abort signal.
 * @see https://dashi.run/docs/styling#buildcss
 */
export async function buildCss(options: BuildCssOptions): Promise<void> {
  throwIfAborted(options.signal);
  const root = options.root;
  const watch = options.watch === true;
  const source = `${root}/styles.css`;
  const generatedDir = `${root}/generated`;
  const manifest = `${generatedDir}/styles.json`;
  const tempDir = await Deno.makeTempDir({ prefix: "dashi-styles-" });
  const outPath = `${tempDir}/styles.css`;

  if (!watch) {
    const child = spawnTailwind(root, source, outPath, false);
    const status = await child.status;
    if (!status.success) {
      throw new Error(`Tailwind CLI exited with code ${status.code}`);
    }
    try {
      await fingerprint(outPath, { watch: false, generatedDir, manifest });
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
    return;
  }

  await watchBuildCss({
    root,
    source,
    generatedDir,
    manifest,
    tempDir,
    outPath,
    signal: options.signal,
  });
}
